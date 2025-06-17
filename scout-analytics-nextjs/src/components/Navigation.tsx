'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  {
    href: '/',
    icon: '📊',
    title: 'Overview',
    subtitle: 'Executive Overview',
    badge: '4 Charts'
  },
  {
    href: '/trends',
    icon: '📈',
    title: 'Trends',
    subtitle: 'Transaction Trends',
    badge: 'Time Series'
  },
  {
    href: '/products',
    icon: '📦',
    title: 'Products',
    subtitle: 'Product Mix & SKU',
    badge: 'Analytics'
  },
  {
    href: '/ai-assist',
    icon: '🤖',
    title: 'RetailBot',
    subtitle: 'AI Insights',
    badge: 'AI Powered'
  }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-xs text-gray-400">{item.subtitle}</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {item.badge}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <div className="flex overflow-x-auto px-4 py-2 space-x-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center p-3 rounded-lg min-w-0 flex-shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium text-center">{item.title}</span>
                  <span className="mt-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {item.badge}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}