import { Transaction, Product, Brand, Store, Customer, AIInsight } from '../types';
import { subDays } from 'date-fns';

// Mock Brands
export const mockBrands: Brand[] = [
  { id: '1', name: 'Nestlé' },
  { id: '2', name: 'Unilever' },
  { id: '3', name: 'Procter & Gamble' },
  { id: '4', name: 'Coca-Cola' },
  { id: '5', name: 'Pepsi' },
  { id: '6', name: 'Del Monte' },
  { id: '7', name: 'Lucky Me!' },
  { id: '8', name: 'Colgate' },
  { id: '9', name: 'Palmolive' },
  { id: '10', name: 'Safeguard' },
];

// Mock Products
export const mockProducts: Product[] = [
  { id: '1', name: 'Nescafé Original', category: 'Beverages', brand_id: '1', brand: mockBrands[0] },
  { id: '2', name: 'Maggi Noodles', category: 'Food', brand_id: '1', brand: mockBrands[0] },
  { id: '3', name: 'Dove Soap', category: 'Personal Care', brand_id: '2', brand: mockBrands[1] },
  { id: '4', name: 'Knorr Seasoning', category: 'Food', brand_id: '2', brand: mockBrands[1] },
  { id: '5', name: 'Head & Shoulders', category: 'Personal Care', brand_id: '3', brand: mockBrands[2] },
  { id: '6', name: 'Tide Detergent', category: 'Home Care', brand_id: '3', brand: mockBrands[2] },
  { id: '7', name: 'Coca-Cola Classic', category: 'Beverages', brand_id: '4', brand: mockBrands[3] },
  { id: '8', name: 'Sprite', category: 'Beverages', brand_id: '4', brand: mockBrands[3] },
  { id: '9', name: 'Pepsi Cola', category: 'Beverages', brand_id: '5', brand: mockBrands[4] },
  { id: '10', name: 'Mountain Dew', category: 'Beverages', brand_id: '5', brand: mockBrands[4] },
  { id: '11', name: 'Del Monte Corned Beef', category: 'Food', brand_id: '6', brand: mockBrands[5] },
  { id: '12', name: 'Del Monte Fruit Cocktail', category: 'Food', brand_id: '6', brand: mockBrands[5] },
  { id: '13', name: 'Lucky Me! Instant Noodles', category: 'Food', brand_id: '7', brand: mockBrands[6] },
  { id: '14', name: 'Lucky Me! Pancit Canton', category: 'Food', brand_id: '7', brand: mockBrands[6] },
  { id: '15', name: 'Colgate Toothpaste', category: 'Personal Care', brand_id: '8', brand: mockBrands[7] },
  { id: '16', name: 'Palmolive Shampoo', category: 'Personal Care', brand_id: '9', brand: mockBrands[8] },
  { id: '17', name: 'Safeguard Soap', category: 'Personal Care', brand_id: '10', brand: mockBrands[9] },
];

// Mock Stores
export const mockStores: Store[] = [
  { id: '1', name: 'SM Supermarket', barangay: 'Poblacion', city: 'Makati', region: 'NCR' },
  { id: '2', name: 'Robinson\'s Supermarket', barangay: 'Bel-Air', city: 'Makati', region: 'NCR' },
  { id: '3', name: 'Mercury Drug', barangay: 'Salcedo Village', city: 'Makati', region: 'NCR' },
  { id: '4', name: 'Puregold', barangay: 'San Lorenzo', city: 'Makati', region: 'NCR' },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  { id: '1', age_group: '18-25', gender: 'F', income_bracket: 'Low' },
  { id: '2', age_group: '26-35', gender: 'M', income_bracket: 'Medium' },
  { id: '3', age_group: '36-45', gender: 'F', income_bracket: 'High' },
  { id: '4', age_group: '46-55', gender: 'M', income_bracket: 'Medium' },
  { id: '5', age_group: '56+', gender: 'F', income_bracket: 'Low' },
];

// Generate mock transactions
export const generateMockTransactions = (count: number = 18000): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomDate = subDays(new Date(), Math.floor(Math.random() * 90));
    const randomStore = mockStores[Math.floor(Math.random() * mockStores.length)];
    const randomCustomer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
    
    // Generate 1-5 items per transaction
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let totalAmount = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = Math.floor(Math.random() * 500) + 50;
      
      items.push({
        id: `item-${i}-${j}`,
        transaction_id: `trans-${i}`,
        product_id: randomProduct.id,
        quantity,
        unit_price: unitPrice,
        product: randomProduct,
      });
      
      totalAmount += quantity * unitPrice;
    }
    
    transactions.push({
      id: `trans-${i}`,
      created_at: randomDate.toISOString(),
      total_amount: totalAmount,
      customer_id: randomCustomer.id,
      store_id: randomStore.id,
      items,
      store: randomStore,
      customer: randomCustomer,
    });
  }
  
  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    insight: "Beverages category showing 23% growth in Poblacion area, driven by increased demand for premium coffee products.",
    confidence: 0.89,
    category: 'opportunity',
    actionItems: [
      "Increase coffee product inventory by 15%",
      "Consider premium coffee brand partnerships",
      "Optimize shelf placement for beverage category"
    ]
  },
  {
    insight: "Personal Care products experiencing 15% decline in sales among 18-25 age group compared to last month.",
    confidence: 0.76,
    category: 'alert',
    actionItems: [
      "Launch targeted marketing campaign for young adults",
      "Review pricing strategy for personal care items",
      "Introduce sample promotions"
    ]
  },
  {
    insight: "Cross-selling opportunity identified: Customers buying noodles are 60% more likely to purchase beverages.",
    confidence: 0.82,
    category: 'trend',
    actionItems: [
      "Create combo meal promotions",
      "Position beverages near noodle products",
      "Develop bundled pricing strategies"
    ]
  },
  {
    insight: "Weekend sales peak between 2-4 PM, suggesting optimal staffing and inventory management opportunities.",
    confidence: 0.91,
    category: 'opportunity',
    actionItems: [
      "Increase weekend afternoon staffing",
      "Ensure peak hour inventory availability",
      "Consider weekend-specific promotions"
    ]
  }
];

export const mockTransactions = generateMockTransactions();