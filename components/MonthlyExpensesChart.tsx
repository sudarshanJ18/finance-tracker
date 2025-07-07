import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Filter,
  Download,
  Maximize2,
  Eye,
  EyeOff
} from 'lucide-react';

const AnimatedMonthlyExpensesChart = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [showValues, setShowValues] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Sample transaction data
  useEffect(() => {
    const sampleTransactions = [
      { _id: '1', type: 'expense', amount: 850, description: 'Groceries', category: 'food', date: '2024-01-15' },
      { _id: '2', type: 'expense', amount: 1200, description: 'Rent', category: 'housing', date: '2024-01-01' },
      { _id: '3', type: 'expense', amount: 300, description: 'Utilities', category: 'utilities', date: '2024-01-10' },
      { _id: '4', type: 'expense', amount: 500, description: 'Transportation', category: 'transport', date: '2024-01-20' },
      { _id: '5', type: 'expense', amount: 900, description: 'Groceries', category: 'food', date: '2024-02-15' },
      { _id: '6', type: 'expense', amount: 1200, description: 'Rent', category: 'housing', date: '2024-02-01' },
      { _id: '7', type: 'expense', amount: 280, description: 'Utilities', category: 'utilities', date: '2024-02-10' },
      { _id: '8', type: 'expense', amount: 750, description: 'Entertainment', category: 'entertainment', date: '2024-02-25' },
      { _id: '9', type: 'expense', amount: 1100, description: 'Groceries', category: 'food', date: '2024-03-15' },
      { _id: '10', type: 'expense', amount: 1200, description: 'Rent', category: 'housing', date: '2024-03-01' },
      { _id: '11', type: 'expense', amount: 320, description: 'Utilities', category: 'utilities', date: '2024-03-10' },
      { _id: '12', type: 'expense', amount: 600, description: 'Shopping', category: 'shopping', date: '2024-03-22' },
      { _id: '13', type: 'expense', amount: 800, description: 'Groceries', category: 'food', date: '2024-04-15' },
      { _id: '14', type: 'expense', amount: 1200, description: 'Rent', category: 'housing', date: '2024-04-01' },
      { _id: '15', type: 'expense', amount: 310, description: 'Utilities', category: 'utilities', date: '2024-04-10' },
      { _id: '16', type: 'expense', amount: 450, description: 'Healthcare', category: 'healthcare', date: '2024-04-18' },
      { _id: '17', type: 'expense', amount: 950, description: 'Groceries', category: 'food', date: '2024-05-15' },
      { _id: '18', type: 'expense', amount: 1200, description: 'Rent', category: 'housing', date: '2024-05-01' },
      { _id: '19', type: 'expense', amount: 290, description: 'Utilities', category: 'utilities', date: '2024-05-10' },
      { _id: '20', type: 'expense', amount: 700, description: 'Vacation', category: 'travel', date: '2024-05-25' },
      { _id: '21', type: 'expense', amount: 880, description: 'Groceries', category: 'food', date: '2024-06-15' },
      { _id: '22', type: 'expense', amount: 1200, description: 'Rent', category: 'housing', date: '2024-06-01' },
      { _id: '23', type: 'expense', amount: 340, description: 'Utilities', category: 'utilities', date: '2024-06-10' },
      { _id: '24', type: 'expense', amount: 520, description: 'Car Maintenance', category: 'transport', date: '2024-06-20' },
      { _id: '25', type: 'income', amount: 5000, description: 'Salary', category: 'salary', date: '2024-01-01' },
      { _id: '26', type: 'income', amount: 5000, description: 'Salary', category: 'salary', date: '2024-02-01' },
      { _id: '27', type: 'income', amount: 5000, description: 'Salary', category: 'salary', date: '2024-03-01' },
      { _id: '28', type: 'income', amount: 5000, description: 'Salary', category: 'salary', date: '2024-04-01' },
      { _id: '29', type: 'income', amount: 5000, description: 'Salary', category: 'salary', date: '2024-05-01' },
      { _id: '30', type: 'income', amount: 5000, description: 'Salary', category: 'salary', date: '2024-06-01' }
    ];
    setTransactions(sampleTransactions);
  }, []);

  const processMonthlyData = () => {
    const monthlyData = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        if (selectedYear === 'all') return true;
        const year = new Date(t.date).getFullYear();
        return year.toString() === selectedYear;
      })
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += transaction.amount;
      });
    
    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        amount,
        monthKey: month
      }))
      .sort((a, b) => new Date(a.monthKey).getTime() - new Date(b.monthKey).getTime());
  };

  const data = processMonthlyData();
  
  // Calculate statistics
  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);
  const avgExpenses = data.length > 0 ? totalExpenses / data.length : 0;
  const maxExpense = Math.max(...data.map(d => d.amount));
  const minExpense = Math.min(...data.map(d => d.amount));
  
  // Get trend
  const getTrend = () => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 };
    
    const lastMonth = data[data.length - 1]?.amount || 0;
    const prevMonth = data[data.length - 2]?.amount || 0;
    
    if (prevMonth === 0) return { direction: 'neutral', percentage: 0 };
    
    const percentage = ((lastMonth - prevMonth) / prevMonth) * 100;
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    
    return { direction, percentage: Math.abs(percentage) };
  };

  const trend = getTrend();

  // Get available years
  const availableYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-blue-600 font-bold text-lg">
            {formatCurrency(payload[0].value)}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <p>Total expenses for the month</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom bar shape with animations
  const AnimatedBar = (props) => {
    const { fill, ...otherProps } = props;
    return (
      <Bar
        {...otherProps}
        fill={hoveredBar === props.index ? '#1d4ed8' : fill}
        style={{ 
          transition: 'all 0.3s ease',
          filter: hoveredBar === props.index ? 'brightness(1.1)' : 'brightness(1)'
        }}
      />
    );
  };

  const triggerAnimation = () => {
    setAnimationKey(prev => prev + 1);
  };

  useEffect(() => {
    triggerAnimation();
  }, [selectedYear]);

  if (data.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <BarChart3 className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No expense data available</p>
            <p className="text-sm">Add some transactions to see your monthly spending trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Average Monthly</p>
                <p className="text-2xl font-bold">{formatCurrency(avgExpenses)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Highest Month</p>
                <p className="text-2xl font-bold">{formatCurrency(maxExpense)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Month-to-Month</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{trend.percentage.toFixed(1)}%</p>
                  {trend.direction === 'up' ? 
                    <TrendingUp className="w-5 h-5 text-orange-200" /> : 
                    trend.direction === 'down' ? 
                    <TrendingDown className="w-5 h-5 text-orange-200" /> : 
                    <div className="w-5 h-5" />
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Monthly Expenses Trend
            </CardTitle>
            
            <div className="flex items-center gap-3">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValues(!showValues)}
                className="flex items-center gap-2"
              >
                {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showValues ? 'Hide' : 'Show'} Values
              </Button>
            </div>
          </div>
          
          {/* Trend Indicator */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {data.length} months
            </Badge>
            {trend.direction !== 'neutral' && (
              <Badge 
                variant={trend.direction === 'up' ? 'destructive' : 'default'}
                className="flex items-center gap-1"
              >
                {trend.direction === 'up' ? 
                  <TrendingUp className="w-3 h-3" /> : 
                  <TrendingDown className="w-3 h-3" />
                }
                {trend.percentage.toFixed(1)}% vs last month
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                key={animationKey}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  strokeOpacity={0.6}
                />
                
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                
                <Bar 
                  dataKey="amount" 
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                  onMouseEnter={(_, index) => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={hoveredBar === index ? '#1d4ed8' : 'url(#barGradient)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Data Labels */}
          {showValues && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center animate-fade-in">
              {data.map((item, index) => (
                <div 
                  key={index}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  {item.month}: {formatCurrency(item.amount)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default AnimatedMonthlyExpensesChart;