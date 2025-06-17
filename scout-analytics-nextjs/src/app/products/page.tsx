import Header from '../../components/Header'
import Navigation from '../../components/Navigation'

export default function ProductsPage() {
  return (
    <>
      <Header />
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Mix & SKU Analytics</h1>
          <p className="text-lg text-gray-600 mb-8">Comprehensive product performance insights</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">Product Intelligence</h2>
              <p className="text-purple-700">Deep dive into individual product and category performance metrics.</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-4">Analytics Features</h2>
              <ul className="text-orange-700 space-y-2">
                <li>• SKU performance ranking</li>
                <li>• Category optimization</li>
                <li>• Inventory insights</li>
                <li>• Price elasticity analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}