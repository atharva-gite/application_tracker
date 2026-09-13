import { getClientKey, handleApi, json, parseJsonBody } from "@/lib/api";
import { assertRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema, parseSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/server/services/auth-service";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    assertRateLimit({
      key: `forgot-password:${getClientKey(request)}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    const input = parseSchema(
      forgotPasswordSchema,
      await parseJsonBody(request),
    );
    const result = await requestPasswordReset(input);
    return json(result);
  });
}
