import { storage } from "./storage";

/**
 * Función que autentica al usuario directamente
 * para simplificar la autenticación en el entorno de desarrollo
 */
export async function authenticateUser(username: string, password: string) {
  try {
    console.log(`Intentando autenticar al usuario: ${username}`);
    
    // Verificar si es uno de los usuarios de prueba preconfigurados
    const testUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@parquesmx.com',
        fullName: 'Administrador',
        role: 'admin',
        municipalityId: null
      },
      {
        id: 2,
        username: 'guadalajara',
        password: 'parks123',
        email: 'parques@guadalajara.gob.mx',
        fullName: 'Municipio de Guadalajara',
        role: 'municipality',
        municipalityId: 1
      }
    ];

    // Primero buscar en usuarios de prueba
    let user = testUsers.find(u => u.username === username && u.password === password);
    
    // Si no se encuentra en los usuarios de prueba, buscar en la base de datos
    if (!user) {
      console.log("Usuario no encontrado en la lista de prueba, buscando en la base de datos...");
      
      // Intentar buscar por nombre de usuario
      let dbUser = await storage.getUserByUsername(username);
      
      // Si no se encuentra por nombre de usuario, intentar buscar por email
      if (!dbUser) {
        console.log("Usuario no encontrado por username, intentando con email...");
        dbUser = await storage.getUserByEmail(username);
      }
      
      if (dbUser) {
        console.log("Usuario encontrado en la base de datos:", dbUser.username);
        
        // Verificar si la contraseña coincide
        if (dbUser.password === password) {
          console.log("Contraseña correcta, autenticación exitosa");
          user = dbUser;
        } else {
          console.log("La contraseña no coincide");
        }
      } else {
        console.log("Usuario no encontrado en la base de datos");
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