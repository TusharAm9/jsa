import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

// Get user work details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const userId_num = parseInt(userId);

    // Get user and their work details
    const user = await prisma.user.findUnique({
      where: { id: userId_num },
      include: {
        WorkOrders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate summary
    const summary = {
      totalWorks: user.WorkOrders.length,
      approvedWorks: user.WorkOrders.filter((w) => w.ApprovalStatus === 'APPROVED')
        .length,
      pendingApproval: user.WorkOrders.filter((w) => w.ApprovalStatus === 'PENDING')
        .length,
      rejectedWorks: user.WorkOrders.filter((w) => w.ApprovalStatus === 'REJECTED')
        .length,
      completedPayment: user.WorkOrders.filter((w) => w.PaymentStatus === 'COMPLETED')
        .length,
      pendingPayment: user.WorkOrders.filter((w) => w.PaymentStatus === 'PENDING')
        .length,
      failedPayment: user.WorkOrders.filter((w) => w.PaymentStatus === 'FAILED')
        .length,
    };

    return NextResponse.json(
      {
        message: 'User work details retrieved successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          summary,
          workOrders: user.WorkOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user work details:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching user work details' },
      { status: 500 }
    );
  }
}
