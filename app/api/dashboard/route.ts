import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { CATEGORIES } from '@/types';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const transactions = await db
      .collection('transactions')
      .find({})
      .sort({ date: -1 })
      .toArray();
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Category breakdown
    const categoryTotals: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'other';
        categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
      });
    
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    
    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
    
    const recentTransactions = transactions.slice(0, 5);
    
    return NextResponse.json({
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      categoryBreakdown,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}