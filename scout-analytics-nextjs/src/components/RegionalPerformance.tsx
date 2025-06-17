'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegionalPerformance() {
  const [isExpanded, setIsExpanded] = useState(true)

  const regions = [
    {
      name: 'Metro Manila',
      revenue: '₱1.85M',
      growth: '+12.3% growth',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      growthColor: 'text-green-600'
    },
    {
      name: 'Cebu',
      revenue: '₱892K',
      growth: '+8.7% growth',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      growthColor: 'text-green-600'
    },
    {
      name: 'Davao',
      revenue: '₱654K',
      growth: '+15.2% growth',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900',
      growthColor: 'text-green-600'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-gray-400">🗺️</div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Regional Performance Snapshot</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Geography
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Top performing regions and growth indicators</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {regions.map((region, index) => (
                  <div key={index} className={`text-center p-4 ${region.bgColor} rounded-lg`}>
                    <div className={`text-2xl font-bold ${region.textColor}`}>{region.revenue}</div>
                    <div className={`text-sm ${region.textColor.replace('900', '700')}`}>{region.name}</div>
                    <div className={`text-xs ${region.growthColor}`}>{region.growth}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/trends" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View complete regional analysis and maps →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}