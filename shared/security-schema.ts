import { pgTable, serial, integer, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla de logs de auditoría
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: text("username"),
  action: text("action").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Intentos de login
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull()
});

// Bloqueos de cuenta
export const accountLockouts = pgTable("account_lockouts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  ipAddress: text("ip_address").notNull(),
  lockedAt: timestamp("locked_at").defaultNow().notNull(),
  lockedUntil: timestamp("locked_until").notNull(),
  attemptCount: integer("attempt_count").notNull(),
  isActive: boolean("is_active").default(true).notNull()
});

// Tokens de recuperación de contraseña
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Logs de actividad de usuario
export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: text("username"),
  action: text("action").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  success: boolean("success").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Esquemas Zod para validación
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertLoginAttemptSchema = createInsertSchema(loginAttempts);
export const insertAccountLockoutSchema = createInsertSchema(accountLockouts);
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs);

// Tipos TypeScript
export type AuditLog = typeof auditLogs.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type AccountLockout = typeof accountLockouts.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;
export type InsertAccountLockout = z.infer<typeof insertAccountLockoutSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;

// Esquemas de validación para el frontend
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Contraseña actual requerida"),
  newPassword: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/(?=.*[a-z])/, "Debe contener al menos una letra minúscula")
    .regex(/(?=.*[A-Z])/, "Debe contener al menos una letra mayúscula")
    .regex(/(?=.*\d)/, "Debe contener al menos un número")
    .regex(/(?=.*[^A-Za-z0-9])/, "Debe contener al menos un carácter especial"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export const unlockAccountSchema = z.object({
  username: z.string().min(1, "Username requerido")
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UnlockAccountData = z.infer<typeof unlockAccountSchema>;