import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Tag, Store, Filter, X, ChevronDown } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { clsx } from 'clsx';

// TBWA Brand mapping
const TBWA_BRANDS = ['Oishi', 'Del Monte', 'Champion'];

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Beverages': '🧃',
  'Snacks': '🍿', 
  'Dairy': '🥛',
  'Personal Care': '🧴',
  'Household': '🧼',
  'Canned Goods': '🥫',
  'Condiments': '🍅'
};

const GlobalFilterBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uniqueBarangays, setUniqueBarangays] = useState<string[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);
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

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch unique barangays
        const { data: barangayData } = await supabase
          .from('stores')
          .select('barangay');
        const uniqueBarangayList = [...new Set(barangayData?.map(b => b.barangay) || [])];
        setUniqueBarangays(uniqueBarangayList);

        // Fetch unique categories
        const { data: categoryData } = await supabase
          .from('products')
          .select('category');
        const uniqueCategoryList = [...new Set(categoryData?.map(c => c.category) || [])];
        setUniqueCategories(uniqueCategoryList);

        // Fetch unique brands - prioritize TBWA brands
        const { data: brandData } = await supabase
          .from('brands')
          .select('name');
        const allBrands = brandData?.map(b => b.name) || [];
        // Sort with TBWA brands first
        const sortedBrands = [...allBrands].sort((a, b) => {
          const aTBWA = TBWA_BRANDS.includes(a);
          const bTBWA = TBWA_BRANDS.includes(b);
          if (aTBWA && !bTBWA) return -1;
          if (!aTBWA && bTBWA) return 1;
          return a.localeCompare(b);
        });
        setUniqueBrands(sortedBrands);

        // Fetch unique stores
        const { data: storeData } = await supabase
          .from('stores')
          .select('name');
        setUniqueStores(storeData?.map(s => s.name) || []);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

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
    <div className="tbwa-header sticky top-0 z-50 px-6 py-4 lg:ml-64">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-3 text-tbwa-navy hover:text-tbwa-navy-800 transition-colors group"
        >
          <div className="p-2 bg-tbwa-navy-50 group-hover:bg-tbwa-navy-100 rounded-lg transition-colors">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-base">Smart Filters</span>
            {activeFilters > 0 && (
              <span className="ml-2 tbwa-badge">{activeFilters} active</span>
            )}
          </div>
          <ChevronDown className={clsx(
            "h-4 w-4 transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )} />
        </button>

        <div className="flex items-center space-x-3">
          {activeFilters > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Clear All</span>
            </button>
          )}
          
          {/* Filter Presets */}
          <div className="flex items-center space-x-2">
            <button className="tbwa-btn-secondary text-xs px-3 py-1.5">
              📊 Executive View
            </button>
            <button className="tbwa-btn-secondary text-xs px-3 py-1.5">
              🏷️ Brand Manager
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilters > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {dateRange.from && (
            <span className="tbwa-filter-chip tbwa-filter-chip-active">
              📅 {format(dateRange.from, 'MMM dd')} - {dateRange.to ? format(dateRange.to, 'MMM dd') : 'now'}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDateRange(null, null)} />
            </span>
          )}
          {barangays.map(barangay => (
            <span key={barangay} className="tbwa-filter-chip tbwa-filter-chip-active">
              📍 {barangay}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleMultiSelect(barangay, barangays, setBarangays)} />
            </span>
          ))}
          {categories.map(category => (
            <span key={category} className="tbwa-filter-chip tbwa-filter-chip-active">
              {CATEGORY_ICONS[category] || '📦'} {category}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleMultiSelect(category, categories, setCategories)} />
            </span>
          ))}
          {brands.map(brand => (
            <span key={brand} className={clsx(
              "tbwa-filter-chip tbwa-filter-chip-active",
              TBWA_BRANDS.includes(brand) && "tbwa-brand-highlight"
            )}>
              {TBWA_BRANDS.includes(brand) ? '⭐' : '🏷️'} {brand}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleMultiSelect(brand, brands, setBrands)} />
            </span>
          ))}
          {stores.map(store => (
            <span key={store} className="tbwa-filter-chip tbwa-filter-chip-active">
              🏪 {store}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleMultiSelect(store, stores, setStores)} />
            </span>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Calendar className="inline h-4 w-4 mr-2" />
              Date Range
            </label>
            <div className="space-y-3">
              <input
                type="date"
                value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange(e.target.value ? new Date(e.target.value) : null, dateRange.to)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbwa-navy focus:border-tbwa-navy transition-colors"
                placeholder="From"
              />
              <input
                type="date"
                value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange(dateRange.from, e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbwa-navy focus:border-tbwa-navy transition-colors"
                placeholder="To"
              />
            </div>
          </div>

          {/* Barangays */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <MapPin className="inline h-4 w-4 mr-2" />
              Region
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {uniqueBarangays.map(barangay => (
                <label key={barangay} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={barangays.includes(barangay)}
                    onChange={() => handleMultiSelect(barangay, barangays, setBarangays)}
                    className="h-4 w-4 text-tbwa-navy rounded border-gray-300 focus:ring-tbwa-navy"
                  />
                  <span className="text-sm text-gray-700 font-medium">{barangay}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories with Icons */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Package className="inline h-4 w-4 mr-2" />
              Category
            </label>
            <div className="space-y-2">
              {uniqueCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleMultiSelect(category, categories, setCategories)}
                  className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                    categories.includes(category)
                      ? "bg-tbwa-navy text-white border-tbwa-navy shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:border-tbwa-navy-300 hover:bg-tbwa-navy-50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{CATEGORY_ICONS[category] || '📦'}</span>
                    <span className="text-sm font-medium">{category}</span>
                  </div>
                  {categories.includes(category) && (
                    <div className="w-2 h-2 bg-tbwa-yellow rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brands with TBWA Highlighting */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Tag className="inline h-4 w-4 mr-2" />
              Brand
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {uniqueBrands.map(brand => {
                const isTBWA = TBWA_BRANDS.includes(brand);
                return (
                  <label 
                    key={brand} 
                    className={clsx(
                      "flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-colors",
                      isTBWA ? "bg-tbwa-yellow-50 border border-tbwa-yellow-200" : "hover:bg-gray-50",
                      brands.includes(brand) && "bg-tbwa-navy-50 border-tbwa-navy-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={brands.includes(brand)}
                      onChange={() => handleMultiSelect(brand, brands, setBrands)}
                      className="h-4 w-4 text-tbwa-navy rounded border-gray-300 focus:ring-tbwa-navy"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{isTBWA ? '⭐' : '🏷️'}</span>
                      <span className={clsx(
                        "text-sm font-medium",
                        isTBWA ? "text-tbwa-navy font-semibold" : "text-gray-700"
                      )}>
                        {brand}
                      </span>
                      {isTBWA && <span className="tbwa-badge-yellow text-xs">TBWA</span>}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Stores */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Store className="inline h-4 w-4 mr-2" />
              Store
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {uniqueStores.map(store => (
                <label key={store} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={stores.includes(store)}
                    onChange={() => handleMultiSelect(store, stores, setStores)}
                    className="h-4 w-4 text-tbwa-navy rounded border-gray-300 focus:ring-tbwa-navy"
                  />
                  <span className="text-sm text-gray-700 font-medium">{store}</span>
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