import { handleApi, json } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { processDueFollowUpReminders } from "@/server/services/reminder-service";

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new AppError("UNAUTHORIZED", "Reminder processing is not configured.");
  }
  const header = request.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    throw new AppError("UNAUTHORIZED", "You need to sign in to continue.");
  }
}

export async function GET(request: Request) {
  return handleApi(request, async () => {
    authorizeCron(request);
    return json(await processDueFollowUpReminders());
  });
}

export async function POST(request: Request) {
  return GET(request);
}
