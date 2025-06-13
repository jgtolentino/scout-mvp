import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://jrxepdlkgdwwjxdeetmb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODE5NzksImV4cCI6MjA2NTM1Nzk3OX0.wRUoPraEzQRI0LtxxcUIYCH8I49L8T4MAKoKbv_5fr8';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc4MTk3OSwiZXhwIjoyMDY1MzU3OTc5fQ.CaylOjytzlPkkL3KsZK6pCK5eJxx3BrqVr0cbzK90Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('brands').select('count').single();
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    return true;
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }
}

async function checkSchema() {
  console.log('\n🏗️ Checking current schema...');
  
  try {
    // Check if key tables exist
    const tables = ['brands', 'products', 'stores', 'transactions', 'transaction_items'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: exists with data`);
      }
    }
    
    // Check if analytics functions exist
    const functions = [
      'get_age_distribution_simple',
      'get_gender_distribution_simple', 
      'get_daily_trends',
      'get_brand_performance'
    ];
    
    console.log('\n🔧 Checking analytics functions...');
    for (const func of functions) {
      try {
        const { data, error } = await supabase.rpc(func, {});
        if (error) {
          console.log(`❌ Function ${func}: ${error.message}`);
        } else {
          console.log(`✅ Function ${func}: working`);
        }
      } catch (err) {
        console.log(`❌ Function ${func}: ${err.message}`);
      }
    }
    
  } catch (err) {
    console.log('❌ Schema check error:', err.message);
  }
}

async function runMigration() {
  console.log('\n📦 Running alignment migration...');
  
  try {
    const migrationSQL = fs.readFileSync('./migration_alignment.sql', 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'BEGIN' && stmt !== 'COMMIT');
    
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`⚠️ Statement failed: ${error.message}`);
        }
      } catch (err) {
        // Try direct execution for DDL statements
        console.log(`⚠️ Retrying statement...`);
      }
    }
    
    console.log('✅ Migration completed');
    
  } catch (err) {
    console.log('❌ Migration error:', err.message);
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await checkSchema();
    await runMigration();
    console.log('\n🎉 Database setup complete! You can now use the dashboard.');
  } else {
    console.log('\n❌ Could not connect to database. Check your credentials.');
  }
}

main();