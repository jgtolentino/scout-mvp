import Link from 'next/link'

export default function CustomerDemographics() {
  const ageGroups = [
    { age: '18-25', male: 2340, female: 2580 },
    { age: '26-35', male: 3210, female: 3150 },
    { age: '36-45', male: 2890, female: 2940 },
    { age: '46-55', male: 2450, female: 2680 },
    { age: '56-65', male: 1870, female: 2120 },
    { age: '65+', male: 1240, female: 1590 }
  ]

  const maxValue = Math.max(...ageGroups.map(group => Math.max(group.male, group.female)))
  const totalMale = ageGroups.reduce((sum, group) => sum + group.male, 0)
  const totalFemale = ageGroups.reduce((sum, group) => sum + group.female, 0)
  const totalPopulation = totalMale + totalFemale

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Customer Demographics Overview</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Visual Summary
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">High-level customer distribution insights</p>
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
              {/* Population Pyramid */}
              <div style={{ height: '400px' }} className="population-pyramid">
                <div className="pyramid-header mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 text-center">Age Distribution</h3>
                  <div className="flex justify-center items-center mt-2 space-x-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Male</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-pink-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Female</span>
                    </div>
                  </div>
                </div>

                <div className="pyramid-chart">
                  {ageGroups.map((group, index) => {
                    const maleWidth = (group.male / maxValue) * 100
                    const femaleWidth = (group.female / maxValue) * 100
                    
                    return (
                      <div key={index} className="pyramid-row flex items-center mb-2 group">
                        {/* Male side (left) */}
                        <div className="flex-1 flex justify-end pr-2">
                          <div className="relative">
                            <div 
                              style={{ width: `${maleWidth}%`, minWidth: '20px' }} 
                              className="bg-blue-500 h-8 rounded-l transition-all duration-300 group-hover:bg-blue-600"
                            >
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-medium">
                                {group.male.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Age label (center) */}
                        <div className="w-20 text-center">
                          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {group.age}
                          </span>
                        </div>
                        
                        {/* Female side (right) */}
                        <div className="flex-1 flex justify-start pl-2">
                          <div className="relative">
                            <div 
                              style={{ width: `${femaleWidth}%`, minWidth: '20px' }} 
                              className="bg-pink-500 h-8 rounded-r transition-all duration-300 group-hover:bg-pink-600"
                            >
                              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-medium">
                                {group.female.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pyramid-footer mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{totalMale.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Male</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{totalPopulation.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Population</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-600">{totalFemale.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Female</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Customers</span>
                    <span className="font-semibold text-blue-900">{totalPopulation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <span className="text-gray-700">Female Customers</span>
                    <span className="font-semibold text-pink-900">
                      {((totalFemale / totalPopulation) * 100).toFixed(1)}% ({totalFemale.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Male Customers</span>
                    <span className="font-semibold text-green-900">
                      {((totalMale / totalPopulation) * 100).toFixed(1)}% ({totalMale.toLocaleString()})
                    </span>
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/trends" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View detailed demographics & behavior analysis →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}