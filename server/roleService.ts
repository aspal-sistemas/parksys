import { db } from './db';
import { roles, users } from '../shared/schema';
import { eq, asc } from 'drizzle-orm';
import type { Role, User } from '../shared/schema';

export class RoleService {
  
  // Obtener todos los roles ordenados por nivel jerárquico
  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(asc(roles.level));
  }

  // Obtener rol por ID
  async getRoleById(id: number): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.id, id));
    return result[0] || null;
  }

  // Obtener rol por slug
  async getRoleBySlug(slug: string): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.slug, slug));
    return result[0] || null;
  }

  // Verificar si un usuario tiene un nivel de rol específico o superior
  async hasRoleLevel(userId: number, requiredLevel: number): Promise<boolean> {
    const result = await db
      .select({ level: roles.level })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId));
    
    if (!result[0]) return false;
    
    // Niveles más bajos tienen mayor autoridad (1 = Super Admin, 7 = Consultor)
    return result[0].level <= requiredLevel;
  }

  // Verificar si un usuario tiene una permiso específico
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    const result = await db
      .select({ permissions: roles.permissions })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId));
    
    if (!result[0]) return false;
    
    const permissions = result[0].permissions as Record<string, any>;
    
    // Super Admin tiene todos los permisos
    if (permissions.all === true) return true;
    
    // Verificar permiso específico
    return this.checkPermissionInObject(permissions, permission);
  }

  // Método privado para verificar permisos anidados
  private checkPermissionInObject(permissions: Record<string, any>, permission: string): boolean {
    const parts = permission.split('.');
    let current: any = permissions;
    
    for (const part of parts) {
      if (current[part] === undefined) return false;
      if (current[part] === true) return true;
      if (typeof current[part] === 'object' && current[part] !== null) {
        current = current[part];
      } else {
        return false;
      }
    }
    
    return current === true;
  }

  // Obtener usuario con rol
  async getUserWithRole(userId: number): Promise<(User & { userRole?: Role }) | null> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId));
    
    if (!result[0]) return null;
    
    const { users: user, roles: role } = result[0];
    return {
      ...user,
      userRole: role || undefined
    };
  }

  // Asignar rol a usuario
  async assignRole(userId: number, roleId: number): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ roleId, updatedAt: new Date() })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Error asignando rol:', error);
      return false;
    }
  }

  // Obtener todos los usuarios con sus roles
  async getUsersWithRoles(): Promise<(User & { userRole?: Role })[]> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .orderBy(asc(users.fullName));
    
    return result.map(({ users: user, roles: role }) => ({
      ...user,
      userRole: role || undefined
    }));
  }
}

export const roleService = new RoleService();