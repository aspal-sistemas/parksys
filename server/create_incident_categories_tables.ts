/**
 * Script para crear las tablas relacionadas con el módulo de categorías de incidentes
 */
import { db } from "./db";

export async function createIncidentCategoriesTables() {
  try {
    console.log("Iniciando creación de tablas de categorías de incidentes...");

    // Verificar si existe la tabla de categorías
    const categoriesTableExists = await db.execute(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'incident_categories'
      )`
    );

    if (!categoriesTableExists.rows[0].exists) {
      // Crear la tabla de categorías de incidentes
      await db.execute(`
        CREATE TABLE incident_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          color VARCHAR(20) DEFAULT '#3b82f6',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Tabla incident_categories creada correctamente");
    } else {
      console.log("La tabla incident_categories ya existe");
    }

    // Verificar si existe la tabla de subcategorías
    const subcategoriesTableExists = await db.execute(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'incident_subcategories'
      )`
    );

    if (!subcategoriesTableExists.rows[0].exists) {
      // Crear la tabla de subcategorías de incidentes
      await db.execute(`
        CREATE TABLE incident_subcategories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          category_id INTEGER REFERENCES incident_categories(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Tabla incident_subcategories creada correctamente");
    } else {
      console.log("La tabla incident_subcategories ya existe");
    }

    // Insertar datos de muestra si no existen registros
    const categoryCount = await db.execute(`SELECT COUNT(*) FROM incident_categories`);
    
    if (categoryCount.rows[0].count === '0') {
      // Insertar categorías de muestra
      await db.execute(`
        INSERT INTO incident_categories (name, description, color) VALUES 
        ('Daños', 'Problemas físicos en instalaciones o equipamiento', '#ef4444'),
        ('Seguridad', 'Problemas relacionados con la seguridad del parque', '#f97316'),
        ('Mantenimiento', 'Necesidades de mantenimiento general', '#3b82f6'),
        ('Limpieza', 'Problemas de limpieza y residuos', '#10b981')
      `);
      console.log("Datos de muestra de categorías insertados correctamente");

      // Insertar subcategorías de muestra
      await db.execute(`
        INSERT INTO incident_subcategories (name, description, category_id) VALUES 
        ('Juegos infantiles', 'Problemas con juegos del área infantil', 1),
        ('Senderos', 'Problemas en caminos y senderos', 1),
        ('Bancas', 'Problemas con bancas y asientos', 1),
        ('Iluminación', 'Problemas con el alumbrado', 3),
        ('Vegetación', 'Problemas con árboles, arbustos o césped', 3),
        ('Vandalismo', 'Actos de vandalismo o grafitis', 2),
        ('Basura', 'Acumulación de basura o residuos', 4),
        ('Baños', 'Problemas de limpieza en baños', 4)
      `);
      console.log("Datos de muestra de subcategorías insertados correctamente");
    }

    return { success: true, message: "Tablas de categorías de incidentes creadas correctamente" };
  } catch (error) {
    console.error("Error al crear tablas de categorías de incidentes:", error);
    return { success: false, message: "Error al crear tablas de categorías de incidentes", error };
  }
}