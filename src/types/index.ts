export interface Transaction {
  id: string;
  created_at: string;
  total_amount: number;
  customer_id: string;
  store_id: string;
  items: TransactionItem[];
  store: Store;
  customer: Customer;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: Product;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand_id: string;
  brand: Brand;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  barangay: string;
  city: string;
  region: string;
}

export interface Customer {
  id: string;
  age_group: string;
  gender: string;
  income_bracket: string;
}

export interface FilterState {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  barangays: string[];
  categories: string[];
  brands: string[];
  stores: string[];
}

export interface KPIData {
  totalRevenue: number;
  totalTransactions: number;
  avgOrderValue: number;
  topProduct: string;
  revenueChange: number;
  transactionChange: number;
  aovChange: number;
  topProductChange: number;
}

export interface AIInsight {
  insight: string;
  confidence: number;
  category: 'trend' | 'opportunity' | 'alert';
  actionItems: string[];
}

export interface ChartData {
  name: string;
  value: number;
  change?: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}