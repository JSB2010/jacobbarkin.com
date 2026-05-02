import { auth } from "@clerk/nextjs/server";

export type AdminAuthResult = {
  userId: string | null;
  isAdmin: boolean;
  status: 401 | null;
};

export async function getAdminAuth(): Promise<AdminAuthResult> {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null, isAdmin: false, status: 401 };
  }

  return { userId, isAdmin: true, status: null };
}

export async function requireAdmin() {
  const admin = await getAdminAuth();
  return admin.isAdmin ? admin.userId : null;
}
