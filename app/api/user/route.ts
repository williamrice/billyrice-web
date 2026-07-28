import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionEmail = await session?.user?.email;
  const user = await prisma.user.findUnique({
    where: {
      email: sessionEmail?.toString(),
    },
  });

  return NextResponse.json(user);
};
