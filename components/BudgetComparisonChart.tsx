'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

const BudgetComparisonChart = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});

  // Color palette for charts
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
    '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
  ];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Recalculate chart data when dependencies change
  useEffect(() => {
    if (budgets.length > 0 || transactions.length > 0) {
      calculateChartData();
    }
  }, [budgets, transactions, timeRange, selectedCategories]);

  // Load data from localStorage
  const loadData = () => {
    setIsLoading(true);
    try {
      const storedBudgets = localStorage.getItem('budgets');
      const storedTransactions = localStorage.getItem('transactions');
      
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate spending for a category within date range
  const calculateSpending = (category: string, startDate: string, endDate: string): number => {
    const categoryTransactions = transactions.filter(t => 
      t.category === category &&
      t.type === 'expense' &&
      new Date(t.date) >= new Date(startDate) &&
      new Date(t.date) <= new Date(endDate)
    );
    
    return categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  // Get date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  // Calculate chart data based on current filters
  const calculateChartData = () => {
    const { startDate, endDate } = getDateRange();
    
    let filteredBudgets = budgets;
    if (selectedCategories.length > 0) {
      filteredBudgets = budgets.filter(b => selectedCategories.includes(b.category));
    }

    const data = filteredBudgets.map(budget => {
      const actualSpending = calculateSpending(budget.category, startDate, endDate);
      const budgetAmount = budget.amount;
      const variance = actualSpending - budgetAmount;
      const percentageUsed = budgetAmount > 0 ? (actualSpending / budgetAmount) * 100 : 0;
      
      return {
        category: budget.category,
        budgetAmount: budgetAmount,
        actualAmount: actualSpending,
        variance: variance,
        percentageUsed: percentageUsed,
        status: percentageUsed > 100 ? 'over' : percentageUsed > 90 ? 'warning' : 'good',
        remaining: budgetAmount - actualSpending
      };
    });

    setChartData(data);
    
    // Calculate summary statistics
    const totalBudget = data.reduce((sum, item) => sum + item.budgetAmount, 0);
    const totalActual = data.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalVariance = totalActual - totalBudget;
    const overBudgetCount = data.filter(item => item.status === 'over').length;
    const warningCount = data.filter(item => item.status === 'warning').length;
    
    setSummaryStats({
      totalBudget,
      totalActual,
      totalVariance,
      overBudgetCount,
      warningCount,
      averageUsage: data.length > 0 ? data.reduce((sum, item) => sum + item.percentageUsed, 0) / data.length : 0
    });
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-gray-600">
              Usage: {data.percentageUsed.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600">
              Remaining: ${data.remaining.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render different chart types
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No budget data available for the selected period</p>
            <p className="text-sm mt-2">Try adjusting your filters or create some budgets first</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      width: "100%",
      height: 400,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="budgetAmount" 
                fill="#3b82f6" 
                name="Budget"
                radius={[4, 4, 0, 0]}
                animationDuration={animationEnabled ? 1000 : 0}
              />
              <Bar 
                dataKey="actualAmount" 
                fill="#10b981" 
                name="Actual Spending"
                radius={[4, 4, 0, 0]}
                animationDuration={animationEnabled ? 1200 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="budgetAmount" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Budget"
                animationDuration={animationEnabled ? 1000 : 0}
              />
              <Line 
                type="monotone" 
                dataKey="actualAmount" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Actual Spending"
                animationDuration={animationEnabled ? 1200 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="budgetAmount" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Budget"
                animationDuration={animationEnabled ? 1000 : 0}
              />
              <Area 
                type="monotone" 
                dataKey="actualAmount" 
                stackId="2"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                name="Actual Spending"
                animationDuration={animationEnabled ? 1200 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartData.map((item, index) => ({
          name: item.category,
          value: item.actualAmount,
          color: colors[index % colors.length]
        }));

        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationDuration={animationEnabled ? 1000 : 0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Spending']}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Get all unique categories
  const allCategories = [...new Set(budgets.map(b => b.category))];

  // Export chart data
  const exportData = () => {
    const csvContent = [
      ['Category', 'Budget Amount', 'Actual Amount', 'Variance', 'Percentage Used', 'Status'],
      ...chartData.map(item => [
        item.category,
        item.budgetAmount,
        item.actualAmount,
        item.variance,
        item.percentageUsed.toFixed(2) + '%',
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-comparison-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Budget Analysis Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive budget vs actual spending comparison</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chart Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Animation</Label>
                  <Button
                    variant="outline"
                    onClick={() => setAnimationEnabled(!animationEnabled)}
                    className="w-full mt-2"
                  >
                    {animationEnabled ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                    {animationEnabled ? 'Disable' : 'Enable'} Animations
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Budget</p>
                <p className="text-2xl font-bold">${summaryStats.totalBudget?.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">${summaryStats.totalActual?.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${summaryStats.totalVariance >= 0 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600'} text-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Variance</p>
                <p className="text-2xl font-bold">${Math.abs(summaryStats.totalVariance || 0).toLocaleString()}</p>
              </div>
              {summaryStats.totalVariance >= 0 ? 
                <TrendingUp className="w-8 h-8 text-white/80" /> :
                <TrendingDown className="w-8 h-8 text-white/80" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Usage</p>
                <p className="text-2xl font-bold">{summaryStats.averageUsage?.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Chart Type:</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Time Range:</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Categories:</Label>
              <Select 
                value={selectedCategories.length > 0 ? selectedCategories.join(',') : 'all'} 
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSelectedCategories([]);
                  } else {
                    setSelectedCategories(value.split(','));
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="ml-auto">
              {chartData.length} Categories
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Budget vs Actual Spending Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Alerts */}
      {summaryStats.overBudgetCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{summaryStats.overBudgetCount}</strong> categories are over budget. 
            Review your spending in these areas.
          </AlertDescription>
        </Alert>
      )}

      {summaryStats.warningCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{summaryStats.warningCount}</strong> categories are approaching their budget limit.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BudgetComparisonChart;
