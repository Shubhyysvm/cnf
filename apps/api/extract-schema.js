const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'countrynaturalfoods',
  password: 'countrynaturalfoods',
  database: 'countrynaturalfoods',
});

async function extractSchema() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    let schemaOutput = `-- PostgreSQL Database Schema Export
-- Database: countrynaturalfoods
-- Generated: ${new Date().toISOString()}
-- ============================================\n\n`;

    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const { rows: tables } = await client.query(tablesQuery);
    console.log(`Found ${tables.length} tables`);

    for (const { table_name } of tables) {
      schemaOutput += `\n-- ============================================\n`;
      schemaOutput += `-- Table: ${table_name}\n`;
      schemaOutput += `-- ============================================\n\n`;

      // Get columns
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const { rows: columns } = await client.query(columnsQuery, [table_name]);
      
      schemaOutput += `CREATE TABLE "${table_name}" (\n`;
      
      const columnDefs = columns.map(col => {
        let def = `  "${col.column_name}" ${col.data_type}`;
        
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });
      
      schemaOutput += columnDefs.join(',\n');

      // Get primary key
      const pkQuery = `
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
        ORDER BY kcu.ordinal_position;
      `;
      
      const { rows: pkCols } = await client.query(pkQuery, [table_name]);
      
      if (pkCols.length > 0) {
        const pkColNames = pkCols.map(c => `"${c.column_name}"`).join(', ');
        schemaOutput += `,\n  PRIMARY KEY (${pkColNames})`;
      }

      schemaOutput += `\n);\n\n`;

      // Get indexes
      const indexQuery = `
        SELECT
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique
        FROM
          pg_class t,
          pg_class i,
          pg_index ix,
          pg_attribute a
        WHERE
          t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relname = $1
          AND i.relname NOT LIKE '%_pkey'
        ORDER BY i.relname, a.attnum;
      `;
      
      const { rows: indexes } = await client.query(indexQuery, [table_name]);
      
      if (indexes.length > 0) {
        const indexMap = new Map();
        indexes.forEach(idx => {
          if (!indexMap.has(idx.index_name)) {
            indexMap.set(idx.index_name, {
              is_unique: idx.is_unique,
              columns: []
            });
          }
          indexMap.get(idx.index_name).columns.push(idx.column_name);
        });
        
        indexMap.forEach((idx, name) => {
          const uniqueStr = idx.is_unique ? 'UNIQUE ' : '';
          const cols = idx.columns.map(c => `"${c}"`).join(', ');
          schemaOutput += `CREATE ${uniqueStr}INDEX "${name}" ON "${table_name}" (${cols});\n`;
        });
        schemaOutput += '\n';
      }

      // Get foreign keys
      const fkQuery = `
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.update_rule,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
          AND rc.constraint_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1;
      `;
      
      const { rows: fks } = await client.query(fkQuery, [table_name]);
      
      if (fks.length > 0) {
        fks.forEach(fk => {
          schemaOutput += `ALTER TABLE "${table_name}" ADD CONSTRAINT "${fk.constraint_name}" `;
          schemaOutput += `FOREIGN KEY ("${fk.column_name}") `;
          schemaOutput += `REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}")`;
          if (fk.update_rule !== 'NO ACTION') {
            schemaOutput += ` ON UPDATE ${fk.update_rule}`;
          }
          if (fk.delete_rule !== 'NO ACTION') {
            schemaOutput += ` ON DELETE ${fk.delete_rule}`;
          }
          schemaOutput += ';\n';
        });
        schemaOutput += '\n';
      }

      console.log(`Processed table: ${table_name}`);
    }

    // Get sequences
    const seqQuery = `
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name;
    `;
    
    const { rows: sequences } = await client.query(seqQuery);
    
    if (sequences.length > 0) {
      schemaOutput += `\n-- ============================================\n`;
      schemaOutput += `-- Sequences\n`;
      schemaOutput += `-- ============================================\n\n`;
      
      for (const { sequence_name } of sequences) {
        schemaOutput += `-- Sequence: ${sequence_name}\n`;
        const seqDetails = await client.query(`SELECT * FROM "${sequence_name}"`);
        if (seqDetails.rows.length > 0) {
          const seq = seqDetails.rows[0];
          schemaOutput += `CREATE SEQUENCE "${sequence_name}" START WITH ${seq.last_value};\n\n`;
        }
      }
    }

    // Save to file
    fs.writeFileSync('database_schema.sql', schemaOutput);
    console.log('\n✓ Schema exported successfully to database_schema.sql');
    console.log(`Total tables: ${tables.length}`);

  } catch (error) {
    console.error('Error extracting schema:', error);
  } finally {
    await client.end();
  }
}

extractSchema();
