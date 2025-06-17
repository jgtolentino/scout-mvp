import Header from '../../components/Header'
import Navigation from '../../components/Navigation'

export default function TrendsPage() {
  return (
    <>
      <Header />
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Transaction Trends Analysis</h1>
          <p className="text-lg text-gray-600 mb-8">Time-series analysis and behavioral insights</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Coming Soon</h2>
              <p className="text-blue-700">Advanced trend analysis features will be available in the next release.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">Features Include</h2>
              <ul className="text-green-700 space-y-2">
                <li>• Time-series forecasting</li>
                <li>• Seasonal trend analysis</li>
                <li>• Customer behavior patterns</li>
                <li>• Growth trajectory insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}