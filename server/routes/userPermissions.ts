import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Endpoint para obtener los permisos del usuario actual
router.get('/user-permissions', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || !user.role) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    console.log(`🔐 Obteniendo permisos para usuario ${user.username} con rol ${user.role}`);

    // Obtener todos los permisos de roles
    const allPermissions = await storage.getRolePermissions();
    
    // Obtener permisos específicos del rol del usuario
    const userPermissions = allPermissions[user.role] || {};

    console.log(`✅ Permisos encontrados para ${user.role}:`, Object.keys(userPermissions).length, 'permisos');

    res.json(userPermissions);
  } catch (error) {
    console.error('Error obteniendo permisos del usuario:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Endpoint para verificar un permiso específico
router.post('/check-permission', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const { module, action = 'view', submodule } = req.body;
    
    if (!user || !user.role) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Super admin y admin tienen todos los permisos
    if (user.role === 'super_admin' || user.role === 'admin') {
      return res.json({ hasPermission: true, reason: 'admin_role' });
    }

    // Obtener permisos del rol
    const allPermissions = await storage.getRolePermissions();
    const rolePermissions = allPermissions[user.role] || {};

    const permissionKey = submodule 
      ? `${module}.${submodule}.${action}` 
      : `${module}.${action}`;

    const hasPermission = rolePermissions[permissionKey] || false;

    res.json({ 
      hasPermission,
      permissionKey,
      role: user.role,
      reason: hasPermission ? 'permission_granted' : 'permission_denied'
    });
  } catch (error) {
    console.error('Error verificando permiso:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;