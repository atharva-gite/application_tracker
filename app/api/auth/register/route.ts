import { signUpWithPassword } from "@/lib/auth";
import { getClientKey, handleApi, json, parseJsonBody } from "@/lib/api";
import { assertRateLimit } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";
import { parseSchema, registerSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    assertRateLimit({
      key: `register:${getClientKey(request)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const input = parseSchema(registerSchema, await parseJsonBody(request));
    const signedUp = await signUpWithPassword({
      email: input.email,
      password: input.password,
      name: input.name,
    });
    if (signedUp.error) {
      throw new AppError("CONFLICT", signedUp.error);
    }

    return json({ ok: true }, 201);
  });
}
