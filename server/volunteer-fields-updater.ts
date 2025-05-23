/**
 * Script para actualizar los campos de voluntarios preservando los datos existentes
 * 
 * Este módulo proporciona funciones para actualizar selectivamente los campos
 * de un voluntario, preservando los valores existentes que no se proporcionan
 * en la actualización.
 */

import { pool } from "./db";

/**
 * Actualiza campos de un voluntario preservando valores existentes
 * 
 * @param volunteerId ID del voluntario a actualizar
 * @param fields Campos a actualizar (opcionales)
 * @returns El voluntario actualizado con todos sus campos
 */
export async function updateVolunteerFieldsPreserving(
  volunteerId: number,
  fields: {
    experience?: string;
    availability?: string;
    availableDays?: string[] | string;
    interestAreas?: string[] | string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    preferredParkId?: number;
    legalConsent?: boolean;
    skills?: string;
  }
) {
  try {
    console.log("🔄 Actualizando campos del voluntario ID:", volunteerId);
    console.log("Datos recibidos para actualizar:", fields);
    
    // Primero obtenemos los datos actuales del voluntario
    const getCurrentDataQuery = `
      SELECT * FROM volunteers WHERE id = $1
    `;
    
    const currentDataResult = await pool.query(getCurrentDataQuery, [volunteerId]);
    
    if (!currentDataResult.rows || currentDataResult.rows.length === 0) {
      console.error("❌ No se encontró el voluntario con ID:", volunteerId);
      return null;
    }
    
    const currentData = currentDataResult.rows[0];
    console.log("Datos actuales del voluntario:", {
      experiencia: currentData.previous_experience,
      disponibilidad: currentData.available_hours,
      diasDisponibles: currentData.available_days,
      intereses: currentData.interest_areas
    });
    
    // Preparamos los campos a actualizar, preservando valores existentes
    const updatedFields = {
      previous_experience: fields.experience !== undefined ? fields.experience : currentData.previous_experience,
      available_hours: fields.availability !== undefined ? fields.availability || null : currentData.available_hours,
      address: fields.address !== undefined ? fields.address : currentData.address,
      emergency_contact: fields.emergencyContact !== undefined ? fields.emergencyContact : currentData.emergency_contact,
      emergency_phone: fields.emergencyPhone !== undefined ? fields.emergencyPhone : currentData.emergency_phone,
      preferred_park_id: fields.preferredParkId !== undefined ? fields.preferredParkId : currentData.preferred_park_id,
      legal_consent: fields.legalConsent !== undefined ? fields.legalConsent : currentData.legal_consent,
      skills: fields.skills !== undefined ? fields.skills : currentData.skills,
    };
    
    // Formatear correctamente los arrays para PostgreSQL si se proporcionan
    if (fields.availableDays !== undefined) {
      let formattedDays;
      
      if (Array.isArray(fields.availableDays)) {
        // Si ya es un array, formateamos correctamente para PostgreSQL
        formattedDays = `{${fields.availableDays.join(',')}}`;
      } else if (typeof fields.availableDays === 'string') {
        // Si es un string, necesitamos convertirlo a un formato de array PostgreSQL
        if (fields.availableDays === 'weekdays') {
          // Convertimos palabras clave comunes a arrays reales
          formattedDays = '{monday,tuesday,wednesday,thursday,friday}';
        } else if (fields.availableDays === 'weekends') {
          formattedDays = '{saturday,sunday}';
        } else if (fields.availableDays === 'all') {
          formattedDays = '{monday,tuesday,wednesday,thursday,friday,saturday,sunday}';
        } else if (fields.availableDays.startsWith('{') && fields.availableDays.endsWith('}')) {
          // Si ya tiene formato de array PostgreSQL, lo usamos tal cual
          formattedDays = fields.availableDays;
        } else {
          // Si es otro tipo de string, lo tratamos como un solo valor
          formattedDays = `{${fields.availableDays}}`;
        }
      } else {
        formattedDays = null;
      }
      
      console.log(`📊 Formateando días disponibles: "${fields.availableDays}" -> "${formattedDays}"`);
      
      // @ts-ignore - Agregamos al objeto de campos
      updatedFields.available_days = formattedDays;
    }
    
    if (fields.interestAreas !== undefined) {
      let formattedInterests;
      
      if (Array.isArray(fields.interestAreas)) {
        // Si ya es un array, formateamos correctamente para PostgreSQL
        formattedInterests = `{${fields.interestAreas.join(',')}}`;
      } else if (typeof fields.interestAreas === 'string') {
        // Si es un string, necesitamos convertirlo a un formato de array PostgreSQL
        if (fields.interestAreas.startsWith('{') && fields.interestAreas.endsWith('}')) {
          // Si ya tiene formato de array PostgreSQL, lo usamos tal cual
          formattedInterests = fields.interestAreas;
        } else {
          // Si es otro tipo de string, lo tratamos como un solo valor
          formattedInterests = `{${fields.interestAreas}}`;
        }
      } else {
        formattedInterests = null;
      }
      
      console.log(`📊 Formateando áreas de interés: "${fields.interestAreas}" -> "${formattedInterests}"`);
      
      // @ts-ignore - Agregamos al objeto de campos
      updatedFields.interest_areas = formattedInterests;
    }
    
    // Construimos dinámicamente la consulta SQL para actualizar solo los campos proporcionados
    const fieldsToUpdate = Object.keys(updatedFields);
    const setClauses = fieldsToUpdate.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(updatedFields);
    
    const updateQuery = `
      UPDATE volunteers 
      SET ${setClauses}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    // Agregamos el ID del voluntario como último parámetro
    values.push(volunteerId);
    
    console.log("✅ Ejecutando actualización con preservación de datos");
    const result = await pool.query(updateQuery, values);
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Actualización exitosa de campos con preservación");
      return result.rows[0];
    } else {
      console.error("❌ Error al actualizar: no se devolvieron resultados");
      return null;
    }
  } catch (error) {
    console.error("❌ Error general en actualización preservada:", error);
    return null;
  }
}

/**
 * Actualiza solo los campos de experiencia y disponibilidad de un voluntario
 * 
 * @param volunteerId ID del voluntario
 * @param experience Experiencia previa (opcional)
 * @param availability Disponibilidad (opcional)
 * @returns Resultado de la actualización
 */
export async function updateExperienceAndAvailability(
  volunteerId: number,
  experience?: string,
  availability?: string
) {
  return updateVolunteerFieldsPreserving(volunteerId, {
    experience,
    availability
  });
}

/**
 * Actualiza intereses y días disponibles de un voluntario
 * 
 * @param volunteerId ID del voluntario
 * @param availableDays Días disponibles (arreglo u objeto)
 * @param interestAreas Áreas de interés (arreglo u objeto)
 * @returns Resultado de la actualización
 */
export async function updateInterestsAndDays(
  volunteerId: number,
  availableDays?: string[] | string,
  interestAreas?: string[] | string
) {
  return updateVolunteerFieldsPreserving(volunteerId, {
    availableDays,
    interestAreas
  });
}

/**
 * Actualiza el perfil completo de un voluntario
 * 
 * @param volunteerId ID del voluntario
 * @param data Datos completos del perfil
 * @returns Resultado de la actualización
 */
export async function updateCompleteProfile(
  volunteerId: number,
  data: {
    experience?: string;
    availability?: string;
    availableDays?: string[] | string;
    interestAreas?: string[] | string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    preferredParkId?: number;
    legalConsent?: boolean;
    skills?: string;
  }
) {
  return updateVolunteerFieldsPreserving(volunteerId, data);
}