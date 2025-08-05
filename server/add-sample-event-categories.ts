import { db } from './db';
import { eventCategories } from '../shared/schema';

/**
 * Script para agregar categorías de eventos de muestra
 */
export async function addSampleEventCategories() {
  try {
    console.log('Agregando categorías de eventos de muestra...');

    const categories = [
      {
        name: 'Culturales',
        description: 'Eventos relacionados con arte, música, teatro, literatura y expresiones culturales',
        color: '#8B5CF6' // Púrpura
      },
      {
        name: 'Deportivos',
        description: 'Competencias deportivas, torneos, actividades físicas y recreativas',
        color: '#10B981' // Verde
      },
      {
        name: 'Sociales',
        description: 'Reuniones comunitarias, celebraciones y eventos de integración social',
        color: '#F59E0B' // Amarillo
      },
      {
        name: 'Empresariales',
        description: 'Eventos corporativos, lanzamientos, conferencias y actividades de empresa',
        color: '#3B82F6' // Azul
      },
      {
        name: 'Gubernamentales',
        description: 'Eventos oficiales, ceremonias institucionales y actividades públicas',
        color: '#EF4444' // Rojo
      },
      {
        name: 'Benéficos',
        description: 'Eventos de caridad, fundraising y actividades de beneficio social',
        color: '#06B6D4' // Cian
      }
    ];

    for (const category of categories) {
      try {
        const [inserted] = await db.insert(eventCategories)
          .values(category)
          .onConflictDoNothing()
          .returning();
          
        if (inserted) {
          console.log(`✓ Categoría agregada: ${category.name}`);
        } else {
          console.log(`- Categoría ya existe: ${category.name}`);
        }
      } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`- Categoría ya existe: ${category.name}`);
        } else {
          console.error(`Error agregando categoría ${category.name}:`, error);
        }
      }
    }

    console.log('✅ Categorías de eventos procesadas exitosamente');
    
    // Mostrar todas las categorías
    const allCategories = await db.select().from(eventCategories);
    console.log('\n📋 Categorías de eventos disponibles:');
    allCategories.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name} (${cat.color})`);
    });

  } catch (error) {
    console.error('❌ Error agregando categorías de eventos:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addSampleEventCategories()
    .then(() => {
      console.log('Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script falló:', error);
      process.exit(1);
    });
}