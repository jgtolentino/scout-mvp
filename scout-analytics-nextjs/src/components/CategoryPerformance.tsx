import Link from 'next/link'

export default function CategoryPerformance() {
  const categories = [
    { name: 'Beverages', revenue: '₱1.25M', percentage: 32.4, color: 'bg-blue-500' },
    { name: 'Snacks', revenue: '₱892K', percentage: 23.2, color: 'bg-green-500' },
    { name: 'Personal Care', revenue: '₱646K', percentage: 16.8, color: 'bg-purple-500' },
    { name: 'Household', revenue: '₱534K', percentage: 13.9, color: 'bg-orange-500' },
    { name: 'Others', revenue: '₱523K', percentage: 13.6, color: 'bg-gray-500' }
  ]

  const quickActions = [
    {
      href: '/products',
      title: 'Detailed Product Analysis',
      subtitle: 'View complete category breakdown',
      icon: '📊',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      textColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      subtitleColor: 'text-blue-700'
    },
    {
      href: '/trends',
      title: 'Transaction Trends',
      subtitle: 'Time-series analysis',
      icon: '📈',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      textColor: 'text-green-600',
      titleColor: 'text-green-900',
      subtitleColor: 'text-green-700'
    },
    {
      href: '/ai-assist',
      title: 'AI Recommendations',
      subtitle: 'Get intelligent insights',
      icon: '🤖',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      textColor: 'text-purple-600',
      titleColor: 'text-purple-900',
      subtitleColor: 'text-purple-700'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Categories</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Category Summary
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Revenue leaders and market share overview</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-400 transition-transform duration-200 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="transition-all duration-300 overflow-hidden">
        <div className="px-4 pb-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Category */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${category.color} rounded-full mr-3`}></div>
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{category.revenue}</div>
                        <div className="text-xs text-gray-500">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className={`block p-3 ${action.bgColor} rounded-lg ${action.hoverColor} transition-colors`}
                    >
                      <div className="flex items-center">
                        <span className={`${action.textColor} mr-3`}>{action.icon}</span>
                        <div>
                          <div className={`font-medium ${action.titleColor}`}>{action.title}</div>
                          <div className={`text-sm ${action.subtitleColor}`}>{action.subtitle}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}