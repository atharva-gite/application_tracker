import { getClientKey, handleApi, json, parseJsonBody } from "@/lib/api";
import { assertRateLimit } from "@/lib/rate-limit";
import { parseSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { resetPassword } from "@/server/services/auth-service";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    assertRateLimit({
      key: `reset-password:${getClientKey(request)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const input = parseSchema(resetPasswordSchema, await parseJsonBody(request));
    const result = await resetPassword(input);
    return json(result);
  });
}
