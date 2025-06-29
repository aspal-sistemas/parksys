import bcrypt from 'bcryptjs';
import { db } from '../db';
import { 
  auditLogs, 
  loginAttempts, 
  accountLockouts, 
  userActivityLogs,
  passwordResetTokens,
  type InsertAuditLog,
  type InsertLoginAttempt,
  type InsertAccountLockout,
  type InsertUserActivityLog
} from '../../shared/security-schema';
import { users } from '../../shared/schema';
import { eq, and, desc, gte, count, sql } from 'drizzle-orm';

// Configuración de seguridad
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  PASSWORD_RESET_TOKEN_EXPIRY_MINUTES: 30,
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_HISTORY_COUNT: 5,
  SESSION_TIMEOUT_MINUTES: 120
};

export class SecurityService {
  // Registrar intento de login
  static async logLoginAttempt(
    username: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    failureReason?: string
  ): Promise<void> {
    try {
      await db.insert(loginAttempts).values({
        username,
        ipAddress,
        userAgent,
        success,
        failureReason
      });

      // Si es fallido, verificar si necesitamos bloquear la cuenta
      if (!success) {
        await this.checkAndLockAccount(username, ipAddress);
      }
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  // Verificar si una cuenta está bloqueada
  static async isAccountLocked(username: string): Promise<boolean> {
    try {
      const now = new Date();
      const activeLockout = await db
        .select()
        .from(accountLockouts)
        .where(
          and(
            eq(accountLockouts.username, username),
            eq(accountLockouts.isActive, true),
            gte(accountLockouts.lockedUntil, now)
          )
        )
        .limit(1);

      return activeLockout.length > 0;
    } catch (error) {
      console.error('Error checking account lockout:', error);
      return false;
    }
  }

  // Verificar y bloquear cuenta si es necesario
  static async checkAndLockAccount(username: string, ipAddress: string): Promise<void> {
    try {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      // Contar intentos fallidos en los últimos 15 minutos
      const recentFailures = await db
        .select({ count: count() })
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.username, username),
            eq(loginAttempts.success, false),
            gte(loginAttempts.attemptedAt, fifteenMinutesAgo)
          )
        );

      const failureCount = recentFailures[0]?.count || 0;

      if (failureCount >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = new Date(
          now.getTime() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000
        );

        await db.insert(accountLockouts).values({
          username,
          ipAddress,
          lockedUntil: lockoutUntil,
          attemptCount: failureCount,
          isActive: true
        });

        // Log de auditoría
        await this.logActivity({
          username,
          action: 'account_locked',
          ipAddress,
          success: false,
          details: { reason: 'max_login_attempts_exceeded', attemptCount: failureCount }
        });
      }
    } catch (error) {
      console.error('Error checking/locking account:', error);
    }
  }

  // Desbloquear cuenta manualmente
  static async unlockAccount(username: string): Promise<boolean> {
    try {
      await db
        .update(accountLockouts)
        .set({ isActive: false })
        .where(
          and(
            eq(accountLockouts.username, username),
            eq(accountLockouts.isActive, true)
          )
        );

      // Log de auditoría
      await this.logActivity({
        username,
        action: 'account_unlocked_manually',
        success: true,
        details: { unlocked_by: 'admin' }
      });

      return true;
    } catch (error) {
      console.error('Error unlocking account:', error);
      return false;
    }
  }

  // Registrar actividad de auditoría
  static async logActivity(data: Partial<InsertAuditLog>): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        ...data,
        timestamp: new Date()
      } as InsertAuditLog);
    } catch (error) {
      console.error('Error logging audit activity:', error);
    }
  }

  // Registrar actividad de usuario
  static async logUserActivity(data: Partial<InsertUserActivityLog>): Promise<void> {
    try {
      await db.insert(userActivityLogs).values({
        ...data,
        timestamp: new Date()
      } as InsertUserActivityLog);
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }

  // Obtener actividad de usuario con paginación
  static async getUserActivity(
    userId: number,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const offset = (page - 1) * limit;
      
      const activities = await db
        .select()
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, userId))
        .orderBy(desc(userActivityLogs.timestamp))
        .limit(limit)
        .offset(offset);

      const totalCount = await db
        .select({ count: count() })
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, userId));

      return {
        activities,
        total: totalCount[0]?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting user activity:', error);
      return { activities: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  }

  // Cambiar contraseña
  static async changePassword(
    userId: number,
    username: string,
    currentPassword: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener usuario actual
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user[0].password);
      if (!isCurrentPasswordValid) {
        await this.logUserActivity({
          userId,
          username,
          action: 'password_change_failed',
          ipAddress,
          userAgent,
          success: false,
          details: { reason: 'invalid_current_password' }
        });
        return { success: false, message: 'Contraseña actual incorrecta' };
      }

      // Validar nueva contraseña
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message };
      }

      // Hash nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña
      await db
        .update(users)
        .set({ password: hashedNewPassword })
        .where(eq(users.id, userId));

      // Log de actividad exitosa
      await this.logUserActivity({
        userId,
        username,
        action: 'password_changed',
        ipAddress,
        userAgent,
        success: true,
        details: { changed_at: new Date() }
      });

      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  // Validar fortaleza de contraseña
  static validatePassword(password: string): { isValid: boolean; message: string; strength: string } {
    if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
      return {
        isValid: false,
        message: `La contraseña debe tener al menos ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} caracteres`,
        strength: 'weak'
      };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos una letra mayúscula', strength };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos una letra minúscula', strength };
    }
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos un número', strength };
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos un carácter especial', strength };
    }

    return { isValid: true, message: 'Contraseña válida', strength };
  }

  // Obtener estadísticas de seguridad (para admin)
  static async getSecurityStats(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Total de logins
      const totalLogins = await db
        .select({ count: count() })
        .from(loginAttempts)
        .where(gte(loginAttempts.attemptedAt, startDate));

      // Logins exitosos
      const successfulLogins = await db
        .select({ count: count() })
        .from(loginAttempts)
        .where(
          and(
            gte(loginAttempts.attemptedAt, startDate),
            eq(loginAttempts.success, true)
          )
        );

      // Logins fallidos
      const failedLogins = await db
        .select({ count: count() })
        .from(loginAttempts)
        .where(
          and(
            gte(loginAttempts.attemptedAt, startDate),
            eq(loginAttempts.success, false)
          )
        );

      // Cuentas bloqueadas activas
      const now = new Date();
      const activeLockouts = await db
        .select({ count: count() })
        .from(accountLockouts)
        .where(
          and(
            eq(accountLockouts.isActive, true),
            gte(accountLockouts.lockedUntil, now)
          )
        );

      // Usuarios únicos activos
      const activeUsers = await db
        .select({ count: sql`COUNT(DISTINCT ${loginAttempts.username})` })
        .from(loginAttempts)
        .where(
          and(
            gte(loginAttempts.attemptedAt, startDate),
            eq(loginAttempts.success, true)
          )
        );

      const total = totalLogins[0]?.count || 0;
      const successful = successfulLogins[0]?.count || 0;
      const failed = failedLogins[0]?.count || 0;
      const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0';

      return {
        totalLogins: total,
        successfulLogins: successful,
        failedLogins: failed,
        successRate: parseFloat(successRate),
        activeLockouts: activeLockouts[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting security stats:', error);
      return {
        totalLogins: 0,
        successfulLogins: 0,
        failedLogins: 0,
        successRate: 0,
        activeLockouts: 0,
        activeUsers: 0
      };
    }
  }

  // Obtener actividad sospechosa (para admin)
  static async getSuspiciousActivity(hours: number = 24) {
    try {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      const suspiciousActivities = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            gte(loginAttempts.attemptedAt, startDate),
            eq(loginAttempts.success, false)
          )
        )
        .orderBy(desc(loginAttempts.attemptedAt))
        .limit(50);

      return suspiciousActivities;
    } catch (error) {
      console.error('Error getting suspicious activity:', error);
      return [];
    }
  }
}