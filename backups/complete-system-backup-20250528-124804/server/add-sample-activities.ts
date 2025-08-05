import { db } from "./db";
import { activities } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Script para agregar actividades de muestra actualizadas
 */
async function addSampleActivities() {
  try {
    console.log('Iniciando carga de actividades de muestra...');
    
    // Eliminar actividades anteriores para evitar duplicados
    await db.delete(activities);
    
    // Fechas para actividades (algunas pasadas, actuales y futuras)
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const nextMonth = new Date(now);
    nextMonth.setDate(now.getDate() + 30);
    
    // Actividades para Parque Agua Azul (parkId = 3)
    const parqueAguaAzulActivities = [
      {
        parkId: 3,
        title: "Yoga al aire libre",
        description: "Sesiones gratuitas de yoga para todos los niveles. Trae tu tapete y disfruta de ejercicio en un ambiente natural.",
        startDate: tomorrow,
        endDate: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 horas después
        category: "deportivo",
        location: "Área central del parque"
      },
      {
        parkId: 3,
        title: "Taller de jardinería urbana",
        description: "Aprende técnicas básicas de jardinería y cultivo urbano. Cada participante se llevará una planta para comenzar su propio jardín.",
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000), // 3 horas después
        category: "ambiental",
        location: "Zona de jardines"
      },
      {
        parkId: 3,
        title: "Concierto acústico",
        description: "Bandas locales presentan música acústica al atardecer. Evento familiar gratuito.",
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + 4 * 60 * 60 * 1000), // 4 horas después
        category: "cultural",
        location: "Foro al aire libre"
      }
    ];
    
    // Actividades para Parque Metropolitano (parkId = 7)
    const parqueMetropolitanoActivities = [
      {
        parkId: 7,
        title: "Limpieza comunitaria",
        description: "Únete a vecinos para mantener nuestro parque limpio. Se proporcionarán materiales de limpieza.",
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000), // 3 horas después
        category: "comunidad",
        location: "Entrada principal"
      },
      {
        parkId: 7,
        title: "Torneo amistoso de baloncesto",
        description: "Torneo 3x3 para todas las edades. Inscríbete con tu equipo el mismo día.",
        startDate: yesterday, // Ya pasó
        endDate: new Date(yesterday.getTime() + 5 * 60 * 60 * 1000), // 5 horas después
        category: "deportivo",
        location: "Canchas deportivas"
      }
    ];
    
    // Actividades para Parque Colomos (parkId = 1)
    const parqueColomosActivities = [
      {
        parkId: 1,
        title: "Curso de fotografía de naturaleza",
        description: "Aprende a capturar la belleza natural con tu cámara o smartphone. Curso para principiantes y nivel intermedio.",
        startDate: tomorrow,
        endDate: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        category: "cultural",
        location: "Jardín Japonés"
      },
      {
        parkId: 1,
        title: "Caminata ecológica guiada",
        description: "Recorrido guiado con expertos en biología que te mostrarán la diversidad de especies en el parque.",
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
        category: "ambiental",
        location: "Punto de información"
      }
    ];
    
    // Combinar todas las actividades
    const allActivities = [
      ...parqueAguaAzulActivities,
      ...parqueMetropolitanoActivities,
      ...parqueColomosActivities
    ];
    
    // Insertar actividades en la base de datos
    await db.insert(activities).values(allActivities);
    
    console.log(`Se agregaron ${allActivities.length} actividades de muestra a la base de datos.`);
    
  } catch (error) {
    console.error('Error al agregar actividades de muestra:', error);
  }
}

// Ejecutar el script
addSampleActivities()
  .then(() => {
    console.log('Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error al ejecutar el script:', error);
    process.exit(1);
  });