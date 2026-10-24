import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAllowedAdminSession, prismaAccess } = vi.hoisted(() => ({
  getAllowedAdminSession: vi.fn(),
  prismaAccess: vi.fn(),
}));

// Next.js resolves this marker package itself; outside Next it is a no-op here.
vi.mock('server-only', () => ({}));

vi.mock('@/lib/auth-guards', () => ({
  getAllowedAdminSession,
  requireAllowedAdminSession: vi.fn(),
}));

// Any database access through Prisma is recorded so the test can assert none happened.
vi.mock('@/lib/prisma', () => ({
  default: new Proxy({}, {
    get(_target, property) {
      prismaAccess(property);
      throw new Error(`Unexpected Prisma access: ${String(property)}`);
    },
  }),
}));

import AdminPage from '@/app/admin/page';
import SettingsPage from '@/app/admin/settings/page';
import ProjectManagerPage from '@/app/admin/project-manager/page';
import EditProjectPage from '@/app/admin/project-manager/edit/[id]/page';
import ResumeAdminPage from '@/app/admin/resume/page';
import BlogAdminPage from '@/app/admin/blog/page';
import NewPostPage from '@/app/admin/blog/new/page';
import EditPostPage from '@/app/admin/blog/[id]/edit/page';
import AddProjectPage from '@/app/admin/add-project/page';
import MermaidLibraryPage from '@/app/admin/tools/mermaid/page';
import { AdminSignIn } from '@/components/admin/AdminSignIn';

const params = Promise.resolve({ id: '1' });
const searchParams = Promise.resolve({});

const pages: Record<string, () => Promise<unknown>> = {
  dashboard: () => AdminPage(),
  settings: () => SettingsPage(),
  projects: () => ProjectManagerPage(),
  editProject: () => EditProjectPage({ params }),
  resume: () => ResumeAdminPage({ searchParams }),
  blog: () => BlogAdminPage(),
  newPost: () => NewPostPage(),
  editPost: () => EditPostPage({ params }),
  addProject: () => AddProjectPage(),
  mermaidLibrary: () => MermaidLibraryPage({ searchParams }),
};

describe('admin pages without an owner session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllowedAdminSession.mockResolvedValue(null);
  });

  it.each(Object.entries(pages))('%s shows sign-in and loads no data', async (_name, render) => {
    const result = await render();

    expect(result).toMatchObject({ type: AdminSignIn });
    expect(getAllowedAdminSession).toHaveBeenCalledTimes(1);
    expect(prismaAccess).not.toHaveBeenCalled();
  });
});
