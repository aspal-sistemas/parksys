/**
 * Script para probar el nuevo endpoint especializado para actualizar habilidades
 * 
 * Este script permite actualizar directamente las habilidades de un voluntario
 * a través del nuevo endpoint personalizado.
 */

import fetch from 'node-fetch';

async function testSkillsEndpoint() {
  try {
    // ID del voluntario (ajusta según sea necesario)
    const volunteerId = 11;
    
    // Nuevas habilidades a establecer
    const newSkills = "Atención al público, primeros auxilios, educación ambiental";
    
    console.log(`⚡ Probando endpoint especializado para voluntario ID ${volunteerId}`);
    console.log(`📋 Nuevas habilidades: "${newSkills}"`);
    
    // Usar el nuevo endpoint especializado
    const response = await fetch(`http://localhost:5000/api/volunteers/${volunteerId}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills: newSkills })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente');
      console.log('Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Error en el endpoint');
      console.error('Respuesta de error:', data);
    }
  } catch (error) {
    console.error('Error de conexión:', error.message);
  }
}

// Ejecutar la prueba
testSkillsEndpoint();