import { signIn } from "@/lib/auth";
import { getClientKey, handleApi, json, parseJsonBody } from "@/lib/api";
import { assertRateLimit } from "@/lib/rate-limit";
import { parseSchema, registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/server/services/auth-service";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    assertRateLimit({
      key: `register:${getClientKey(request)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const input = parseSchema(registerSchema, await parseJsonBody(request));
    const user = await registerUser(input);

    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });

    return json({ user }, 201);
  });
}
