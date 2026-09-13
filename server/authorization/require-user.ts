import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
};

export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId || !email) {
    throw new AppError("UNAUTHORIZED", "You need to sign in to continue.");
  }

  return {
    id: userId,
    email,
    name: session.user.name,
  };
}
