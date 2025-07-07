'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Edit3, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Receipt,
  CreditCard,
  Wallet,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍽️', color: 'from-orange-400 to-red-500' },
  { id: 'transportation', label: 'Transportation', icon: '🚗', color: 'from-blue-400 to-indigo-500' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'from-purple-400 to-pink-500' },
  { id: 'utilities', label: 'Utilities', icon: '⚡', color: 'from-yellow-400 to-orange-500' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', color: 'from-green-400 to-emerald-500' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: 'from-pink-400 to-rose-500' },
  { id: 'education', label: 'Education', icon: '📚', color: 'from-indigo-400 to-blue-500' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: 'from-cyan-400 to-teal-500' },
  { id: 'other', label: 'Other', icon: '📋', color: 'from-gray-400 to-slate-500' }
];

interface TransactionFormProps {
  onTransactionAdded?: () => void;
  editTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

export default function TransactionForm({
  onTransactionAdded,
  editTransaction,
  onCancelEdit,
}: TransactionFormProps) {
  const router = useRouter();
  const [parent] = useAutoAnimate();
  const descriptionRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    amount: editTransaction?.amount.toString() || '',
    date: editTransaction?.date || new Date().toISOString().split('T')[0],
    description: editTransaction?.description || '',
    category: editTransaction?.category || 'other',
    type: editTransaction?.type || 'expense',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingRecent, setFetchingRecent] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Fetch recent transactions for suggestions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      // Skip if in edit mode to avoid unnecessary API calls
      if (editTransaction) return;
      
      setFetchingRecent(true);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/transactions?limit=5', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Silently disable suggestions if API is unavailable
          setSuggestionsEnabled(false);
          setApiStatus('disconnected');
          return;
        }
        
        const data = await response.json();
        
        // Validate data structure
        if (!Array.isArray(data)) {
          setSuggestionsEnabled(false);
          setApiStatus('disconnected');
          return;
        }
        
        setRecentTransactions(data);
        setSuggestionsEnabled(true);
        setApiStatus('connected');
        
      } catch (error) {
        // Silently disable suggestions on error (including timeout/abort)
        setSuggestionsEnabled(false);
        setRecentTransactions([]);
        setApiStatus('disconnected');
      } finally {
        setFetchingRecent(false);
      }
    };
    
    fetchRecentTransactions();
  }, [editTransaction]);

  // Generate suggestions based on description input
  useEffect(() => {
    if (
      suggestionsEnabled && 
      formData.description.length > 2 && 
      recentTransactions.length > 0
    ) {
      const filtered = recentTransactions
        .filter(t => t.description && t.description.toLowerCase().includes(formData.description.toLowerCase()))
        .map(t => t.description)
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .slice(0, 3);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.description, recentTransactions, suggestionsEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsSubmitting(true);

    // Validate form
    if (!formData.amount || !formData.date || !formData.description) {
      setError('Please fill in all required fields');
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    const transactionData = {
      amount,
      date: formData.date,
      description: formData.description.trim(),
      category: formData.category,
      type: formData.type,
    };

    try {
      const url = editTransaction?._id 
        ? `/api/transactions/${editTransaction._id}`
        : '/api/transactions';
      
      const method = editTransaction?._id ? 'PUT' : 'POST';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(transactionData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Failed to save transaction';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, provide a generic message
          if (response.status === 500) {
            errorMessage = 'Server error - please try again later';
          } else if (response.status === 404) {
            errorMessage = 'Transaction not found';
          } else if (response.status === 403) {
            errorMessage = 'Permission denied';
          } else if (response.status === 401) {
            errorMessage = 'Please log in to continue';
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Transaction {editTransaction?._id ? 'updated' : 'added'} successfully!</span>
        </div>,
        { duration: 2000 }
      );

      setSuccess(true);
      
      // Reset form after success if not in edit mode
      if (!editTransaction?._id) {
        setFormData({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          category: 'other',
          type: 'expense',
        });
      }

      onTransactionAdded?.();
      router.refresh();

      // If in edit mode, close the form after delay
      if (editTransaction?._id && onCancelEdit) {
        setTimeout(() => {
          onCancelEdit();
        }, 1500);
      }
    } catch (err) {
      let errorMessage = 'Failed to save transaction';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out - please try again';
        } else {
          errorMessage = err.message;
        }
      }
      
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>{errorMessage}</span>
        </div>,
        { duration: 4000 }
      );
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    const suggestedTransaction = recentTransactions.find(t => t.description === suggestion);
    if (suggestedTransaction) {
      setFormData(prev => ({
        ...prev,
        description: suggestion,
        category: suggestedTransaction.category,
        type: suggestedTransaction.type,
      }));
    }
    setShowSuggestions(false);
    descriptionRef.current?.focus();
  };

  const selectedCategory = CATEGORIES.find(cat => cat.id === formData.category);
  const isExpense = formData.type === 'expense';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-xl">
        {/* Animated Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"
        />
        
        {/* Success Overlay */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center text-white"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Transaction Saved!</h3>
                <p className="text-emerald-100">Your transaction has been successfully recorded.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-r ${editTransaction ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-purple-600'} shadow-lg`}>
                {editTransaction ? (
                  <Edit3 className="w-6 h-6 text-white" />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {editTransaction ? 'Update your transaction details' : 'Record your income or expense'}
                </p>
              </div>
            </motion.div>
            {apiStatus === 'connected' && (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600">Smart Form Active</span>
              </motion.div>
            )}
            {apiStatus === 'disconnected' && (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-orange-600">Basic Mode</span>
              </motion.div>
            )}
            {apiStatus === 'checking' && (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-sm text-blue-600">Connecting...</span>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6" ref={parent}>
            {/* Amount and Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="amount" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  <span>Amount</span>
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="pl-8 text-lg font-semibold border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-blue-300"
                  />
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="date" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-blue-300"
                />
              </motion.div>
            </div>

            {/* Category and Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="category" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Tag className="w-4 h-4" />
                  <span>Category</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-blue-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{category.icon}</span>
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-2 rounded-lg bg-gradient-to-r ${selectedCategory.color} bg-opacity-10 border border-current border-opacity-20`}
                  >
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-base">{selectedCategory.icon}</span>
                      <span className="font-medium">{selectedCategory.label}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="type" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  {isExpense ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  <span>Type</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-blue-300">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense" className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span>Expense</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="income" className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>Income</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-2 rounded-lg ${isExpense ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    {isExpense ? (
                      <>
                        <CreditCard className="w-4 h-4 text-red-500" />
                        <span className="text-red-700 font-medium">Expense Transaction</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 text-green-500" />
                        <span className="text-green-700 font-medium">Income Transaction</span>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Description with Suggestions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2 relative"
            >
              <Label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                <span>Description</span>
                {fetchingRecent && (
                  <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                )}
              </Label>
              <div className="relative">
                <Input
                  ref={descriptionRef}
                  id="description"
                  name="description"
                  type="text"
                  placeholder="What was this transaction for?"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-blue-300"
                />
                <Receipt className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4 pt-4"
            >
              <Button 
                type="submit"
                disabled={loading}
                className={`flex-1 relative overflow-hidden ${
                  isSubmitting ? 'animate-pulse' : ''
                } bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>{editTransaction ? 'Update Transaction' : 'Save Transaction'}</span>
                  </div>
                )}
              </Button>
              
              {editTransaction && onCancelEdit && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancelEdit}
                  className="flex items-center space-x-2 border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}