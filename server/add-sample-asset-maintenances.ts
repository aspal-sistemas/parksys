import { db } from './db';
import { assetMaintenances, assets } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script para agregar mantenimientos de muestra a los activos existentes
 */
export async function addSampleAssetMaintenances() {
  try {
    console.log('Iniciando creación de mantenimientos de muestra...');

    // Obtener algunos activos existentes
    const existingAssets = await db.select().from(assets).limit(10);
    
    if (existingAssets.length === 0) {
      console.log('No hay activos en la base de datos. Creando algunos activos primero...');
      return;
    }

    const maintenanceTypes = ['preventivo', 'correctivo', 'predictivo', 'inspeccion', 'limpieza'];
    const performers = [
      'Equipo de Mantenimiento Municipal',
      'Juan Pérez - Técnico',
      'María García - Supervisora',
      'Empresa MantenimientoPlus',
      'Carlos López - Especialista'
    ];

    const sampleMaintenances = [
      {
        asset_id: existingAssets[0]?.id,
        maintenanceType: 'preventivo',
        description: 'Mantenimiento preventivo mensual - revisión general de componentes',
        date: '2024-01-15',
        performedBy: 'Equipo de Mantenimiento Municipal',
        cost: '150.00',
        status: 'completed',
        findings: 'Componentes en buen estado, se aplicó lubricación',
        actions: 'Lubricación de partes móviles, ajuste de tornillería'
      },
      {
        asset_id: existingAssets[1]?.id,
        maintenanceType: 'correctivo',
        description: 'Reparación de daños por vandalismo',
        date: '2024-02-03',
        performedBy: 'Juan Pérez - Técnico',
        cost: '320.50',
        status: 'completed',
        findings: 'Pintadas y daños menores en superficie',
        actions: 'Limpieza, repintado y reemplazo de elementos dañados'
      },
      {
        asset_id: existingAssets[2]?.id,
        maintenanceType: 'limpieza',
        description: 'Limpieza profunda mensual',
        date: '2024-02-10',
        performedBy: 'María García - Supervisora',
        cost: '75.00',
        status: 'completed',
        findings: 'Acumulación normal de suciedad',
        actions: 'Lavado con agua a presión y desinfección'
      },
      {
        asset_id: existingAssets[3]?.id,
        maintenanceType: 'inspeccion',
        description: 'Inspección de seguridad trimestral',
        date: '2024-02-20',
        performedBy: 'Empresa MantenimientoPlus',
        cost: '200.00',
        status: 'completed',
        findings: 'Estructura en condiciones óptimas',
        actions: 'Verificación de anclajes y elementos de seguridad'
      },
      {
        asset_id: existingAssets[4]?.id,
        maintenanceType: 'correctivo',
        description: 'Reparación por desgaste natural',
        date: '2024-03-01',
        performedBy: 'Carlos López - Especialista',
        cost: '450.75',
        status: 'completed',
        findings: 'Desgaste en componentes por uso intensivo',
        actions: 'Reemplazo de piezas desgastadas, refuerzo estructural'
      }
    ];

    // Insertar mantenimientos adicionales para más activos
    for (let i = 5; i < existingAssets.length; i++) {
      const randomType = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
      const randomPerformer = performers[Math.floor(Math.random() * performers.length)];
      const randomCost = (Math.random() * 500 + 50).toFixed(2);
      
      const additionalMaintenance = {
        asset_id: existingAssets[i].id,
        maintenanceType: randomType,
        description: `Mantenimiento ${randomType} realizado según cronograma`,
        date: `2024-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        performedBy: randomPerformer,
        cost: randomCost,
        status: 'completed',
        findings: 'Revisión completada según protocolo',
        actions: 'Acciones de mantenimiento estándar aplicadas'
      };
      
      sampleMaintenances.push(additionalMaintenance);
    }

    console.log(`Insertando ${sampleMaintenances.length} registros de mantenimiento...`);
    
    for (const maintenance of sampleMaintenances) {
      try {
        await db.insert(assetMaintenances).values(maintenance);
        console.log(`✓ Mantenimiento creado para activo ${maintenance.asset_id}`);
      } catch (error) {
        console.error(`Error al crear mantenimiento para activo ${maintenance.asset_id}:`, error);
      }
    }

    console.log('Mantenimientos de muestra creados exitosamente');
    
    // Verificar la creación
    const totalMaintenances = await db.select().from(assetMaintenances);
    console.log(`Total de mantenimientos en la base de datos: ${totalMaintenances.length}`);

  } catch (error) {
    console.error('Error al crear mantenimientos de muestra:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addSampleAssetMaintenances()
    .then(() => {
      console.log('Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en el script:', error);
      process.exit(1);
    });
}