/**
 * Función que autentica al usuario directamente sin usar el ORM
 * para simplificar la autenticación en el entorno de desarrollo
 */
export async function authenticateUser(username: string, password: string) {
  try {
    // Verificación de credenciales para desarrollo - en memoria
    // Esto es solo para desarrollo, en producción se usaría una verificación adecuada
    const users = [
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

    // Buscar usuario por credenciales
    const user = users.find(u => u.username === username && u.password === password);

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