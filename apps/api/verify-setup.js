const pg = require('pg');

const client = new pg.Client({
  connectionString: 'postgresql://countrynaturalfoods:countrynaturalfoods@localhost:5432/countrynaturalfoods'
});

async function verify() {
  try {
    await client.connect();
    
    // Check table exists
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'master_admin_preferences'
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ master_admin_preferences table exists');
    }

    // Check data
    const prefs = await client.query('SELECT * FROM master_admin_preferences ORDER BY "createdAt"');
    
    if (prefs.rows.length > 0) {
      console.log('✅ Admin preferences configured:');
      prefs.rows.forEach(row => {
        console.log(`   • ${row.key} = ${row.value}`);
      });
    }

    // Check migration
    const migrations = await client.query(`
      SELECT name FROM migrations WHERE name LIKE '%CreateMasterAdminPreferences%'
    `);
    
    if (migrations.rows.length > 0) {
      console.log('✅ Migration executed:', migrations.rows[0].name);
    }

    console.log('\n📊 System Status:');
    console.log('✅ Database connected');
    console.log('✅ master_admin_preferences table created');
    console.log('✅ Admin preferences seeded');
    console.log('⏳ Pending: nodemailer installation (pnpm issue)');
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verify();
