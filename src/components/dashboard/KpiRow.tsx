import React from 'react';
import { KPIData } from '../../types';
import KpiCard from '../ui/KpiCard';
import { DollarSign, ShoppingCart, TrendingUp, Star, Package, Users } from 'lucide-react';

interface KpiRowProps {
  data: KPIData;
}

const KpiRow: React.FC<KpiRowProps> = ({ data }) => {
  const formatCurrency = (value: number) => `₱${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  /* auto-flow keeps six cards per row on ≥1440 px, falls back to wrap */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCard
        title="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        change={data.revenueChange}
        icon={<DollarSign className="h-5 w-5 text-blue-600" />}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Transactions"
        value={formatNumber(data.totalTransactions)}
        change={data.transactionChange}
        icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Avg Order Value"
        value={formatCurrency(data.avgOrderValue)}
        change={data.aovChange}
        icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Units Sold"
        value={formatNumber(data.unitsSold)}
        change={0}
        icon={<Package className="h-5 w-5 text-blue-600" />}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Unique Customers"
        value={formatNumber(data.uniqueCustomers)}
        change={0}
        icon={<Users className="h-5 w-5 text-blue-600" />}
        onClick={() => {}}
      />
      
      <KpiCard
        title="GM %"
        value={formatPercentage(data.grossMarginPct)}
        change={0}
        icon={<Star className="h-5 w-5 text-blue-600" />}
        onClick={() => {}}
      />
    </div>
  );
};

export default KpiRow;