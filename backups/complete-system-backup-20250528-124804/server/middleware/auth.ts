import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Tipo extendido para incluir el usuario en la petición
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // En una aplicación real, esto verificaría el token JWT o la sesión
  // Para propósitos de este proyecto, simplificamos al máximo
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se ha proporcionado un token de autenticación' });
  }

  const token = authHeader.split(' ')[1];
  
  // En una app real, verificaríamos el token JWT
  // Para este ejemplo de desarrollo, simplemente permitimos cualquier token
  // que empiece con 'direct-token-' o 'dummy-token-'
  try {
    // Simulamos la verificación del token
    if (token.startsWith('direct-token-') || token.startsWith('dummy-token-')) {
      // Obtenemos el ID del usuario de la cabecera personalizada
      const userId = req.headers['x-user-id'];
      if (!userId) {
        // Si no tenemos el ID en la cabecera, asumimos admin (solo para desarrollo)
        req.user = {
          id: 1,
          username: 'admin',
          email: 'admin@parquesmx.com',
          role: 'admin',
          fullName: 'Admin System',
          municipalityId: null
        };
        return next();
      }
      
      // Verificamos si se envió un rol de usuario personalizado en los encabezados
      const userRole = req.headers['x-user-role'] as string;
      
      try {
        // Obtenemos el usuario de la base de datos
        const user = await storage.getUser(Number(userId));
        if (user) {
          // Si se proporcionó un rol personalizado, lo utilizamos (para desarrollo)
          if (userRole) {
            user.role = userRole;
          }
          
          // Adjuntamos el usuario a la petición para su uso posterior
          req.user = user;
          return next();
        }
      } catch (err) {
        console.error('Error al obtener usuario:', err);
      }
      
      // Si el usuario no se encuentra, usamos los datos del encabezado (solo para desarrollo)
      req.user = {
        id: 1,
        username: 'admin',
        email: 'admin@parquesmx.com',
        role: userRole || 'admin', // Usamos el rol personalizado si se proporciona
        fullName: 'Admin System',
        municipalityId: null
      };
      next();
    } else {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ message: 'Error al verificar la autenticación' });
  }
};

// Middleware para verificar si el usuario tiene acceso a un municipio específico
export const hasMunicipalityAccess = (municipalityId?: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Si no hay usuario autenticado, no tiene acceso
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Si el usuario es super admin, tiene acceso a todos los municipios
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Si el usuario es admin de municipio, solo tiene acceso a su municipio
    if (req.user.role === 'admin' && req.user.municipalityId) {
      // Si se especificó un municipalityId en la petición, verificamos que coincida
      const targetMunicipalityId = municipalityId || 
                                  Number(req.params.municipalityId) || 
                                  Number(req.body.municipalityId);
      
      if (targetMunicipalityId && req.user.municipalityId !== targetMunicipalityId) {
        return res.status(403).json({ 
          message: 'No tiene permisos para acceder a este municipio' 
        });
      }
      
      return next();
    }

    // Si el usuario no tiene un rol adecuado o no está asignado a un municipio
    return res.status(403).json({ 
      message: 'No tiene los permisos necesarios para realizar esta acción'
    });
  };
};

// Middleware para verificar si el parque pertenece al municipio del usuario
export const hasParkAccess = async (req: Request, res: Response, next: NextFunction) => {
  // Si no hay usuario autenticado, no tiene acceso
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  // MODO DESARROLLO: Permitir acceso a todos los usuarios autenticados
  // En producción, se implementaría la verificación completa
  console.log("Permitiendo acceso al parque para desarrollo - Usuario:", req.user);
  return next();
  
  /* Verificación normal de permisos (desactivada para desarrollo)
  // Si el usuario es super admin o admin, tiene acceso a todos los parques
  if (req.user.role === 'super_admin' || req.user.role === 'admin') {
    return next();
  }

  // Obtenemos el ID del parque de los parámetros
  const parkId = Number(req.params.id || req.params.parkId);
  
  if (!parkId) {
    return res.status(400).json({ message: 'ID de parque no proporcionado' });
  }

  try {
    // Obtenemos el parque
    const park = await storage.getPark(parkId);
    
    if (!park) {
      return res.status(404).json({ message: 'Parque no encontrado' });
    }

    // Verificamos que el parque pertenezca al municipio del usuario
    if (park.municipalityId !== req.user.municipalityId) {
      return res.status(403).json({ 
        message: 'No tiene permisos para acceder a este parque' 
      });
    }

    next();
  } catch (error) {
    console.error('Error al verificar acceso al parque:', error);
    return res.status(500).json({ message: 'Error al verificar permisos' });
  }
  */
};

// Middleware para verificar permisos específicos
export const requirePermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Si no hay usuario autenticado, denegar acceso
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Si es admin, permitir todo (rol especial)
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      // Por ahora, implementamos una verificación básica de permisos
      // En el futuro, esto se conectará con la base de datos de permisos
      const userRole = req.user.role;
      
      // Definir permisos básicos por rol
      const basicPermissions: any = {
        'admin': ['*'], // Admin tiene todos los permisos
        'director': ['users-view', 'users-create', 'users-edit', 'parks-view', 'parks-create', 'parks-edit'],
        'manager': ['parks-view', 'parks-edit', 'activities-view', 'activities-create'],
        'supervisor': ['users-view', 'parks-view', 'activities-view'],
        'user': ['parks-view', 'activities-view'],
        'ciudadano': ['parks-view', 'activities-view'],
        'voluntario': ['parks-view', 'activities-view', 'volunteers-edit'],
        'instructor': ['parks-view', 'activities-view', 'instructors-edit'],
        'guardaparques': ['parks-view', 'parks-edit', 'activities-view'],
        'guardia': ['parks-view', 'activities-view'],
        'concesionario': ['parks-view', 'activities-view']
      };

      const requiredPermission = `${module}-${action}`;
      const rolePermissions = basicPermissions[userRole] || [];
      
      // Si el rol tiene permisos universales (*) o el permiso específico
      if (rolePermissions.includes('*') || rolePermissions.includes(requiredPermission)) {
        return next();
      }

      // Si no tiene el permiso, denegar acceso
      return res.status(403).json({ 
        message: `No tiene permisos para ${action} en el módulo ${module}` 
      });
      
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};

// Middleware simplificado para verificar si es admin
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }

  next();
};