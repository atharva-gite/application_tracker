import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

import { publicUser, isUniqueConstraintError } from "@/lib/domain";
import { getEmailClient } from "@/lib/email";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/validation/auth";
import { passwordResetRepository } from "@/server/repositories/password-reset-repository";
import { userRepository } from "@/server/repositories/user-repository";

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function registerUser(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      timezone: input.timezone ?? "UTC",
    });

    logger.info("auth.register.succeeded", { userId: user.id });
    return publicUser(user);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "CONFLICT",
        "An account with this email already exists.",
      );
    }
    throw error;
  }
}

export async function verifyCredentials(input: LoginInput) {
  const user = await userRepository.findByEmail(input.email);
  if (!user?.passwordHash) {
    return null;
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    return null;
  }

  return publicUser(user);
}

export async function getCurrentUser(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError("UNAUTHORIZED", "You need to sign in to continue.");
  }
  return publicUser(user);
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await userRepository.findByEmail(input.email);

  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    await passwordResetRepository.invalidateForUser(user.id);
    await passwordResetRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
    await getEmailClient().send({
      to: user.email,
      subject: "Reset your Pipeline password",
      text: `Reset your password using this link, which expires in one hour:\n\n${resetUrl}\n`,
    });

    logger.info("auth.password_reset.requested", { userId: user.id });
  } else {
    logger.info("auth.password_reset.unknown_email");
  }

  return {
    message:
      "If an account exists for that email, we sent password reset instructions.",
  };
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);
  const record = await passwordResetRepository.findValidByHash(tokenHash);

  if (!record) {
    throw new AppError(
      "VALIDATION_ERROR",
      "This reset link is invalid or has expired.",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await userRepository.updatePassword(record.userId, passwordHash);
  await passwordResetRepository.markUsed(record.id);

  logger.info("auth.password_reset.completed", { userId: record.userId });
  return { message: "Your password has been updated. You can sign in now." };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppUrl() {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}
