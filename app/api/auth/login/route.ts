import { signIn } from "@/lib/auth";
import { getClientKey, handleApi, json, parseJsonBody } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { assertRateLimit } from "@/lib/rate-limit";
import { loginSchema, parseSchema } from "@/lib/validation/auth";
import { verifyCredentials } from "@/server/services/auth-service";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    assertRateLimit({
      key: `login:${getClientKey(request)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const input = parseSchema(loginSchema, await parseJsonBody(request));
    const user = await verifyCredentials(input);

    if (!user) {
      throw new AppError("UNAUTHORIZED", "Invalid email or password.");
    }

    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });

    return json({ user });
  });
}
