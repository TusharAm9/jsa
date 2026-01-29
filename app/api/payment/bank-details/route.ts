import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Parse and Validate Body
    const body = await request.json();
    const { accountNumber, bankName, ifscCode, accountHolder } = body;

    if (!accountNumber || !bankName || !ifscCode || !accountHolder) {
      return NextResponse.json(
        { error: 'All bank details are required' },
        { status: 400 }
      );
    }

    // 3. Create or Update Bank Details
    // Using upsert to handle both first-time creation and future updates
    const updatedBankInfo = await prisma.bankDetails.upsert({
      where: {
        userId: session.userId,
      },
      update: {
        accountNumber,
        bankName,
        ifscCode,
        accountHolder,
      },
      create: {
        userId: session.userId,
        accountNumber,
        bankName,
        ifscCode,
        accountHolder,
      },
    });

    return NextResponse.json(
      { 
        message: 'Bank details saved successfully', 
        bankDetails: updatedBankInfo 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Bank details update error:', error);
    
    // Handle Prisma unique constraint error (P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This account number is already in use by another user.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}