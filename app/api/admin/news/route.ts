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


    const { title,content } = await request.json();

    // Validation
    if (!title || !content ) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }
    // Create news entry
    const newsEntry = await prisma.latest_news.create({
      data: {
        title: title.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json(
      {
        message: 'News created successfully',
        newsEntry: { newsEntry
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('news creation error:', error);

    return NextResponse.json(
      { message: 'An error occurred while creating news. Please try again.' },
      { status: 500 }
    );
  }
}