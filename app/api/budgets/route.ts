import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Budget } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const query: any = {};
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    
    const budgets = await db
      .collection('budgets')
      .find(query)
      .sort({ category: 1 })
      .toArray();
    
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, amount, month, year } = body;

    if (!category || !amount || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const yearInt = parseInt(year);

    // Check if budget already exists for this category/month/year
    const existingBudget = await db.collection('budgets').findOne({
      category,
      month,
      year: yearInt,
    });

    if (existingBudget) {
      await db.collection('budgets').updateOne(
        { _id: existingBudget._id },
        {
          $set: {
            amount: parseFloat(amount),
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        _id: existingBudget._id,
        category,
        amount: parseFloat(amount),
        month,
        year: yearInt,
        updatedAt: new Date(),
      });
    } else {
      // Create a new budget object without _id
      const budget = {
        category,
        amount: parseFloat(amount),
        month,
        year: yearInt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('budgets').insertOne(budget);

      return NextResponse.json({
        _id: result.insertedId,
        ...budget,
      });
    }
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget' },
      { status: 500 }
    );
  }
}
