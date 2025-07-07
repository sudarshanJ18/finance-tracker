'use client';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Info, TrendingUp, TrendingDown, DollarSign, Calendar, Target, Zap } from 'lucide-react';

interface SpendingInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  category: string;
  message: string;
  amount?: number;
  percentage?: number;
  trend?: 'up' | 'down';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface Props {
  insights?: SpendingInsight[];
}

export default function SpendingInsights({ insights: propInsights }: Props) {
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleInsights, setVisibleInsights] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Simulate real-time insight generation
  useEffect(() => {
    const generateInsights = () => {
      const categories = ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Bills & Utilities', 'Healthcare'];
      const insights: SpendingInsight[] = [];
      
      // Generate various types of insights
      for (let i = 0; i < 8; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const amount = Math.floor(Math.random() * 500) + 50;
        const percentage = Math.floor(Math.random() * 30) + 5;
        const types: ('warning' | 'success' | 'info')[] = ['warning', 'success', 'info'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let message = '';
        switch (type) {
          case 'warning':
            message = `You've spent ${percentage}% more on ${category.toLowerCase()} this month than last month ($${amount})`;
            break;
          case 'success':
            message = `Great job! You've saved ${percentage}% on ${category.toLowerCase()} compared to last month ($${amount})`;
            break;
          case 'info':
            message = `Your ${category.toLowerCase()} spending is consistent with your monthly average ($${amount})`;
            break;
        }
        
        insights.push({
          id: `insight-${i}`,
          type,
          category,
          message,
          amount,
          percentage,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
        });
      }
      
      return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    };

    setTimeout(() => {
      setInsights(propInsights || generateInsights());
      setLoading(false);
    }, 1000);
  }, [propInsights]);

  // Animate insights appearance
  useEffect(() => {
    if (!loading && insights.length > 0) {
      const timer = setInterval(() => {
        setVisibleInsights(prev => {
          if (prev < insights.length) {
            return prev + 1;
          }
          clearInterval(timer);
          return prev;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [loading, insights.length]);

  const getIcon = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="text-amber-500 w-5 h-5 mr-3 animate-pulse" />;
      case 'success':
        return <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 animate-bounce" />;
      case 'info':
        return <Info className="text-blue-500 w-5 h-5 mr-3 animate-pulse" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-red-500" /> : 
      <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getBackgroundGradient = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'from-amber-50 to-orange-50 border-amber-200';
      case 'success':
        return 'from-emerald-50 to-green-50 border-emerald-200';
      case 'info':
        return 'from-blue-50 to-indigo-50 border-blue-200';
    }
  };

  const categories = ['all', ...Array.from(new Set(insights.map(i => i.category)))];
  const filteredInsights = selectedCategory === 'all' ? insights : insights.filter(i => i.category === selectedCategory);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Spending Insights
            </h2>
          </div>
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}} />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-300 rounded-full mt-1"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Spending Insights
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No insights available yet</p>
          <p className="text-gray-400 text-sm mt-2">Start tracking your expenses to see personalized insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Spending Insights
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-600">{insights.length} insights</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight, index) => (
          <div
            key={insight.id}
            className={`transform transition-all duration-500 hover:scale-[1.02] ${
              index < visibleInsights 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className={`bg-gradient-to-r ${getBackgroundGradient(insight.type)} p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow duration-300`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {getIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold ${
                          insight.type === 'warning'
                            ? 'border-amber-400 text-amber-700 bg-amber-50'
                            : insight.type === 'success'
                            ? 'border-emerald-400 text-emerald-700 bg-emerald-50'
                            : 'border-blue-400 text-blue-700 bg-blue-50'
                        }`}
                      >
                        {insight.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          insight.priority === 'high'
                            ? 'border-red-400 text-red-700 bg-red-50'
                            : insight.priority === 'medium'
                            ? 'border-yellow-400 text-yellow-700 bg-yellow-50'
                            : 'border-gray-400 text-gray-700 bg-gray-50'
                        }`}
                      >
                        {insight.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">
                      {insight.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{insight.timestamp.toLocaleDateString()}</span>
                      </div>
                      {insight.amount && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${insight.amount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {insight.trend && getTrendIcon(insight.trend)}
                  {insight.percentage && (
                    <span className={`text-sm font-semibold ${
                      insight.trend === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {insight.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live insights</span>
          </div>
        </div>
      </div>
    </div>
  );
}