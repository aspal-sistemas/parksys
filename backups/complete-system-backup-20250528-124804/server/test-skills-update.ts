/**
 * Script para probar la actualización con preservación del campo skills
 * 
 * Este script prueba específicamente la capacidad del sistema para
 * preservar y actualizar el campo de habilidades (skills).
 */

import { db } from "./db";
import { sql } from "drizzle-orm";
import { updateCompleteProfile } from "./volunteer-fields-updater";

async function testSkillsPreservation() {
  console.log("📋 Iniciando prueba de actualización de habilidades del voluntario...");
  
  try {
    // Buscamos un voluntario existente para probar
    const testUserId = 30; // Ajusta según sea necesario
    const volunteerResult = await db.execute(
      sql`SELECT id, full_name, previous_experience, skills, available_hours as disponibilidad 
          FROM volunteers 
          WHERE user_id = ${testUserId} AND status = 'active' LIMIT 1`
    );
    
    if (!volunteerResult.rows || volunteerResult.rows.length === 0) {
      console.error("❌ No se encontró el voluntario para la prueba");
      return;
    }
    
    const volunteerId = volunteerResult.rows[0].id;
    const volunteerName = volunteerResult.rows[0].full_name;
    
    console.log(`🧪 Probando actualización para el voluntario ID ${volunteerId} (${volunteerName})`);
    console.log("📊 Estado actual del voluntario:", {
      experiencia: volunteerResult.rows[0].previous_experience,
      habilidades: volunteerResult.rows[0].skills,
      disponibilidad: volunteerResult.rows[0].disponibilidad
    });
    
    // Primero, establecemos valores iniciales de habilidades
    console.log("1️⃣ Estableciendo valores iniciales de habilidades...");
    const initialSkills = "Coordinación de equipos, comunicación efectiva, primeros auxilios";
    
    const updatedVolunteer1 = await updateCompleteProfile(volunteerId, {
      skills: initialSkills
    });
    
    console.log("✅ Habilidades iniciales establecidas:", updatedVolunteer1?.skills);
    
    // Ahora actualizamos solo la experiencia, verificando que las habilidades se preserven
    console.log("2️⃣ Actualizando solo la experiencia, preservando habilidades...");
    const newExperience = "Experiencia actualizada sin tocar habilidades";
    
    const updatedVolunteer2 = await updateCompleteProfile(volunteerId, {
      experience: newExperience
    });
    
    console.log("📊 Resultado después de actualizar solo experiencia:", {
      experiencia: updatedVolunteer2?.previous_experience,
      habilidades: updatedVolunteer2?.skills,
      disponibilidad: updatedVolunteer2?.available_hours
    });
    
    // Verificamos que las habilidades se hayan preservado
    if (updatedVolunteer2?.skills === initialSkills) {
      console.log("✅ ÉXITO: Las habilidades se preservaron correctamente");
    } else {
      console.error("❌ ERROR: Las habilidades no se preservaron correctamente");
      console.log("Valor esperado:", initialSkills);
      console.log("Valor actual:", updatedVolunteer2?.skills);
    }
    
    // Finalmente, actualizamos las habilidades a un nuevo valor
    console.log("3️⃣ Actualizando el campo de habilidades...");
    const newSkills = "Liderazgo comunitario, organización de eventos, educación ambiental";
    
    const updatedVolunteer3 = await updateCompleteProfile(volunteerId, {
      skills: newSkills
    });
    
    console.log("📊 Resultado final:", {
      experiencia: updatedVolunteer3?.previous_experience,
      habilidades: updatedVolunteer3?.skills,
      disponibilidad: updatedVolunteer3?.available_hours
    });
    
    // Verificamos que las habilidades se hayan actualizado correctamente
    if (updatedVolunteer3?.skills === newSkills) {
      console.log("✅ ÉXITO: Las habilidades se actualizaron correctamente");
    } else {
      console.error("❌ ERROR: Las habilidades no se actualizaron correctamente");
      console.log("Valor esperado:", newSkills);
      console.log("Valor actual:", updatedVolunteer3?.skills);
    }
    
    console.log("✅ Prueba completada con éxito");
    
  } catch (error) {
    console.error("❌ Error en la prueba:", error);
  }
}

// Ejecutar la prueba
testSkillsPreservation();