/**
 * Script para probar la actualización de todos los campos del voluntario
 * a través de la nueva ruta dedicada
 */

import axios from 'axios';

async function testUpdateFields() {
  try {
    const voluntarioDePrueba = {
      // ID del voluntario a actualizar (Voluntario Muestra, ID 11)
      volunteerId: 11,
      
      // Datos de prueba
      experience: "He participado como voluntario en diversos eventos de reforestación y mantenimiento de áreas verdes durante los últimos 3 años.",
      availability: "weekends",
      availableDays: ["saturday", "sunday"],
      interestAreas: ["nature", "education"]
    };
    
    console.log("🔄 Enviando datos a la ruta directa:", voluntarioDePrueba);
    
    // URL local de nuestra API
    const response = await axios.post(
      `http://localhost:5000/api/volunteer-fields/update-all-fields/${voluntarioDePrueba.volunteerId}`,
      voluntarioDePrueba
    );
    
    console.log("✅ Respuesta recibida:");
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log("✅ Operación completada.");
  } catch (error) {
    console.error("❌ Error al enviar datos:", error.message);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
  }
}

// Ejecutar la prueba
testUpdateFields();