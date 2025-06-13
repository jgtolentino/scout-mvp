import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrxepdlkgdwwjxdeetmb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODE5NzksImV4cCI6MjA2NTM1Nzk3OX0.wRUoPraEzQRI0LtxxcUIYCH8I49L8T4MAKoKbv_5fr8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimplifiedFunctions() {
  console.log('🧪 Testing Simplified Function Calls for 5000 Records...\n');

  try {
    // Test with empty filters object (JSONB)
    const filters = {};

    console.log('📊 Testing Dashboard Summary...');
    const { data: dashboardData, error: dashboardError } = await supabase.rpc('get_dashboard_summary', { 
      filters 
    });
    
    if (dashboardError) {
      console.log('❌ Dashboard Summary Error:', dashboardError.message);
    } else {
      console.log('✅ Dashboard Summary Success:', dashboardData);
    }

    console.log('\n👥 Testing Age Distribution...');
    const { data: ageData, error: ageError } = await supabase.rpc('get_age_distribution_simple', { 
      filters 
    });
    
    if (ageError) {
      console.log('❌ Age Distribution Error:', ageError.message);
    } else {
      console.log('✅ Age Distribution Success');
      ageData?.slice(0, 3).forEach(item => {
        console.log(`   ${item.age_group}: ${item.total_revenue || item.count}`);
      });
    }

    console.log('\n🚻 Testing Gender Distribution...');
    const { data: genderData, error: genderError } = await supabase.rpc('get_gender_distribution_simple', { 
      filters 
    });
    
    if (genderError) {
      console.log('❌ Gender Distribution Error:', genderError.message);
    } else {
      console.log('✅ Gender Distribution Success');
      genderData?.forEach(item => {
        console.log(`   ${item.gender}: ₱${item.total_revenue || item.count}`);
      });
    }

    console.log('\n🏪 Testing Location Distribution...');
    const { data: locationData, error: locationError } = await supabase.rpc('get_location_distribution', { 
      filters 
    });
    
    if (locationError) {
      console.log('❌ Location Distribution Error:', locationError.message);
    } else {
      console.log('✅ Location Distribution Success');
      locationData?.slice(0, 3).forEach(item => {
        console.log(`   ${item.barangay}: ₱${item.total_revenue} (${item.transaction_count} txns)`);
      });
    }

    console.log('\n🔤 Testing Brand Performance...');
    const { data: brandData, error: brandError } = await supabase.rpc('get_brand_performance', { 
      filters 
    });
    
    if (brandError) {
      console.log('❌ Brand Performance Error:', brandError.message);
    } else {
      console.log('✅ Brand Performance Success');
      brandData?.slice(0, 3).forEach(item => {
        console.log(`   ${item.brand}: ₱${item.total_revenue} (${item.growth_rate?.toFixed(2)}% growth)`);
      });
    }

    console.log('\n📈 Testing Daily Trends...');
    const { data: dailyData, error: dailyError } = await supabase.rpc('get_daily_trends', { 
      filters 
    });
    
    if (dailyError) {
      console.log('❌ Daily Trends Error:', dailyError.message);
    } else {
      console.log('✅ Daily Trends Success');
      console.log(`   Sample days: ${dailyData?.length || 0} data points`);
      dailyData?.slice(0, 3).forEach(item => {
        console.log(`   ${item.date_label || item.date}: ₱${item.total_revenue} (${item.transaction_count} txns)`);
      });
    }

    // Test direct table queries for verification
    console.log('\n📊 Direct Table Verification...');
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('total_amount, customer_age, customer_gender, checkout_time')
      .limit(3);
    
    console.log('✅ Sample Transactions:');
    transactions?.forEach((tx, i) => {
      console.log(`   ${i + 1}. ₱${tx.total_amount} - ${tx.customer_gender}, ${tx.customer_age}yo - ${tx.checkout_time}`);
    });

    const { data: brands } = await supabase
      .from('brands')
      .select('name, category')
      .limit(5);
    
    console.log('\n✅ Sample Brands:');
    brands?.forEach(brand => {
      console.log(`   ${brand.name} (${brand.category})`);
    });

    const { data: stores } = await supabase
      .from('stores')
      .select('name, barangay, city, region')
      .limit(3);
    
    console.log('\n✅ Sample Stores:');
    stores?.forEach(store => {
      console.log(`   ${store.name} - ${store.barangay}, ${store.city}, ${store.region}`);
    });

    // Calculate basic metrics manually for verification
    console.log('\n📈 Manual Metrics Calculation...');
    
    const { data: revenueSum } = await supabase
      .from('transactions')
      .select('total_amount.sum()');
    
    const { count: txCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    
    const totalRevenue = revenueSum?.[0]?.sum || 0;
    const avgTransaction = totalRevenue / (txCount || 1);
    
    console.log(`✅ Manual Verification:`);
    console.log(`   Total Transactions: ${txCount}`);
    console.log(`   Total Revenue: ₱${totalRevenue.toLocaleString()}`);
    console.log(`   Average Transaction: ₱${avgTransaction.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Test Error:', error);
  }

  console.log('\n🎯 Function Test Complete!');
}

testSimplifiedFunctions();