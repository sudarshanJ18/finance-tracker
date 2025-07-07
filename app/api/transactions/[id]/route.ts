import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const extractIdFromRequest = (req: NextRequest): string | null => {
  const segments = req.nextUrl.pathname.split('/');
  const id = segments[segments.length - 1];
  return ObjectId.isValid(id) ? id : null;
};

export async function PUT(request: NextRequest) {
  try {
    const id = extractIdFromRequest(request);

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      amount,
      date,
      description,
      category = 'other',
      type = 'expense',
    } = body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const updateData = {
      amount: parseFloat(amount),
      date,
      description,
      category,
      type,
      updatedAt: new Date(),
    };

    const result = await db.collection('transactions').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = extractIdFromRequest(request);

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection('transactions').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
