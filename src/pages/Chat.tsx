import React, { useState } from 'react';
import { RetailBot } from '../components/RetailBot';
import { EnhancedRetailBot } from '../components/chat/EnhancedRetailBot';
import { Bot, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';

const Chat: React.FC = () => {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Scout AI Retail Assistant
          </h1>
          <button
            onClick={() => setUseEnhanced(!useEnhanced)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              useEnhanced 
                ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {useEnhanced ? '🚀 Enhanced AI' : '📊 Standard Mode'}
          </button>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {useEnhanced 
            ? 'Advanced AI platform for Philippine FMCG intelligence with predictive analytics and strategic insights.'
            : 'Your intelligent companion for Philippine FMCG market analysis. Ask questions about revenue, brands, regions, and get instant insights.'
          }
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Revenue Analysis</h3>
          </div>
          <p className="text-sm text-gray-600">
            Deep insights into sales performance, trends, and growth opportunities across 17 Philippine regions.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Brand Intelligence</h3>
          </div>
          <p className="text-sm text-gray-600">
            TBWA portfolio analysis (Oishi, Del Monte, Champion) with competitive positioning insights.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Context Aware</h3>
          </div>
          <p className="text-sm text-gray-600">
            Understands your applied filters and provides insights based on your current dashboard view.
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg">
        {useEnhanced ? (
          <EnhancedRetailBot className="h-[600px]" />
        ) : (
          <RetailBot className="h-[600px]" />
        )}
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Pro Tips for Better Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Use filters first:</strong> Apply date ranges, regions, or brands in the filter bar above for contextual insights.
          </div>
          <div>
            <strong>Be specific:</strong> Ask "Oishi performance in NCR" instead of just "brand performance".
          </div>
          <div>
            <strong>Ask for comparisons:</strong> "Compare Visayas vs Mindanao revenue" for regional insights.
          </div>
          <div>
            <strong>Request recommendations:</strong> Ask for 3 actionable insights to improve specific metrics.
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">🚀 Sample Questions to Get Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "What are the top 5 FMCG brands by revenue this month?",
            "How is Oishi performing compared to competitors in snacks?",
            "Which regions show the highest growth potential?",
            "What's driving the beverage category performance?",
            "Compare NCR vs CALABARZON market dynamics",
            "Give me 3 recommendations to improve Del Monte sales",
            "What's the average order value trend across regions?",
            "Which store formats are performing best for TBWA brands?"
          ].map((question, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{question}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;