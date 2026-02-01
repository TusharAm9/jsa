import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

// Update attendance approval status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ attendanceId: string }> }
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

    const { attendanceId } = await params;
    const attendanceId_num = BigInt(attendanceId);

    const { approvalStatus } = await request.json();

    // Validate approval status
    const validApprovalStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validApprovalStatuses.includes(approvalStatus)) {
      return NextResponse.json(
        { message: 'Invalid approval status' },
        { status: 400 }
      );
    }

    // Check if attendance exists
    const attendance = await prisma.attendance.findUnique({
      where: { attendance_id: attendanceId_num },
    });

    if (!attendance) {
      return NextResponse.json(
        { message: 'Attendance record not found' },
        { status: 404 }
      );
    }

    // Update attendance
    const updatedAttendance = await prisma.attendance.update({
      where: { attendance_id: attendanceId_num },
      data: {
        approval_status: approvalStatus,
      },
    });

    return NextResponse.json(
      {
        message: 'Attendance updated successfully',
        attendance: updatedAttendance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating attendance:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { message: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'An error occurred while updating attendance' },
      { status: 500 }
    );
  }
}
