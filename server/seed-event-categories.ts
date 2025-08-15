import { db } from './db';
import { eventCategories } from '../shared/schema';

const defaultEventCategories = [
  {
    name: 'Culturales',
    description: 'Eventos relacionados con cultura, arte y tradiciones locales',
    color: '#8B5CF6'
  },
  {
    name: 'Deportivos',
    description: 'Actividades deportivas y competencias recreativas',
    color: '#10B981'
  },
  {
    name: 'Educativos',
    description: 'Talleres, charlas y actividades educativas',
    color: '#3B82F6'
  },
  {
    name: 'Comunitarios',
    description: 'Eventos que fomentan la participación comunitaria',
    color: '#F59E0B'
  },
  {
    name: 'Recreativos',
    description: 'Actividades de entretenimiento y esparcimiento familiar',
    color: '#EF4444'
  },
  {
    name: 'Ambientales',
    description: 'Actividades de conservación y educación ambiental',
    color: '#84CC16'
  },
  {
    name: 'Sociales',
    description: 'Eventos de integración y cohesión social',
    color: '#F97316'
  }
];

export async function seedEventCategories() {
  try {
    console.log('🌱 Iniciando seeding de categorías de eventos...');
    
    // Verificar si ya existen categorías
    const existingCategories = await db.select().from(eventCategories);
    
    if (existingCategories.length > 0) {
      console.log('✅ Las categorías de eventos ya existen. Saltando seeding.');
      return;
    }
    
    // Insertar categorías de eventos
    await db.insert(eventCategories).values(defaultEventCategories);
    
    console.log(`✅ Se insertaron ${defaultEventCategories.length} categorías de eventos exitosamente`);
  } catch (error) {
    console.error('❌ Error al hacer seeding de categorías de eventos:', error);
  }
}