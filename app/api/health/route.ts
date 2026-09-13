import { handleApi, json } from "@/lib/api";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    return json({ status: "ok" });
  });
}
