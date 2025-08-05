/**
 * Script para actualizar habilidades de voluntarios directamente usando Fetch
 */
const fetch = require('node-fetch');

async function updateSkillsViaApi() {
  try {
    // ID del voluntario - ajusta según el usuario que estés probando
    const volunteerId = 11;
    
    // Nuevas habilidades a establecer
    const newSkills = "Educación ambiental, atención a visitantes, cuidado de flora";
    
    console.log(`Actualizando habilidades para voluntario ID: ${volunteerId}`);
    console.log(`Nuevas habilidades: "${newSkills}"`);
    
    // Llamar a la API
    const response = await fetch(`http://localhost:5000/api/direct/volunteers/skills/${volunteerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills: newSkills })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Habilidades actualizadas correctamente');
      console.log('Respuesta:', data);
    } else {
      console.error('❌ Error al actualizar habilidades');
      console.error('Respuesta de error:', data);
    }
  } catch (error) {
    console.error('Error de conexión:', error.message);
  }
}

// Ejecutar la función
updateSkillsViaApi();