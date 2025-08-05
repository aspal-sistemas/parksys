import { db } from "./db";
import { documents } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Script para agregar documentos de muestra a los parques existentes
 */
async function addSampleDocuments() {
  try {
    console.log('Iniciando carga de documentos de muestra...');
    
    // Eliminar documentos anteriores para evitar duplicados
    await db.delete(documents);
    
    // Documentos para Parque Agua Azul (parkId = 3)
    const parqueAguaAzulDocs = [
      {
        parkId: 3,
        title: "Reglamento Interno",
        fileUrl: "https://example.com/parque-agua-azul/reglamento.pdf",
        fileSize: "2.5 MB",
        fileType: "application/pdf"
      },
      {
        parkId: 3,
        title: "Mapa de Instalaciones",
        fileUrl: "https://example.com/parque-agua-azul/mapa.pdf",
        fileSize: "1.8 MB",
        fileType: "application/pdf"
      },
      {
        parkId: 3,
        title: "Programa de Actividades 2025",
        fileUrl: "https://example.com/parque-agua-azul/actividades-2025.pdf",
        fileSize: "3.2 MB",
        fileType: "application/pdf"
      }
    ];
    
    // Documentos para Parque Metropolitano (parkId = 7)
    const parqueMetropolitanoDocs = [
      {
        parkId: 7,
        title: "Reglamento Interno",
        fileUrl: "https://example.com/parque-metropolitano/reglamento.pdf", 
        fileSize: "3.1 MB",
        fileType: "application/pdf"
      },
      {
        parkId: 7,
        title: "Plan de Conservación 2025",
        fileUrl: "https://example.com/parque-metropolitano/conservacion.pdf",
        fileSize: "4.5 MB",
        fileType: "application/pdf"
      },
      {
        parkId: 7,
        title: "Catálogo de Flora",
        fileUrl: "https://example.com/parque-metropolitano/catalogo-flora.xlsx",
        fileSize: "2.3 MB",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      {
        parkId: 7,
        title: "Mapa de Senderos",
        fileUrl: "https://example.com/parque-metropolitano/senderos.jpg",
        fileSize: "5.2 MB",
        fileType: "image/jpeg"
      }
    ];
    
    // Documentos para Parque Colomos (parkId = 1)
    const parqueColomosDocs = [
      {
        parkId: 1,
        title: "Reglamento Interno",
        fileUrl: "https://example.com/parque-colomos/reglamento.pdf",
        fileSize: "2.8 MB",
        fileType: "application/pdf"
      },
      {
        parkId: 1,
        title: "Guía del Jardín Japonés",
        fileUrl: "https://example.com/parque-colomos/jardin-japones.pdf",
        fileSize: "6.4 MB",
        fileType: "application/pdf"
      },
      {
        parkId: 1,
        title: "Historia del Parque",
        fileUrl: "https://example.com/parque-colomos/historia.docx",
        fileSize: "1.5 MB",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }
    ];
    
    // Combinar todos los documentos
    const allDocuments = [
      ...parqueAguaAzulDocs,
      ...parqueMetropolitanoDocs,
      ...parqueColomosDocs
    ];
    
    // Insertar documentos en la base de datos
    await db.insert(documents).values(allDocuments);
    
    console.log(`Se agregaron ${allDocuments.length} documentos de muestra a la base de datos.`);
    
  } catch (error) {
    console.error('Error al agregar documentos de muestra:', error);
  }
}

// Ejecutar el script
addSampleDocuments()
  .then(() => {
    console.log('Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error al ejecutar el script:', error);
    process.exit(1);
  });