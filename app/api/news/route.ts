import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

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

    // Fetch latest news
    const latestNews = await prisma.latest_news.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        message: 'Latest news retrieved successfully',
        latestNews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching News:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching news' },
      { status: 500 }
    );
  }
}
