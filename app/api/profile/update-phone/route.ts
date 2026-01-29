import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const session = verifyToken(token);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { phone } = body;

    // Validate phone
    if (!phone || phone.trim() === '') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ error: 'Phone number must be 10 digits' }, { status: 400 });
    }

    // Update user phone
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { phone: phoneDigits },
    });

    return NextResponse.json(
      {
        message: 'Phone updated successfully',
        phone: updatedUser.phone,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update phone error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update phone' },
      { status: 500 }
    );
  }
}
