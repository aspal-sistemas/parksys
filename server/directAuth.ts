import { storage } from "./storage";
import bcrypt from "bcryptjs";

/**
 * Función que autentica al usuario directamente
 * para simplificar la autenticación en el entorno de desarrollo
 */
export async function authenticateUser(username: string, password: string) {
  try {
    console.log(`Intentando autenticar al usuario: ${username}`);
    
    // Buscar directamente en la base de datos para obtener datos actualizados
    console.log("Buscando usuario en la base de datos...");
    
    // Intentar buscar por nombre de usuario
    let dbUser = await storage.getUserByUsername(username);
    
    // Si no se encuentra por nombre de usuario, intentar buscar por email
    if (!dbUser) {
      console.log("Usuario no encontrado por username, intentando con email...");
      dbUser = await storage.getUserByEmail(username);
    }
    
    let user = null;
    
    if (dbUser) {
      console.log("Usuario encontrado en la base de datos:", dbUser.username);
        
      // Verificar si la contraseña coincide usando bcrypt
      const passwordMatch = await bcrypt.compare(password, dbUser.password);
      if (passwordMatch) {
        console.log("Contraseña correcta, autenticación exitosa");
        user = dbUser;
      } else {
        console.log("La contraseña no coincide");
      }
    } else {
      console.log("Usuario no encontrado en la base de datos");
      
      // Como fallback para desarrollo, permitir usuarios básicos
      if (username === 'admin' && password === 'admin123') {
        user = {
          id: 1,
          username: 'admin',
          password: 'admin123',
          email: 'admin@bosquesurbanos.gob.mx',
          fullName: 'Admin System',
          role: 'super_admin',
          municipalityId: 2,
          phone: null,
          gender: null,
          birthDate: null,
          bio: null,
          profileImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    }

    if (!user) {
      console.log('Credenciales inválidas:', username);
      return { success: false, message: 'Credenciales inválidas' };
    }

    // Datos de municipio para el usuario si es necesario
    let municipalityData = null;
    if (user.municipalityId) {
      municipalityData = {
        id: 1,
        name: 'Guadalajara',
        state: 'Jalisco',
        logoUrl: null
      };
    }
    
    console.log('Usuario autenticado:', user.username);
    return {
      success: true,
      data: {
        user: {
          ...user,
          municipality: municipalityData
        },
        token: 'direct-token-' + Date.now()
      }
    };
  } catch (error) {
    console.error('Error en authenticateUser:', error);
    return { success: false, message: 'Error durante la autenticación' };
  }
}