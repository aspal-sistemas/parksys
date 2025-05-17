import { pool } from './db';

/**
 * Función que autentica al usuario directamente con la base de datos
 * sin pasar por el ORM para evitar conflictos con el esquema
 */
export async function authenticateUser(username: string, password: string) {
  try {
    // Consulta directa a la base de datos
    const userResult = await pool.query(
      'SELECT id, username, email, full_name, role, municipality_id FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (userResult.rows.length === 0) {
      return { success: false, message: 'Credenciales inválidas' };
    }

    const userData = userResult.rows[0];
    
    // Si el usuario pertenece a un municipio, obtenemos su información
    let municipalityData = null;
    if (userData.municipality_id) {
      const municipalityResult = await pool.query(
        'SELECT id, name, state, logo_url FROM municipalities WHERE id = $1',
        [userData.municipality_id]
      );
      
      if (municipalityResult.rows.length > 0) {
        const municipality = municipalityResult.rows[0];
        municipalityData = {
          id: municipality.id,
          name: municipality.name,
          state: municipality.state,
          logoUrl: municipality.logo_url
        };
      }
    }
    
    // Convertimos a camelCase para mantener consistencia
    const user = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.full_name,
      role: userData.role,
      municipalityId: userData.municipality_id
    };
    
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