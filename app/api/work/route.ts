import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getSessionFromCookie();

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    if (!session.userId) {
      return NextResponse.json(
        { message: 'Invalid session - User ID not found' },
        { status: 401 }
      );
    }

    const { caustomerName, PhoneNumber, Address, BuildingId, Date: dateString, ServiceType } =
      await request.json();

    // Validation
    if (!caustomerName || !PhoneNumber || !Address || !BuildingId || !dateString) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate phone number (10 digits)
    const phoneDigitsOnly = PhoneNumber.replace(/\D/g, '');
    if (phoneDigitsOnly.length !== 10) {
      return NextResponse.json(
        { message: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Validate service type
    const validServiceTypes = ['FullValue', 'UBR', 'P2', 'UninstalationIDUSTB', 'UninstalationODU'];
    if (!validServiceTypes.includes(ServiceType)) {
      return NextResponse.json(
        { message: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Validate date
    const workDate = new Date(dateString);
    if (isNaN(workDate.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Create work order
    const workOrder = await prisma.workDetails.create({
      data: {
        userId: session.userId,
        caustomerName: caustomerName.trim(),
        PhoneNumber: phoneDigitsOnly,
        Address: Address.trim(),
        BuildingId: BuildingId.trim(),
        Date: workDate,
        ServiceType: ServiceType as 'FullValue' | 'UBR' | 'P2' | 'UninstalationIDUSTB' | 'UninstalationODU',
        PaymentStatus: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        message: 'Work order created successfully',
        workOrder: {
          id: workOrder.id,
          caustomerName: workOrder.caustomerName,
          BuildingId: workOrder.BuildingId,
          Date: workOrder.Date,
          ServiceType: workOrder.ServiceType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Work order creation error:', error);
    
    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint violated')) {
        return NextResponse.json(
          { message: 'User session is invalid. Please login again.' },
          { status: 401 }
        );
      }
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { message: 'Duplicate entry - This work order already exists' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'An error occurred while creating the work order. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getSessionFromCookie();

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Fetch user's work orders
    const workOrders = await prisma.workDetails.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        message: 'Work orders retrieved successfully',
        workOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching work orders' },
      { status: 500 }
    );
  }
}
