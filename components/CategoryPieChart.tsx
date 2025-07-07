import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';

// Sample data generator
const generateSampleData = () => {
  const categories = [
    { name: 'Food', color: '#FF6B6B' },
    { name: 'Transportation', color: '#4ECDC4' },
    { name: 'Entertainment', color: '#45B7D1' },
    { name: 'Utilities', color: '#96CEB4' },
    { name: 'Shopping', color: '#FFEAA7' },
    { name: 'Healthcare', color: '#DDA0DD' },
    { name: 'Education', color: '#98D8C8' },
    { name: 'Rent', color: '#F7DC6F' },
  ];

  const data = categories.map(cat => ({
    category: cat.name,
    amount: Math.floor(Math.random() * 1000) + 100,
    color: cat.color,
    percentage: 0
  }));

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  data.forEach(item => {
    item.percentage = (item.amount / total) * 100;
  });

  return data.sort((a, b) => b.amount - a.amount);
};

export default function CategoryPieChart() {
  const [data, setData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    // Generate sample data
    const sampleData = generateSampleData();
    setData(sampleData);
    
    // Trigger visibility animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Animate progress
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg border-gray-200 backdrop-blur-sm">
          <p className="font-semibold text-gray-800 mb-1">{data.category}</p>
          <p className="text-green-600 font-bold text-lg">${data.amount.toLocaleString()}</p>
          <p className="text-gray-600 text-sm">{data.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-white rounded-full shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedCategory(selectedCategory === entry.value ? null : entry.value)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const getTotalAmount = () => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTopCategory = () => {
    return data.length > 0 ? data[0] : null;
  };

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/80 shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Expenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading category data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Expense Analytics
          </h1>
          <p className="text-gray-600 text-lg">Visual breakdown of your spending patterns</p>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white transform hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Expenses</p>
                  <p className="text-2xl font-bold">${getTotalAmount().toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-100" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white transform hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Categories</p>
                  <p className="text-2xl font-bold">{data.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-400 to-purple-600 text-white transform hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Top Category</p>
                  <p className="text-2xl font-bold">{getTopCategory()?.category}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Pie Chart */}
          <div className="lg:col-span-2">
            <Card className={`backdrop-blur-sm bg-white/80 shadow-2xl border-0 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage.toFixed(1)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="amount"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {data.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={selectedCategory === entry.category ? '#333' : 'none'}
                            strokeWidth={selectedCategory === entry.category ? 3 : 0}
                            style={{
                              filter: selectedCategory === entry.category ? 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' : 'none',
                              transform: selectedCategory === entry.category ? 'scale(1.05)' : 'scale(1)',
                              transformOrigin: 'center',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-4">
            <Card className={`backdrop-blur-sm bg-white/80 shadow-2xl border-0 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {data.map((category, index) => (
                    <div 
                      key={category.category}
                      className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                        selectedCategory === category.category 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-md' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === category.category ? null : category.category)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{category.category}</p>
                            <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}% of total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${category.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              backgroundColor: category.color,
                              width: `${(category.percentage / 100) * animationProgress}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className={`backdrop-blur-sm bg-white/80 shadow-2xl border-0 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                    Export Report
                  </button>
                  <button className="w-full p-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105">
                    Set Budget Goals
                  </button>
                  <button className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                    View Trends
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}