import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrxepdlkgdwwjxdeetmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc4MTk3OSwiZXhwIjoyMDY1MzU3OTc5fQ.CaylOjytzlPkkL3KsZK6pCK5eJxx3BrqVr0cbzK90Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔧 Running function overload fix migration...\n');
  
  try {
    // Read migration SQL
    const fs = await import('fs');
    const migrationSQL = fs.readFileSync('./fix_function_overloads.sql', 'utf8');
    
    console.log('📝 Migration SQL loaded, applying fixes...');
    console.log('Note: This needs to be run in Supabase SQL Editor\n');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

async function testFixedFunctions() {
  console.log('🧪 Testing Fixed Functions...\n');

  try {
    // Test 1: Age distribution with new signature
    console.log('📊 Test 1: Age Distribution (with date parameters)');
    const { data: ageData1, error: ageError1 } = await supabase.rpc('get_age_distribution_simple', {
      p_start_date: '2025-01-01',
      p_end_date: '2025-12-31'
    });
    
    if (ageError1) {
      console.log('❌ With dates failed:', ageError1.message);
    } else {
      console.log('✅ With dates success:');
      ageData1?.forEach(item => {
        console.log(`   ${item.age_group}: ${item.count} (${item.percentage}%)`);
      });
    }

    // Test 2: Age distribution without parameters (should use defaults)
    console.log('\n📊 Test 2: Age Distribution (no parameters)');
    const { data: ageData2, error: ageError2 } = await supabase.rpc('get_age_distribution_simple');
    
    if (ageError2) {
      console.log('❌ Without params failed:', ageError2.message);
    } else {
      console.log('✅ Without params success:');
      ageData2?.forEach(item => {
        console.log(`   ${item.age_group}: ${item.count} (${item.percentage}%)`);
      });
    }

    // Test 3: Check if customer_age and customer_gender columns exist
    console.log('\n🔍 Test 3: Checking transaction columns');
    const { data: sampleTx, error: txError } = await supabase
      .from('transactions')
      .select('id, customer_age, customer_gender, total_amount')
      .limit(3);
    
    if (txError) {
      console.log('❌ Transaction query failed:', txError.message);
    } else {
      console.log('✅ Transaction columns exist:');
      sampleTx?.forEach(tx => {
        console.log(`   ID: ${tx.id}, Age: ${tx.customer_age}, Gender: ${tx.customer_gender}, Amount: ₱${tx.total_amount}`);
      });
    }

    // Test 4: Check if brands.alias column exists
    console.log('\n🔍 Test 4: Checking brands.alias column');
    const { data: sampleBrands, error: brandError } = await supabase
      .from('brands')
      .select('id, name, alias')
      .limit(3);
    
    if (brandError) {
      console.log('❌ Brand query failed:', brandError.message);
    } else {
      console.log('✅ Brand alias column exists:');
      sampleBrands?.forEach(brand => {
        console.log(`   ${brand.name} (alias: ${brand.alias || 'NULL'})`);
      });
    }

    // Test 5: Verify other functions still work with filters object
    console.log('\n📊 Test 5: Other functions with filters object');
    const filters = {};
    
    const { data: dashData, error: dashError } = await supabase.rpc('get_dashboard_summary', { filters });
    if (dashError) {
      console.log('❌ Dashboard summary failed:', dashError.message);
    } else {
      console.log('✅ Dashboard summary works: Total revenue = ₱' + dashData?.total_revenue?.toLocaleString());
    }

    console.log('\n🎯 Function Fix Summary:');
    console.log('1. Run fix_function_overloads.sql in Supabase SQL Editor');
    console.log('2. This will remove conflicting function overloads');
    console.log('3. Age distribution will use date parameters');
    console.log('4. Other functions continue using filters object');
    console.log('5. Missing columns (customer_age, customer_gender, alias) will be added');

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

// Run tests
runMigration();
testFixedFunctions();