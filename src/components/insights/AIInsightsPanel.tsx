import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { AIInsight } from '../../types';
import { mockAIInsights } from '../../data/mockData';
import { useFilterStore } from '../../store/useFilterStore';

const AIInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const { getActiveFilterCount } = useFilterStore();

  const loadInsights = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter insights based on confidence and active filters
    const filteredInsights = mockAIInsights
      .filter(insight => insight.confidence >= 0.7)
      .slice(0, 3);
    
    setInsights(filteredInsights);
    setLoading(false);
  };

  useEffect(() => {
    loadInsights();
  }, [getActiveFilterCount()]);

  const getInsightIcon = (category: AIInsight['category']) => {
    switch (category) {
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightBorderColor = (category: AIInsight['category']) => {
    switch (category) {
      case 'opportunity':
        return 'border-l-yellow-400';
      case 'alert':
        return 'border-l-red-400';
      case 'trend':
        return 'border-l-blue-400';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <button
          onClick={loadInsights}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-l-4 border-gray-200 pl-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`border-l-4 pl-4 pb-4 ${getInsightBorderColor(insight.category)} ${
                index < insights.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-start space-x-2 mb-2">
                {getInsightIcon(insight.category)}
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.insight}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                      {insight.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {insight.actionItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Recommended Actions:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;