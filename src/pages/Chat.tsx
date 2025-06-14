import React from 'react';
import ScoutRetailBot from '../components/chat/ScoutRetailBot';
import { MessageCircle } from 'lucide-react';

const Chat: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Scout AI Chat</h1>
            <p className="text-indigo-100">
              Ask me anything about your retail data, trends, and insights
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <ScoutRetailBot />
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask About Trends</h3>
          <p className="text-sm text-gray-600">
            "What are my best selling products this month?"
            "Show me revenue trends for the last quarter"
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Insights</h3>
          <p className="text-sm text-gray-600">
            "Which customer segments are most profitable?"
            "What's the average basket size by region?"
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategic Advice</h3>
          <p className="text-sm text-gray-600">
            "How can I improve my inventory turnover?"
            "Suggest promotions for slow-moving items"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;