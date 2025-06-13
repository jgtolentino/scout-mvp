import React, { useState } from 'react';
import { Calendar, MapPin, Package, Tag, Store, Filter, X } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import { mockStores, mockProducts, mockBrands } from '../../data/mockData';
import { format } from 'date-fns';

const GlobalFilterBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    dateRange,
    barangays,
    categories,
    brands,
    stores,
    setDateRange,
    setBarangays,
    setCategories,
    setBrands,
    setStores,
    getActiveFilterCount,
    resetFilters,
  } = useFilterStore();

  const activeFilters = getActiveFilterCount();
  const uniqueBarangays = Array.from(new Set(mockStores.map(s => s.barangay)));
  const uniqueCategories = Array.from(new Set(mockProducts.map(p => p.category)));
  const uniqueBrands = Array.from(new Set(mockBrands.map(b => b.name)));
  const uniqueStores = Array.from(new Set(mockStores.map(s => s.name)));

  const handleMultiSelect = (
    value: string,
    currentValues: string[],
    setter: (values: string[]) => void
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter(v => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 lg:ml-64">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </span>
        </button>

        {activeFilters > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <X className="h-3 w-3" />
            <span>Clear all filters</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Calendar className="inline h-3 w-3 mr-1" />
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange(e.target.value ? new Date(e.target.value) : null, dateRange.to)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="From"
              />
              <input
                type="date"
                value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange(dateRange.from, e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="To"
              />
            </div>
          </div>

          {/* Barangays */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <MapPin className="inline h-3 w-3 mr-1" />
              Barangay
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
              {uniqueBarangays.map(barangay => (
                <label key={barangay} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={barangays.includes(barangay)}
                    onChange={() => handleMultiSelect(barangay, barangays, setBarangays)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{barangay}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Package className="inline h-3 w-3 mr-1" />
              Category
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
              {uniqueCategories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categories.includes(category)}
                    onChange={() => handleMultiSelect(category, categories, setCategories)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Tag className="inline h-3 w-3 mr-1" />
              Brand
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
              {uniqueBrands.map(brand => (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brands.includes(brand)}
                    onChange={() => handleMultiSelect(brand, brands, setBrands)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stores */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Store className="inline h-3 w-3 mr-1" />
              Store
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
              {uniqueStores.map(store => (
                <label key={store} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stores.includes(store)}
                    onChange={() => handleMultiSelect(store, stores, setStores)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{store}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalFilterBar;