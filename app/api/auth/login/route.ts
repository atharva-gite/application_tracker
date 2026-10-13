import { signInWithPassword } from "@/lib/auth";
import { getClientKey, handleApi, json, parseJsonBody } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { assertRateLimit } from "@/lib/rate-limit";
import { loginSchema, parseSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    assertRateLimit({
      key: `login:${getClientKey(request)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const input = parseSchema(loginSchema, await parseJsonBody(request));
    const session = await signInWithPassword(input.email, input.password);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "Invalid email or password.");
    }

    return json({ user: session.user });
  });
}
