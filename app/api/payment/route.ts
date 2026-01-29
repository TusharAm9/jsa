import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user with their BankDetails and WorkOrders
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        BankInfo: true,
        WorkOrders: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate Statistics from WorkOrders
    const stats = {
      totalWorks: user.WorkOrders.length,
      approvedWorks: user.WorkOrders.filter(w => w.ApprovalStatus === 'APPROVED').length,
      completedPayment: user.WorkOrders.filter(w => w.PaymentStatus === 'COMPLETED').length,
      pendingPayment: user.WorkOrders.filter(w => w.PaymentStatus === 'PENDING').length,
      failedPayment: user.WorkOrders.filter(w => w.PaymentStatus === 'FAILED').length,
      // If you decide to add an 'amount' field later, you can sum it here
      pendingAmount: 0, 
    };

    return NextResponse.json(
      {
        bankDetails: user.BankInfo, // Matches the "bankDetails" state in your frontend
        stats: stats,               // Matches the "paymentStats" state in your frontend
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}