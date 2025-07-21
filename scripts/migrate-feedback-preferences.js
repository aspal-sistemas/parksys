import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrateFeedbackPreferences() {
  try {
    console.log('🔄 Iniciando migración de preferencias de feedback granulares...');
    
    // Obtener todos los usuarios con preferencias actuales
    const usersQuery = `
      SELECT id, role, notification_preferences, full_name, email
      FROM users 
      WHERE notification_preferences IS NOT NULL
      ORDER BY role, id
    `;
    
    const usersResult = await pool.query(usersQuery);
    console.log(`📊 Encontrados ${usersResult.rows.length} usuarios con preferencias existentes`);
    
    let migrated = 0;
    
    for (const user of usersResult.rows) {
      const currentPrefs = user.notification_preferences || {};
      
      // Verificar si ya tiene preferencias granulares
      const hasGranularPrefs = currentPrefs.feedback_share !== undefined || 
                              currentPrefs.feedback_report_problem !== undefined ||
                              currentPrefs.feedback_suggest_improvement !== undefined ||
                              currentPrefs.feedback_propose_event !== undefined;
      
      if (hasGranularPrefs) {
        console.log(`⏭️  Usuario ${user.full_name} (${user.email}) ya tiene preferencias granulares`);
        continue;
      }
      
      // Obtener preferencias por defecto según el rol
      let defaultGranularPrefs;
      
      switch (user.role) {
        case 'admin':
        case 'super_admin':
          defaultGranularPrefs = {
            feedback_share: true,
            feedback_report_problem: true,
            feedback_suggest_improvement: true,
            feedback_propose_event: true
          };
          break;
        case 'manager':
          defaultGranularPrefs = {
            feedback_share: true,
            feedback_report_problem: true,
            feedback_suggest_improvement: true,
            feedback_propose_event: true
          };
          break;
        case 'instructor':
        case 'volunteer':
        case 'concessionaire':
        default:
          defaultGranularPrefs = {
            feedback_share: false,
            feedback_report_problem: false,
            feedback_suggest_improvement: false,
            feedback_propose_event: false
          };
          break;
      }
      
      // Combinar preferencias existentes con las nuevas granulares
      const newPrefs = {
        ...currentPrefs,
        ...defaultGranularPrefs
      };
      
      // Actualizar en base de datos
      const updateQuery = `
        UPDATE users 
        SET notification_preferences = $1
        WHERE id = $2
      `;
      
      await pool.query(updateQuery, [JSON.stringify(newPrefs), user.id]);
      
      console.log(`✅ Migrado: ${user.full_name} (${user.email}) - Role: ${user.role}`);
      console.log(`   └─ Nuevas preferencias granulares:`, defaultGranularPrefs);
      migrated++;
    }
    
    console.log(`\n🎉 Migración completada exitosamente!`);
    console.log(`📈 Total usuarios migrados: ${migrated}`);
    console.log(`📋 Total usuarios con preferencias: ${usersResult.rows.length}`);
    
    // Verificar resultado
    console.log('\n📊 Verificando resultado de la migración...');
    const verificationQuery = `
      SELECT 
        role,
        COUNT(*) as total_users,
        COUNT(CASE WHEN (notification_preferences->>'feedback_share')::boolean = true THEN 1 END) as feedback_share_enabled,
        COUNT(CASE WHEN (notification_preferences->>'feedback_report_problem')::boolean = true THEN 1 END) as feedback_report_problem_enabled,
        COUNT(CASE WHEN (notification_preferences->>'feedback_suggest_improvement')::boolean = true THEN 1 END) as feedback_suggest_improvement_enabled,
        COUNT(CASE WHEN (notification_preferences->>'feedback_propose_event')::boolean = true THEN 1 END) as feedback_propose_event_enabled
      FROM users 
      WHERE notification_preferences IS NOT NULL
      GROUP BY role
      ORDER BY role
    `;
    
    const verificationResult = await pool.query(verificationQuery);
    
    console.log('\n📈 Estadísticas por rol después de la migración:');
    verificationResult.rows.forEach(row => {
      console.log(`\n${row.role.toUpperCase()} (${row.total_users} usuarios):`);
      console.log(`  └─ Compartir experiencia: ${row.feedback_share_enabled}/${row.total_users}`);
      console.log(`  └─ Reportar problema: ${row.feedback_report_problem_enabled}/${row.total_users}`);
      console.log(`  └─ Sugerir mejora: ${row.feedback_suggest_improvement_enabled}/${row.total_users}`);
      console.log(`  └─ Proponer evento: ${row.feedback_propose_event_enabled}/${row.total_users}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar migración
migrateFeedbackPreferences().catch(console.error);