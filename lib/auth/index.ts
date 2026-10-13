import { createNeonAuth } from "@neondatabase/auth/next/server";
import bcrypt from "bcryptjs";

import { userRepository } from "@/server/repositories/user-repository";

export const neonAuth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function auth(): Promise<{ user: SessionUser } | null> {
  const { data: session } = await neonAuth.getSession();
  const email = session?.user?.email;
  if (!email) {
    return null;
  }

  const local = await ensureLocalUser({
    email,
    name: session.user.name ?? email,
  });

  return {
    user: {
      id: local.id,
      email: local.email,
      name: local.name,
    },
  };
}

function authCallbackUrl() {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await neonAuth.signIn.email({
    email,
    password,
    callbackURL: authCallbackUrl(),
  });
  const signedIn = data?.user;
  if (error || !signedIn?.email) {
    return null;
  }

  const local = await ensureLocalUser({
    email: signedIn.email,
    name: signedIn.name ?? signedIn.email,
  });
  return {
    user: {
      id: local.id,
      email: local.email,
      name: local.name,
    },
  };
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  name: string;
}) {
  const { error } = await neonAuth.signUp.email({
    email: input.email,
    password: input.password,
    name: input.name,
    callbackURL: authCallbackUrl(),
  });
  if (error) {
    return { error: error.message ?? "Could not create the account." };
  }
  const session = await signInWithPassword(input.email, input.password);
  return { error: session ? undefined : "Account created, but sign-in failed." };
}

export async function signOut() {
  await neonAuth.signOut();
}

async function ensureLocalUser(input: { email: string; name: string }) {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(
    `neon-auth:${input.email}:${Date.now()}`,
    12,
  );
  return userRepository.create({
    email: input.email,
    name: input.name,
    passwordHash,
    timezone: "UTC",
  });
}
