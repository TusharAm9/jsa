import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

function serializeAttendance(attendance: any) {
  return {
    ...attendance,
    attendance_id: attendance.attendance_id.toString(),
    userId: attendance.userId.toString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();

    if (!session || !session.userId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { type } = await request.json();

    if (!['IN', 'OUT'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid type. Use IN or OUT' },
        { status: 400 }
      );
    }

    // Today (date only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_attendance_date: {
          userId: session.userId,
          attendance_date: today,
        },
      },
    });

    // MARK IN
    if (type === 'IN') {
      if (existingAttendance?.mark_in) {
        return NextResponse.json(
          { message: 'Attendance already marked IN' },
          { status: 400 }
        );
      }

      const attendance = await prisma.attendance.upsert({
        where: {
          userId_attendance_date: {
            userId: session.userId,
            attendance_date: today,
          },
        },
        update: {
          mark_in: new Date(),
          status: 'Present',
        },
        create: {
          userId: session.userId,
          attendance_date: today,
          mark_in: new Date(),
          status: 'Present',
        },
      });
      const attendanceSerialized = serializeAttendance(attendance);

      return NextResponse.json(
        { message: 'Attendance IN marked successfully', attendance :attendanceSerialized },
        { status: 200 }
      );
    }

    // MARK OUT
    if (!existingAttendance || !existingAttendance.mark_in) {
      return NextResponse.json(
        { message: 'Please mark IN before marking OUT' },
        { status: 400 }
      );
    }

    if (existingAttendance.mark_out) {
      return NextResponse.json(
        { message: 'Attendance already marked OUT' },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.update({
      where: {
        attendance_id: existingAttendance.attendance_id,
      },
      data: {
        mark_out: new Date(),
      },
    });
    const attendanceSerialized = serializeAttendance(attendance)

    return NextResponse.json(
      { message: 'Attendance OUT marked successfully', attendance:attendanceSerialized },
      { status: 200 }
    );
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json(
      { message: 'Error marking attendance' },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();

    if (!session || !session.userId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = {
      userId: session.userId,
    };

    if (from && to) {
      where.attendance_date = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: {
        attendance_date: 'desc',
      },
      select: {
        attendance_id: true,  // <-- add this
        userId: true,         // <-- add this
        attendance_date: true,
        mark_in: true,
        mark_out: true,
        status: true,
        approval_status: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Attendance fetched successfully',
        attendance : attendance.map(serializeAttendance),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json(
      { message: 'Error fetching attendance' },
      { status: 500 }
    );
  }
}
