import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onExpand?: () => void;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = "",
  onExpand 
}) => {
  return (
    <div className={`chart-container bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="metric-label text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {onExpand && (
          <button
            onClick={onExpand}
            className="btn p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;