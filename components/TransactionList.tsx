'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  RefreshCw,
  Receipt,
  Wallet,
  CreditCard,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Transaction, CATEGORIES } from '@/types';

interface TransactionListProps {
  transactions?: Transaction[];
  onTransactionDeleted?: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

const CATEGORY_ICONS = {
  'food': '🍽️',
  'transportation': '🚗',
  'entertainment': '🎬',
  'utilities': '⚡',
  'healthcare': '🏥',
  'shopping': '🛍️',
  'education': '📚',
  'travel': '✈️',
  'other': '📋'
};

const CATEGORY_COLORS = {
  'food': 'from-orange-400 to-red-500',
  'transportation': 'from-blue-400 to-indigo-500',
  'entertainment': 'from-purple-400 to-pink-500',
  'utilities': 'from-yellow-400 to-orange-500',
  'healthcare': 'from-green-400 to-emerald-500',
  'shopping': 'from-pink-400 to-rose-500',
  'education': 'from-indigo-400 to-blue-500',
  'travel': 'from-cyan-400 to-teal-500',
  'other': 'from-gray-400 to-slate-500'
};

const generateSampleTransactions = (): Transaction[] => {
  return [
    {
      _id: '1',
      amount: 45.50,
      date: '2025-01-07',
      description: 'Grocery shopping at Whole Foods',
      category: 'food',
      type: 'expense',
      createdAt: '2025-01-07T10:30:00Z'
    },
    {
      _id: '2',
      amount: 3200.00,
      date: '2025-01-05',
      description: 'Monthly salary deposit',
      category: 'other',
      type: 'income',
      createdAt: '2025-01-05T09:00:00Z'
    },
    {
      _id: '3',
      amount: 25.00,
      date: '2025-01-06',
      description: 'Uber ride to airport',
      category: 'transportation',
      type: 'expense',
      createdAt: '2025-01-06T14:20:00Z'
    },
    {
      _id: '4',
      amount: 15.75,
      date: '2025-01-06',
      description: 'Netflix subscription',
      category: 'entertainment',
      type: 'expense',
      createdAt: '2025-01-06T11:45:00Z'
    },
    {
      _id: '5',
      amount: 120.00,
      date: '2025-01-05',
      description: 'Electricity bill payment',
      category: 'utilities',
      type: 'expense',
      createdAt: '2025-01-05T16:30:00Z'
    },
    {
      _id: '6',
      amount: 89.99,
      date: '2025-01-04',
      description: 'New running shoes',
      category: 'shopping',
      type: 'expense',
      createdAt: '2025-01-04T13:15:00Z'
    },
    {
      _id: '7',
      amount: 500.00,
      date: '2025-01-03',
      description: 'Freelance project payment',
      category: 'other',
      type: 'income',
      createdAt: '2025-01-03T17:00:00Z'
    },
    {
      _id: '8',
      amount: 35.25,
      date: '2025-01-03',
      description: 'Doctor visit co-pay',
      category: 'healthcare',
      type: 'expense',
      createdAt: '2025-01-03T10:45:00Z'
    }
  ];
};

export default function TransactionList({
  transactions: propTransactions,
  onTransactionDeleted,
  onEditTransaction,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [visibleTransactions, setVisibleTransactions] = useState(5);

  // Initialize transactions - use prop transactions if provided, otherwise use sample data
  useEffect(() => {
    if (propTransactions && Array.isArray(propTransactions)) {
      setTransactions(propTransactions);
      setLoading(false);
    } else {
      // Use sample data if no prop transactions provided
      setTimeout(() => {
        setTransactions(generateSampleTransactions());
        setLoading(false);
      }, 1000);
    }
  }, [propTransactions]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove transaction from local state
      setTransactions(prev => prev.filter(t => t._id !== id));
      setSuccess('Transaction deleted successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
      onTransactionDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Filter and sort transactions - ensure transactions is always an array
  const filteredAndSortedTransactions = useMemo(() => {
    // Ensure transactions is an array before filtering
    const transactionArray = Array.isArray(transactions) ? transactions : [];
    
    let filtered = transactionArray.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [transactions, searchTerm, selectedCategory, selectedType, sortBy, sortOrder]);

  const displayedTransactions = filteredAndSortedTransactions.slice(0, visibleTransactions);

  // Calculate totals - ensure transactions is an array
  const transactionArray = Array.isArray(transactions) ? transactions : [];
  const totalExpenses = transactionArray.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactionArray.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Transaction History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactionArray.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-xl">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first transaction above!</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Track expenses</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Monitor income</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>View insights</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Transaction History
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {filteredAndSortedTransactions.length} transactions found
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Total Income</p>
                <p className="text-2xl font-bold text-green-700">{formatAmount(totalIncome)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-center space-x-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">{formatAmount(totalExpenses)}</p>
              </div>
            </div>
          </div>
          <div className={`bg-gradient-to-r ${netBalance >= 0 ? 'from-blue-50 to-indigo-50' : 'from-orange-50 to-red-50'} p-4 rounded-xl border ${netBalance >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
            <div className="flex items-center space-x-3">
              <Wallet className={`w-8 h-8 ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <div>
                <p className={`text-sm font-medium ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatAmount(netBalance)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.keys(CATEGORY_ICONS).map(category => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex space-x-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'amount' | 'description')}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="description">Description</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Transaction List */}
        <div className="space-y-3">
          {displayedTransactions.map((transaction, index) => (
            <div
              key={transaction._id}
              className={`group relative transform transition-all duration-300 hover:scale-[1.02] ${
                selectedTransaction === transaction._id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer
                  ${transaction.type === 'expense' 
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100'
                  }
                  hover:shadow-lg hover:border-current`}
                onClick={() => setSelectedTransaction(
                  selectedTransaction === transaction._id ? null : transaction._id
                )}
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Category Icon */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || 'from-gray-400 to-slate-500'} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                    {CATEGORY_ICONS[transaction.category as keyof typeof CATEGORY_ICONS] || '📋'}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{transaction.description}</h3>
                      <Badge 
                        variant="outline" 
                        className={`${
                          transaction.type === 'expense' 
                            ? 'border-red-300 text-red-700 bg-red-50' 
                            : 'border-green-300 text-green-700 bg-green-50'
                        }`}
                      >
                        {transaction.type === 'expense' ? 'Expense' : 'Income'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{getRelativeTime(transaction.date)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.type === 'expense' ? 'Outgoing' : 'Incoming'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTransaction?.(transaction);
                      }}
                      className="hover:bg-blue-100 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(transaction._id!);
                      }}
                      disabled={deletingId === transaction._id}
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      {deletingId === transaction._id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleTransactions < filteredAndSortedTransactions.length && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setVisibleTransactions(prev => prev + 5)}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Load More ({filteredAndSortedTransactions.length - visibleTransactions} remaining)</span>
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedTransactions.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
