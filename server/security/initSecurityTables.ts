import { db } from '../db';
import { 
  auditLogs, 
  loginAttempts, 
  accountLockouts, 
  passwordResetTokens, 
  userActivityLogs 
} from '../../shared/security-schema';

export async function initSecurityTables(): Promise<void> {
  try {
    console.log('🔒 Inicializando tablas del módulo de seguridad...');

    // Crear las tablas usando Drizzle (esto es para asegurar que existan)
    // En producción, estas tablas deberían crearse con migraciones
    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        username TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        details JSONB,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        failure_reason TEXT,
        attempted_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS account_lockouts (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        locked_at TIMESTAMP DEFAULT NOW() NOT NULL,
        locked_until TIMESTAMP NOT NULL,
        attempt_count INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        username TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        details JSONB,
        success BOOLEAN NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Crear índices para mejorar el rendimiento
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON login_attempts(attempted_at);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_account_lockouts_username ON account_lockouts(username);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_account_lockouts_active ON account_lockouts(is_active);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_logs(user_id);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity_logs(timestamp);
    `);

    console.log('✅ Tablas del módulo de seguridad inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error inicializando tablas de seguridad:', error);
    throw error;
  }
}

export async function seedSecurityData(): Promise<void> {
  try {
    console.log('🔒 Agregando datos de prueba del módulo de seguridad...');

    // Insertar algunos logs de actividad de muestra para demostración
    await db.insert(userActivityLogs).values([
      {
        userId: 1,
        username: 'admin',
        action: 'login',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        details: { location: 'Guadalajara, MX' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
      },
      {
        userId: 1,
        username: 'admin',
        action: 'view_dashboard',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        details: { module: 'admin_dashboard' },
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1.5 horas atrás
      },
      {
        userId: 1,
        username: 'admin',
        action: 'password_changed',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        details: { reason: 'user_request' },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hora atrás
      }
    ]);

    // Insertar algunos intentos de login (exitosos y fallidos)
    await db.insert(loginAttempts).values([
      {
        username: 'admin',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        attemptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        username: 'user_test',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: false,
        failureReason: 'invalid_password',
        attemptedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
      },
      {
        username: 'user_test',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: true,
        attemptedAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutos atrás
      }
    ]);

    console.log('✅ Datos de prueba del módulo de seguridad agregados correctamente');
  } catch (error) {
    console.error('❌ Error agregando datos de prueba de seguridad:', error);
    // No lanzamos el error para que no bloquee la inicialización
  }
}