'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import Dashboard from '@/components/Dashboard';
import BudgetComparisonChart from '@/components/BudgetComparisonChart';
import SpendingInsights from '@/components/SpendingInsights';

import { Transaction, DashboardSummary, CATEGORIES } from '@/types';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        
        // Ensure proper Transaction type with string dates
        const sanitizedData = data.map((t: any) => ({
          _id: t._id,
          amount: t.amount,
          date: t.date,
          description: t.description,
          category: CATEGORIES.includes(t.category) ? t.category : 'other',
          type: t.type,
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
          updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : undefined,
        })) as Transaction[];

        setTransactions(sanitizedData);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data: DashboardSummary = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchDashboardData();
  }, []);

  const handleTransactionAdded = () => {
    fetchTransactions();
    fetchDashboardData();
  };

  const handleTransactionDeleted = () => {
    fetchTransactions();
    fetchDashboardData();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  const handleCancelEdit = () => {
    setEditTransaction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Personal Finance Tracker</h1>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="add">Add Transaction</TabsTrigger>
            <TabsTrigger value="budget">Budgeting</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {dashboardData && <Dashboard summary={dashboardData} />}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionList
              transactions={transactions}
              onTransactionDeleted={handleTransactionDeleted}
              onEditTransaction={handleEditTransaction}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyExpensesChart transactions={transactions} />
              {dashboardData && (
                <CategoryPieChart data={dashboardData.categoryBreakdown} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <TransactionForm
                onTransactionAdded={handleTransactionAdded}
                editTransaction={editTransaction}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetComparisonChart />
            <SpendingInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}