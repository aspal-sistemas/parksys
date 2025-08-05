import { db } from './db';
import { storage } from './storage';
import { sql } from 'drizzle-orm';
import { instructors, volunteers, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

/**
 * Genera una contraseña aleatoria segura
 * @returns Contraseña aleatoria de 10 caracteres
 */
function generateRandomPassword(): string {
  // Generamos una contraseña de 10 caracteres alfanuméricos
  return crypto.randomBytes(8).toString('hex').substring(0, 10);
}

/**
 * Script para integrar instructores existentes como usuarios del sistema
 */
async function integrateInstructors() {
  console.log("\n====== INTEGRANDO INSTRUCTORES COMO USUARIOS ======");
  
  try {
    // Consultar todos los instructores
    const allInstructors = await db.select().from(instructors);
    console.log(`Encontrados ${allInstructors.length} instructores para integrar...`);
    
    // Para cada instructor, crear un usuario si no existe
    for (const instructor of allInstructors) {
      // Verificar si ya existe un usuario con este email
      const existingUser = await storage.getUserByEmail(instructor.email);
      
      if (existingUser) {
        console.log(`⚠️ El instructor ${instructor.fullName} ya tiene una cuenta como ${existingUser.username} con rol ${existingUser.role}`);
        
        // Si el usuario existe pero no tiene rol de instructor, actualizar su rol
        if (existingUser.role !== 'instructor') {
          console.log(`   Actualizando rol de usuario de ${existingUser.role} a instructor`);
          await storage.updateUser(existingUser.id, {
            role: 'instructor'
          });
        }
        
        continue;
      }
      
      // Generar un nombre de usuario basado en el nombre
      const nameParts = instructor.fullName.toLowerCase().split(' ');
      let username = '';
      
      if (nameParts.length >= 2) {
        // Combinación de primer nombre y primer apellido
        username = `${nameParts[0]}.${nameParts[nameParts.length - 1]}`;
      } else {
        username = nameParts[0];
      }
      
      // Eliminar caracteres especiales y espacios
      username = username.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      username = username.replace(/[^a-z0-9]/g, '');
      
      // Generar una contraseña aleatoria
      const password = generateRandomPassword();
      
      // Crear el nuevo usuario
      const newUser = await storage.createUser({
        username,
        password,
        email: instructor.email,
        role: 'instructor',
        fullName: instructor.fullName
      });
      
      console.log(`✅ Usuario creado para instructor: ${instructor.fullName}`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   Email: ${instructor.email}`);
      console.log('-------------------------------------------');
      
      // Actualizar el instructor con una referencia al usuario
      try {
        await db.execute(sql`
          UPDATE instructors 
          SET user_id = ${newUser.id}
          WHERE id = ${instructor.id}
        `);
      } catch (error) {
        console.log(`Error al actualizar referencia de usuario para instructor ${instructor.id}: ${error}`);
        // Si la columna no existe, podemos ignorar este error
      }
    }
    
    console.log("✅ ¡Integración de instructores completada!");
  } catch (error) {
    console.error("Error al integrar instructores:", error);
  }
}

/**
 * Script para integrar voluntarios existentes como usuarios del sistema
 */
async function integrateVolunteers() {
  console.log("\n====== INTEGRANDO VOLUNTARIOS COMO USUARIOS ======");
  
  try {
    // Consultar todos los voluntarios usando SQL directo para evitar errores con el esquema
    const volunteersResult = await db.execute(sql`
      SELECT id, full_name, email, phone as phoneNumber 
      FROM volunteers
    `);
    
    const allVolunteers = volunteersResult.rows;
    console.log(`Encontrados ${allVolunteers.length} voluntarios para integrar...`);
    
    // Para cada voluntario, crear un usuario si no existe
    for (const volunteer of allVolunteers) {
      // Verificar si el email existe
      if (!volunteer.email) {
        console.log(`⚠️ El voluntario ${volunteer.full_name} no tiene email registrado, no se puede crear cuenta`);
        continue;
      }
      
      // Verificar si ya existe un usuario con este email
      const existingUser = await storage.getUserByEmail(volunteer.email);
      
      if (existingUser) {
        console.log(`⚠️ El voluntario ${volunteer.full_name} ya tiene una cuenta como ${existingUser.username} con rol ${existingUser.role}`);
        
        // Si el usuario existe pero no tiene rol de voluntario, actualizar su rol
        if (existingUser.role !== 'voluntario') {
          console.log(`   Actualizando rol de usuario de ${existingUser.role} a voluntario`);
          await storage.updateUser(existingUser.id, {
            role: 'voluntario'
          });
        }
        
        continue;
      }
      
      // Generar un nombre de usuario basado en el nombre
      const nameParts = volunteer.full_name.toLowerCase().split(' ');
      let username = '';
      
      if (nameParts.length >= 2) {
        // Combinación de primer nombre y primer apellido
        username = `${nameParts[0]}.${nameParts[nameParts.length - 1]}`;
      } else {
        username = nameParts[0];
      }
      
      // Eliminar caracteres especiales y espacios
      username = username.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      username = username.replace(/[^a-z0-9]/g, '');
      
      // Generar una contraseña aleatoria
      const password = generateRandomPassword();
      
      // Crear el nuevo usuario
      const newUser = await storage.createUser({
        username,
        password,
        email: volunteer.email,
        role: 'voluntario',
        fullName: volunteer.full_name
      });
      
      console.log(`✅ Usuario creado para voluntario: ${volunteer.full_name}`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   Email: ${volunteer.email}`);
      console.log('-------------------------------------------');
      
      // Actualizar el voluntario con una referencia al usuario
      try {
        await db.execute(sql`
          UPDATE volunteers 
          SET user_id = ${newUser.id}
          WHERE id = ${volunteer.id}
        `);
      } catch (error) {
        console.log(`Error al actualizar referencia de usuario para voluntario ${volunteer.id}: ${error}`);
        // Si la columna no existe, podemos ignorar este error
      }
    }
    
    console.log("✅ ¡Integración de voluntarios completada!");
  } catch (error) {
    console.error("Error al integrar voluntarios:", error);
  }
}

/**
 * Veamos los roles existentes en el sistema
 */
async function checkExistingRoles() {
  console.log("\n====== ROLES EXISTENTES EN EL SISTEMA ======");
  
  try {
    const roles = await db.execute(sql`
      SELECT DISTINCT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);
    
    console.log("Roles actuales en el sistema:");
    console.table(roles.rows);
  } catch (error) {
    console.error("Error al verificar roles:", error);
  }
}

/**
 * Función principal que ejecuta ambas integraciones
 */
async function integrateAllUsers() {
  console.log("Iniciando integración de usuarios...");
  
  // Verificar si las tablas tienen la columna user_id, si no, agregarla
  try {
    // Verificar si la columna existe en instructors
    const instructorColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'instructors' AND column_name = 'user_id'
    `);
    
    if (instructorColumns.rowCount === 0) {
      console.log("Agregando columna user_id a la tabla instructors...");
      await db.execute(sql`
        ALTER TABLE instructors 
        ADD COLUMN user_id INTEGER REFERENCES users(id)
      `);
    }
    
    // Verificar si la columna existe en volunteers
    const volunteerColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'volunteers' AND column_name = 'user_id'
    `);
    
    if (volunteerColumns.rowCount === 0) {
      console.log("Agregando columna user_id a la tabla volunteers...");
      await db.execute(sql`
        ALTER TABLE volunteers 
        ADD COLUMN user_id INTEGER REFERENCES users(id)
      `);
    }
    
    // Primero verificamos los roles existentes
    await checkExistingRoles();
    
    // Luego integramos a los instructores y voluntarios
    await integrateInstructors();
    await integrateVolunteers();
    
    // Finalmente, mostramos los nuevos roles después de la integración
    await checkExistingRoles();
    
    console.log("\n✅ ¡Integración completada con éxito!");
  } catch (error) {
    console.error("Error durante la integración:", error);
  }
}

// Ejecutar el script
integrateAllUsers()
  .then(() => {
    console.log("Proceso finalizado.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error en el proceso principal:", error);
    process.exit(1);
  });