import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Plus, 
  Trash2, 
  Edit3,
  PieChart,
  Calendar,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const FinancialDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Categories with colors
  const categories = {
    income: { color: '#10B981', icon: '💰' },
    salary: { color: '#059669', icon: '💼' },
    business: { color: '#047857', icon: '🏢' },
    food: { color: '#EF4444', icon: '🍽️' },
    transport: { color: '#F59E0B', icon: '🚗' },
    entertainment: { color: '#8B5CF6', icon: '🎬' },
    utilities: { color: '#06B6D4', icon: '⚡' },
    shopping: { color: '#EC4899', icon: '🛍️' },
    healthcare: { color: '#14B8A6', icon: '🏥' },
    education: { color: '#6366F1', icon: '📚' },
    other: { color: '#6B7280', icon: '📋' }
  };

  // Initialize with sample data
  useEffect(() => {
    const sampleTransactions = [
      {
        _id: '1',
        type: 'income',
        amount: 5000,
        description: 'Monthly Salary',
        category: 'salary',
        date: '2024-01-15'
      },
      {
        _id: '2',
        type: 'expense',
        amount: 150,
        description: 'Grocery Shopping',
        category: 'food',
        date: '2024-01-14'
      },
      {
        _id: '3',
        type: 'expense',
        amount: 80,
        description: 'Gas Bill',
        category: 'utilities',
        date: '2024-01-13'
      },
      {
        _id: '4',
        type: 'income',
        amount: 300,
        description: 'Freelance Project',
        category: 'business',
        date: '2024-01-12'
      },
      {
        _id: '5',
        type: 'expense',
        amount: 200,
        description: 'Movie Night',
        category: 'entertainment',
        date: '2024-01-11'
      }
    ];
    setTransactions(sampleTransactions);
  }, []);

  // Calculate summary
  const calculateSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netAmount = totalIncome - totalExpenses;
    
    // Category breakdown
    const categoryTotals = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });
    
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: categories[category]?.color || '#6B7280'
    }));
    
    return {
      totalIncome,
      totalExpenses,
      netAmount,
      categoryBreakdown,
      recentTransactions: transactions.slice(-5)
    };
  };

  const summary = calculateSummary();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.description || !formData.category) return;
    
    const newTransaction = {
      _id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    setTransactions([...transactions, newTransaction]);
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(false);
    setAnimationTrigger(prev => prev + 1);
  };

  const handleEditTransaction = () => {
    if (!formData.amount || !formData.description || !formData.category) return;
    
    const updatedTransactions = transactions.map(t => 
      t._id === editingTransaction._id 
        ? { ...t, ...formData, amount: parseFloat(formData.amount) }
        : t
    );
    
    setTransactions(updatedTransactions);
    setIsEditModalOpen(false);
    setEditingTransaction(null);
    setAnimationTrigger(prev => prev + 1);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t._id !== id));
    setAnimationTrigger(prev => prev + 1);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date
    });
    setIsEditModalOpen(true);
  };

  const TransactionForm = ({ onSubmit, isEdit = false }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categories).map(([key, cat]) => (
              <SelectItem key={key} value={key}>
                {cat.icon} {key.charAt(0).toUpperCase() + key.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
        />
      </div>
      
      <Button onClick={onSubmit} className="w-full">
        {isEdit ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-pulse">
            Financial Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your income, expenses, and achieve your financial goals with our comprehensive dashboard
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Add New Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm onSubmit={handleAddTransaction} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" key={animationTrigger}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(summary.totalIncome)}
              </div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+12.5% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
              <div className="p-2 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="flex items-center text-sm text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>-8.3% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Amount</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-2 ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netAmount)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Wallet className="w-4 h-4 mr-1" />
                <span>Current balance</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {summary.categoryBreakdown.length}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PieChart className="w-4 h-4 mr-1" />
                <span>Active categories</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-600" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.categoryBreakdown.map((category, index) => (
                <div 
                  key={category.category} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full shadow-md"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-lg font-semibold text-gray-800">
                      {categories[category.category]?.icon} {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                      <div className="font-bold text-gray-800">{formatCurrency(category.amount)}</div>
                    </div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice().reverse().map((transaction, index) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-102 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? 
                        <TrendingUp className="w-5 h-5 text-green-600" /> : 
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="text-xs">
                          {transaction.type}
                        </Badge>
                        <span className="font-semibold text-gray-800">{transaction.description}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {categories[transaction.category]?.icon} {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModal(transaction)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Edit Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm onSubmit={handleEditTransaction} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FinancialDashboard;