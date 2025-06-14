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
    <div className="grid auto-flow-col auto-cols-max gap-4 overflow-x-auto md:grid-flow-row md:grid-cols-6">
      <KpiCard
        title="Total Revenue"
        value={data.totalRevenue}
        change={data.revenueChange}
        icon={DollarSign}
        formatter={formatCurrency}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Transactions"
        value={data.totalTransactions}
        change={data.transactionChange}
        icon={ShoppingCart}
        formatter={formatNumber}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Avg Order Value"
        value={data.avgOrderValue}
        change={data.aovChange}
        icon={TrendingUp}
        formatter={formatCurrency}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Units Sold"
        value={data.unitsSold}
        change={0}
        icon={Package}
        formatter={formatNumber}
        onClick={() => {}}
      />
      
      <KpiCard
        title="Unique Customers"
        value={data.uniqueCustomers}
        change={0}
        icon={Users}
        formatter={formatNumber}
        onClick={() => {}}
      />
      
      <KpiCard
        title="GM %"
        value={data.grossMarginPct}
        change={0}
        icon={Star}
        formatter={formatPercentage}
        onClick={() => {}}
      />
    </div>
  );
};

export default KpiRow;