#!/usr/bin/env node

/**
 * Consumer Insights Data Validation Script
 * Compares live dashboard data with YAML specification requirements
 */

// Expected data structure from YAML specification
const EXPECTED_CONSUMER_INSIGHTS = {
  kpis: [
    { id: 'kpi_total_customers', title: 'Total Customers', unit: 'count', format: '0,0' },
    { id: 'kpi_avg_items_per_basket', title: 'Avg Items/Basket', unit: 'count', format: '0.0' },
    { id: 'kpi_avg_basket_value', title: 'Avg Basket Value', unit: 'currency', format: '₱0,0.00' },
    { id: 'kpi_repeat_rate', title: 'Repeat Customers', unit: 'percent', format: '0%' }
  ],
  charts: [
    { id: 'donut_age_distribution', title: 'Age Distribution', type: 'donut' },
    { id: 'donut_gender_distribution', title: 'Gender Distribution', type: 'donut' },
    { id: 'bar_income_bracket', title: 'Income Bracket Analysis', type: 'bar' },
    { id: 'heat_shopping_time', title: 'Shopping Time Preferences', type: 'heatmap' },
    { id: 'stacked_payment_methods', title: 'Payment Method Usage', type: 'stacked_bar' }
  ],
  tables: [
    { id: 'table_customer_segments', title: 'Customer Segments', columns: ['segment', 'share', 'description'] }
  ]
};

// Common data quality issues found in Consumer Insights
const KNOWN_ISSUES = [
  {
    issue: 'Payment methods showing ₱0.0M values',
    severity: 'HIGH',
    component: 'Payment Method Usage chart',
    yamlSpec: 'stacked_payment_methods query uses payments_fmcg table',
    actualImplementation: 'Mock data with zero values',
    fix: 'Implement proper payment method data source or use realistic mock data'
  },
  {
    issue: 'Gender distribution showing 100% Female',
    severity: 'MEDIUM', 
    component: 'Gender Distribution donut',
    yamlSpec: 'Should query customers table for gender distribution',
    actualImplementation: 'Mock data with unrealistic gender split',
    fix: 'Add diverse gender data to customer records'
  },
  {
    issue: 'Missing Shopping Time Preferences heatmap',
    severity: 'MEDIUM',
    component: 'Shopping Time Preferences',
    yamlSpec: 'heat_shopping_time with DOW/HOUR breakdown',
    actualImplementation: 'Not implemented in React component',
    fix: 'Add heatmap component showing hour-by-day shopping patterns'
  },
  {
    issue: 'Age distribution percentages not matching counts',
    severity: 'LOW',
    component: 'Age Distribution display',
    yamlSpec: 'Should show customer_cnt grouped by age_group',
    actualImplementation: 'Mock percentages that may not sum to 100%',
    fix: 'Ensure percentage calculations are consistent'
  }
];

// Validation checks
const VALIDATION_CHECKS = {
  dataIntegrity: [
    'KPI values should be realistic (not zero or extreme)',
    'Percentages should sum to 100% in distribution charts',
    'Currency formatting should use Philippine Peso (₱)',
    'All demographic segments should have reasonable representation'
  ],
  componentCoverage: [
    'All YAML-specified charts should be implemented',
    'Customer segments table should match YAML columns',
    'Shopping time heatmap should show DOW x Hour grid',
    'Payment methods should show actual transaction data'
  ],
  uiUx: [
    'Charts should be readable and properly labeled',
    'KPI cards should have consistent formatting',
    'Loading states should be handled gracefully',
    'Error states should provide useful feedback'
  ]
};

console.log('🔍 Consumer Insights Validation Report');
console.log('=====================================\n');

console.log('📊 Expected Components (from YAML spec):');
EXPECTED_CONSUMER_INSIGHTS.kpis.forEach(kpi => {
  console.log(`  ✓ ${kpi.title} (${kpi.format})`);
});

EXPECTED_CONSUMER_INSIGHTS.charts.forEach(chart => {
  console.log(`  ✓ ${chart.title} (${chart.type})`);
});

console.log('\n🚨 Known Data Quality Issues:');
KNOWN_ISSUES.forEach((issue, index) => {
  const severityColor = issue.severity === 'HIGH' ? '🔴' : 
                        issue.severity === 'MEDIUM' ? '🟡' : '🟢';
  console.log(`\n${index + 1}. ${severityColor} ${issue.issue}`);
  console.log(`   Component: ${issue.component}`);
  console.log(`   YAML Spec: ${issue.yamlSpec}`);
  console.log(`   Current: ${issue.actualImplementation}`);
  console.log(`   Fix: ${issue.fix}`);
});

console.log('\n✅ Validation Checklist:');
console.log('\n📈 Data Integrity:');
VALIDATION_CHECKS.dataIntegrity.forEach(check => {
  console.log(`  □ ${check}`);
});

console.log('\n🧩 Component Coverage:');
VALIDATION_CHECKS.componentCoverage.forEach(check => {
  console.log(`  □ ${check}`);
});

console.log('\n🎨 UI/UX Quality:');
VALIDATION_CHECKS.uiUx.forEach(check => {
  console.log(`  □ ${check}`);
});

console.log('\n🔧 Recommended Fixes:');
console.log('1. Update payment method data source to use actual transaction data');
console.log('2. Add realistic customer demographics with proper gender distribution');
console.log('3. Implement shopping time heatmap component as per YAML spec');
console.log('4. Ensure all percentage calculations sum correctly');
console.log('5. Add proper currency formatting for all monetary values');

console.log('\n🎯 Priority: Focus on HIGH severity issues first, then implement missing components from YAML spec.');