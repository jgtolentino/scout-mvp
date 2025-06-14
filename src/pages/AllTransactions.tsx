import React from 'react';
import { TransactionDataTable } from '../components/TransactionDataTable';

const AllTransactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Transaction Records</h1>
        <p className="text-gray-600">
          Complete view of all 5,000 FMCG transactions in the Scout Analytics database. 
          Use filters and search to explore the data in detail.
        </p>
      </div>
      
      <TransactionDataTable className="min-h-[600px]" />
    </div>
  );
};

export default AllTransactions;