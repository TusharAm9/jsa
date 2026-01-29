import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

// Update work approval status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> }
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

    const { workId } = await params;
    const workId_num = parseInt(workId);
    const { approvalStatus, paymentStatus } = await request.json();

    // Validate input
    const validApprovalStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    const validPaymentStatuses = ['PENDING', 'COMPLETED', 'FAILED'];

    if (
      approvalStatus &&
      !validApprovalStatuses.includes(approvalStatus)
    ) {
      return NextResponse.json(
        { message: 'Invalid approval status' },
        { status: 400 }
      );
    }

    if (
      paymentStatus &&
      !validPaymentStatuses.includes(paymentStatus)
    ) {
      return NextResponse.json(
        { message: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Update work order
    const updateData: any = {};
    if (approvalStatus) updateData.ApprovalStatus = approvalStatus;
    if (paymentStatus) updateData.PaymentStatus = paymentStatus;

    const workOrder = await prisma.workDetails.update({
      where: { id: workId_num },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: 'Work order updated successfully',
        workOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating work order:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { message: 'Work order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'An error occurred while updating the work order' },
      { status: 500 }
    );
  }
}
