import Header from '../../components/Header'
import Navigation from '../../components/Navigation'

export default function AIAssistPage() {
  return (
    <>
      <Header />
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">RetailBot AI Assistant</h1>
            <p className="text-lg text-gray-600">Intelligent recommendations powered by Azure OpenAI</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Smart Insights</h3>
              <p className="text-blue-700 text-sm">AI-powered business intelligence and recommendations</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Predictive Analytics</h3>
              <p className="text-green-700 text-sm">Forecast trends and optimize inventory strategies</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Targeted Actions</h3>
              <p className="text-purple-700 text-sm">Personalized suggestions for business growth</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat with RetailBot</h2>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 italic">AI Assistant integration coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}