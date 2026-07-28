'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';

const handleSignOut = async () => {
  await authClient.signOut();
};

const UserNavBarImageMenu = () => {
  const { data } = authClient.useSession();

  if (!data) {
    return null;
  }

  return (
    <div className="flex items-center rounded-full p-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Open account menu"
            >
              <Image
                src={data.user.image || '/images/blank-profile-picture.png'}
                width={40}
                height={40}
                className="rounded-full"
                alt=""
              />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            render={<Link href="/account-settings">Account settings</Link>}
          />
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserNavBarImageMenu;
