import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { BudgetComparison, SpendingInsight } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get budgets for the specified month/year
    const budgets = await db
      .collection('budgets')
      .find({ month, year: parseInt(year) })
      .toArray();
    
    // Get actual expenses for the same period
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    const transactions = await db
      .collection('transactions')
      .find({
        type: 'expense',
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0],
        },
      })
      .toArray();
    
    // Calculate actual spending by category
    const actualSpending: { [key: string]: number } = {};
    transactions.forEach(transaction => {
      const category = transaction.category || 'other';
      actualSpending[category] = (actualSpending[category] || 0) + transaction.amount;
    });
    
    // Create budget comparison
    const comparisons: BudgetComparison[] = budgets.map(budget => {
      const actualAmount = actualSpending[budget.category] || 0;
      const difference = budget.amount - actualAmount;
      const percentage = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0;
      
      let status: 'under' | 'over' | 'on-track' = 'under';
      if (percentage > 100) status = 'over';
      else if (percentage >= 90) status = 'on-track';
      
      return {
        category: budget.category,
        budgetAmount: budget.amount,
        actualAmount,
        difference,
        percentage,
        status,
      };
    });
    
    // Generate insights
    const insights: SpendingInsight[] = [];
    
    comparisons.forEach(comp => {
      if (comp.status === 'over') {
        insights.push({
          type: 'warning',
          category: comp.category,
          message: `You've exceeded your ${comp.category} budget by ${Math.abs(comp.difference).toFixed(2)}`,
          amount: Math.abs(comp.difference),
          percentage: comp.percentage,
        });
      } else if (comp.status === 'on-track') {
        insights.push({
          type: 'info',
          category: comp.category,
          message: `You're close to your ${comp.category} budget limit`,
          percentage: comp.percentage,
        });
      } else if (comp.difference > comp.budgetAmount * 0.5) {
        insights.push({
          type: 'success',
          category: comp.category,
          message: `Great job! You're well under your ${comp.category} budget`,
          amount: comp.difference,
        });
      }
    });
    
    return NextResponse.json({
      comparisons,
      insights,
    });
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget comparison' },
      { status: 500 }
    );
  }
}