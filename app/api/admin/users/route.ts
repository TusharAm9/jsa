import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

// Get all JSA users with their work summary
export async function GET(request: NextRequest) {
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

    // Get all JSA users with work summary
    const jsaUsers = await prisma.user.findMany({
      where: { role: 'JSA' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        WorkOrders: {
          select: {
            id: true,
            PaymentStatus: true,
            ApprovalStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary for each user
    const usersWithSummary = jsaUsers.map((user) => {
      const totalWorks = user.WorkOrders.length;
      const approvedWorks = user.WorkOrders.filter(
        (w) => w.ApprovalStatus === 'APPROVED'
      ).length;
      const pendingApproval = user.WorkOrders.filter(
        (w) => w.ApprovalStatus === 'PENDING'
      ).length;
      const completedPayment = user.WorkOrders.filter(
        (w) => w.PaymentStatus === 'COMPLETED'
      ).length;
      const pendingPayment = user.WorkOrders.filter(
        (w) => w.PaymentStatus === 'PENDING'
      ).length;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        summary: {
          totalWorks,
          approvedWorks,
          pendingApproval,
          completedPayment,
          pendingPayment,
        },
      };
    });

    return NextResponse.json(
      {
        message: 'JSA users retrieved successfully',
        users: usersWithSummary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching JSA users:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching JSA users' },
      { status: 500 }
    );
  }
}
