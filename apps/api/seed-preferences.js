const pg = require('pg');

const client = new pg.Client({
  connectionString: 'postgresql://countrynaturalfoods:countrynaturalfoods@localhost:5432/countrynaturalfoods'
});

async function seedPreferences() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Insert admin_email
    await client.query(
      "INSERT INTO master_admin_preferences (key, value, description) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2",
      ['admin_email', 'hemanthreddy.y143@gmail.com', 'Primary admin email for order notifications']
    );
    console.log('✅ Seeded admin_email');

    // Insert email_from
    await client.query(
      "INSERT INTO master_admin_preferences (key, value, description) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2",
      ['email_from', 'noreply@countrynaturalfoods.com', 'From email address for sending emails']
    );
    console.log('✅ Seeded email_from');

    // Verify
    const result = await client.query('SELECT * FROM master_admin_preferences');
    console.log('\n📋 Current preferences:');
    console.table(result.rows);

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedPreferences();
