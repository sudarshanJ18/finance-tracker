import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, DollarSign, Calendar, Tag, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  'food', 'transportation', 'entertainment', 'utilities', 'shopping', 
  'healthcare', 'education', 'savings', 'rent', 'groceries', 'insurance'
];

export default function BudgetForm() {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Load existing budgets from state (no localStorage in artifacts)
    setBudgets([
      { id: 1, category: 'food', amount: 500, month: '07', year: 2025, createdAt: '2025-07-01' },
      { id: 2, category: 'utilities', amount: 200, month: '07', year: 2025, createdAt: '2025-07-02' },
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (!formData.category || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      const newBudget = {
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount),
        month: formData.month.toString().padStart(2, '0'),
        createdAt: new Date().toISOString(),
      };

      const updatedBudgets = [...budgets, newBudget];
      setBudgets(updatedBudgets);

      setFormData({
        category: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'month' || name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const getTotalBudget = () => {
    return budgets.reduce((total, budget) => total + budget.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Animation */}
        <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Budget Planner
          </h1>
          <p className="text-gray-600 text-lg">Take control of your finances with smart budgeting</p>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white transform hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Budget</p>
                  <p className="text-2xl font-bold">${getTotalBudget().toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-100" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white transform hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Categories</p>
                  <p className="text-2xl font-bold">{new Set(budgets.map(b => b.category)).size}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-400 to-purple-600 text-white transform hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Active Budgets</p>
                  <p className="text-2xl font-bold">{budgets.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <Card className={`backdrop-blur-sm bg-white/80 shadow-2xl border-0 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Set New Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-all duration-300 group-hover:shadow-md">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="hover:bg-purple-50">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    Budget Amount
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    className="h-12 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-all duration-300 group-hover:shadow-md"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="month" className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    Month
                  </Label>
                  <Select
                    value={formData.month.toString()}
                    onValueChange={(value) => handleSelectChange('month', parseInt(value))}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-all duration-300 group-hover:shadow-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()} className="hover:bg-purple-50">
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="year" className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    Year
                  </Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    min="2020"
                    max="2030"
                    className="h-12 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 transition-all duration-300 group-hover:shadow-md"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="animate-pulse">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 animate-bounce">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>Budget saved successfully!</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving Budget...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Set Budget
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Budgets */}
        {budgets.length > 0 && (
          <Card className={`mt-8 backdrop-blur-sm bg-white/80 shadow-2xl border-0 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Recent Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgets.slice(-3).reverse().map((budget, index) => (
                  <div 
                    key={budget.id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium text-gray-800 capitalize">{budget.category}</p>
                        <p className="text-sm text-gray-500">{months[parseInt(budget.month) - 1]?.label} {budget.year}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${budget.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}