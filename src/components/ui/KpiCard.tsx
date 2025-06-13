import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface KpiCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, onClick }) => {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={clsx(
        "kpi-card bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-blue-200"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="metric-label font-medium text-gray-600">{title}</p>
            <p className="metric-value font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <TrendIcon
            className={clsx(
              "h-4 w-4",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          />
          <span
            className={clsx(
              "text-sm font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;