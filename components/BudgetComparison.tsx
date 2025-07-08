'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Target, DollarSign, AlertTriangle, CheckCircle, Plus, Edit, Trash2, Calendar, PieChart } from 'lucide-react';

// Type definitions
interface Budget {
  id: number;
  category: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Transaction {
  id: number;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description?: string;
}

interface BudgetComparison extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  trend: 'up' | 'down';
}

interface BudgetForm {
  category: string;
  amount: string;
  period: string;
  startDate: string;
  endDate: string;
}

interface BudgetStatus {
  status: 'over' | 'warning' | 'good';
  color: string;
  bgColor: string;
}

const BudgetComparison: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [animatedValues, setAnimatedValues] = useState<{ [key: number]: number }>({});
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [budgetForm, setBudgetForm] = useState<BudgetForm>({
    category: '',
    amount: '',
    period: 'month',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    loadBudgets();
    loadTransactions();
    setIsVisible(true);
  }, []);

  // Load budgets from localStorage
  const loadBudgets = (): void => {
    try {
      const storedBudgets = localStorage.getItem('budgets');
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets) as Budget[]);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  // Load transactions from localStorage
  const loadTransactions = (): void => {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions) as Transaction[]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

const saveBudgets = (budgetData: Budget[]): void => {
  try {
    localStorage.setItem('budgets', JSON.stringify(budgetData));
  } catch (error) {
    console.error('Error saving budgets:', error);
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
  
  return categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
};

  // Get budget comparison data
  const getBudgetComparisonData = (): BudgetComparison[] => {
    return budgets.map(budget => {
      const spent = calculateSpending(budget.category, budget.startDate, budget.endDate);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        ...budget,
        spent,
        remaining,
        percentage,
        trend: percentage > 100 ? 'up' : 'down'
      };
    });
  };

  // Handle budget form submission
  const handleBudgetSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!budgetForm.category || !budgetForm.amount) {
        throw new Error('Please fill in all required fields');
      }

      const budgetData: Budget = {
        id: editingBudget ? editingBudget.id : Date.now(),
        ...budgetForm,
        amount: parseFloat(budgetForm.amount),
        createdAt: editingBudget ? editingBudget.createdAt : new Date().toISOString()
      };

      let updatedBudgets: Budget[];
      if (editingBudget) {
        updatedBudgets = budgets.map(b => b.id === editingBudget.id ? budgetData : b);
      } else {
        updatedBudgets = [...budgets, budgetData];
      }

      setBudgets(updatedBudgets);
      saveBudgets(updatedBudgets);
      
      setBudgetForm({
        category: '',
        amount: '',
        period: 'month',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      setEditingBudget(null);
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle budget deletion
  const handleDeleteBudget = (id: number): void => {
    const updatedBudgets = budgets.filter(b => b.id !== id);
    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
  };

  // Handle editing budget
  const handleEditBudget = (budget: Budget): void => {
    setEditingBudget(budget);
    setBudgetForm({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate
    });
    setIsDialogOpen(true);
  };

  // Animate progress bars
  useEffect(() => {
    const budgetData = getBudgetComparisonData();
    const timer = setTimeout(() => {
      budgetData.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedValues(prev => ({ ...prev, [index]: item.percentage }));
        }, index * 200);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [budgets, transactions]);

  const budgetData = getBudgetComparisonData();
  const totalBudgeted = budgetData.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const getBudgetStatus = (percentage: number): BudgetStatus => {
    if (percentage > 100) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (percentage > 90) return { status: 'warning', color: 'text-amber-600', bgColor: 'bg-amber-50' };
    return { status: 'good', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Budget Comparison
            </h1>
            <p className="text-gray-600 text-lg">Track your spending against your budget goals</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={budgetForm.category} 
                      onValueChange={(value) => setBudgetForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Budget Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={budgetForm.startDate}
                        onChange={(e) => setBudgetForm(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={budgetForm.endDate}
                        onChange={(e) => setBudgetForm(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingBudget(null);
                        setBudgetForm({
                          category: '',
                          amount: '',
                          period: 'month',
                          startDate: new Date().toISOString().split('T')[0],
                          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Overall Budget Summary */}
      {budgetData.length > 0 && (
        <Card className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} shadow-xl border-0 bg-white/70 backdrop-blur-sm`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-blue-600" />
              Overall Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Budget</p>
                    <p className="text-2xl font-bold">${totalBudgeted.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              
              <div className={`bg-gradient-to-r ${totalRemaining >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} rounded-lg p-4 text-white transform hover:scale-105 transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Remaining</p>
                    <p className="text-2xl font-bold">${Math.abs(totalRemaining).toLocaleString()}</p>
                  </div>
                  {totalRemaining >= 0 ? 
                    <CheckCircle className="w-8 h-8 text-white/80" /> :
                    <AlertTriangle className="w-8 h-8 text-white/80" />
                  }
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Usage</p>
                    <p className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</p>
                  </div>
                  <PieChart className="w-8 h-8 text-amber-200" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Categories */}
      {budgetData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgetData.map((item, index) => {
            const status = getBudgetStatus(item.percentage);
            const isAnimated = animatedValues[index] !== undefined;
            
            return (
              <Card 
                key={item.id}
                className={`transition-all duration-700 transform ${
                  isVisible ? 'translate-x-0 opacity-100' : index % 2 === 0 ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0'
                } hover:shadow-xl hover:-translate-y-1 shadow-lg border-0 bg-white/80 backdrop-blur-sm`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={status.status === 'over' ? 'destructive' : status.status === 'warning' ? 'secondary' : 'default'}
                        className={`animate-pulse ${status.color}`}
                      >
                        {item.percentage.toFixed(1)}%
                      </Badge>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditBudget(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteBudget(item.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className={`font-medium ${status.color}`}>
                        ${item.spent.toLocaleString()} / ${item.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={isAnimated ? Math.min(animatedValues[index], 100) : 0} 
                        className="h-3 bg-gray-200"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ease-out ${
                          item.percentage > 100 ? 'bg-red-500' : 
                          item.percentage > 90 ? 'bg-amber-500' : 
                          'bg-emerald-500'
                        }`}
                        style={{ 
                          width: `${Math.min(isAnimated ? animatedValues[index] : 0, 100)}%`,
                          transitionDelay: `${index * 200}ms`
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className={`rounded-lg p-3 ${status.bgColor} transform hover:scale-105 transition-all duration-300`}>
                      <div className="flex items-center gap-2">
                        {item.trend === 'up' ? 
                          <TrendingUp className="w-4 h-4 text-red-500" /> : 
                          <TrendingDown className="w-4 h-4 text-emerald-500" />
                        }
                        <span className="text-sm font-medium">Remaining</span>
                      </div>
                      <p className={`text-lg font-bold ${item.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ${Math.abs(item.remaining).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="rounded-lg p-3 bg-gray-50 transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Period</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center p-12 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <Target className="w-16 h-16 text-gray-400 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-600">No Budgets Created Yet</h3>
            <p className="text-gray-500">Create your first budget to start tracking your spending goals</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        </Card>
      )}

      {/* Budget Alerts */}
      {budgetData.filter(item => item.percentage > 90).length > 0 && (
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
          <div className="space-y-3">
            {budgetData.filter(item => item.percentage > 90).map((item, index) => (
              <Alert 
                key={item.id}
                variant={item.percentage > 100 ? "destructive" : "default"}
                className={`transition-all duration-500 transform hover:scale-[1.02] ${
                  item.percentage > 100 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    <strong>{item.category}</strong> is at {item.percentage.toFixed(1)}% of budget
                    {item.percentage > 100 && ` (${Math.abs(item.remaining).toLocaleString()} over budget)`}
                  </span>
                  <Badge variant={item.percentage > 100 ? "destructive" : "secondary"}>
                    {item.percentage > 100 ? 'Over Budget' : 'Warning'}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetComparison;