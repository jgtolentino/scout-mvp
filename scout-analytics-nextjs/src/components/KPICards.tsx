export default function KPICards() {
  const kpis = [
    {
      title: 'Total Revenue',
      value: '₱3.84M',
      change: '+8.2%',
      changeType: 'positive',
      icon: '💰',
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Transactions',
      value: '15,642',
      change: '+5.4%',
      changeType: 'positive',
      icon: '🛒',
      bgColor: 'bg-green-500'
    },
    {
      title: 'Active Customers',
      value: '8,932',
      change: '+12.1%',
      changeType: 'positive',
      icon: '👥',
      bgColor: 'bg-purple-500'
    },
    {
      title: 'Avg Basket',
      value: '₱245',
      change: '-1.2%',
      changeType: 'negative',
      icon: '📦',
      bgColor: 'bg-orange-500'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-gray-400">📊</div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                KPI Cards
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Key performance indicators and business metrics</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                        <span className="text-white text-sm">{kpi.icon}</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{kpi.title}</dt>
                        <dd className="text-lg font-medium text-gray-900">{kpi.value}</dd>
                      </dl>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-sm font-medium ${
                        kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}