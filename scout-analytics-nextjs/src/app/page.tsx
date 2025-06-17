'use client'

import Header from '../components/Header'
import Navigation from '../components/Navigation'
import ExecutiveSummary from '../components/ExecutiveSummary'
import CustomerDemographics from '../components/CustomerDemographics'
import CategoryPerformance from '../components/CategoryPerformance'
import RegionalPerformance from '../components/RegionalPerformance'

export default function HomePage() {
  return (
    <>
      <Header />
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scout Analytics Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">AI-Powered Retail Intelligence Platform</p>
          </div>
          <div className="relative">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="hidden sm:inline">May 16, 2025 - Jun 15, 2025</span>
              <span className="sm:hidden">30 days</span>
              <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100"></div>
          </div>
        </div>

        <div className="space-y-6">
          <ExecutiveSummary />
          <CustomerDemographics />
          <CategoryPerformance />
          <RegionalPerformance />
          
          <div className="mt-12 py-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Scout Analytics Dashboard v2.0 - Powered by TBWA AI Analytics Platform</p>
              <p className="mt-1">Enhanced with Azure OpenAI and real-time insights</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}