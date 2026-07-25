import { NextResponse } from 'next/server';

import { logger } from '@/features/operations/logger';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ready',
        checks: {
          database: 'ok',
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    logger.error('Readiness check failed', {
      check: 'database',
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });

    return NextResponse.json(
      {
        status: 'not_ready',
        checks: {
          database: 'unavailable',
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
