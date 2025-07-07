import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Transaction } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const [transactions, count] = await Promise.all([
      db.collection<Transaction>('transactions')
        .find({})
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('transactions').countDocuments()
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, date, description, category = 'other', type = 'expense' } = body;
    
    // Validation
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json(
        { error: 'Amount must be a valid number' },
        { status: 400 }
      );
    }

    if (!date || !Date.parse(date)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 2) {
      return NextResponse.json(
        { error: 'Description must be at least 2 characters' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const transaction: Partial<Transaction> = {
      amount: parseFloat(amount),
      date,
      description: description.trim(),
      category,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('transactions').insertOne(transaction);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...transaction,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create transaction',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}