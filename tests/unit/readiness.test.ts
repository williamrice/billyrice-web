import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findFirst, logError } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  logError: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: { applicationSetting: { findFirst } },
}));

vi.mock('@/features/operations/logger', () => ({
  logger: { error: logError },
}));

import { GET } from '@/app/api/ready/route';

describe('readiness endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports ready when the application settings table exists', async () => {
    findFirst.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(findFirst).toHaveBeenCalledWith({ select: { key: true } });
    expect((await response.json()).checks.database).toBe('ok');
  });

  it('reports not ready when the application settings table is missing', async () => {
    findFirst.mockRejectedValue(new Error('P2021'));

    const response = await GET();

    expect(response.status).toBe(503);
    expect((await response.json()).checks.database).toBe('unavailable');
    expect(logError).toHaveBeenCalled();
  });
});
