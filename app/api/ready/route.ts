import { handleApi, json } from "@/lib/api";
import { getEmailDriver } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getStorageDriver } from "@/lib/storage";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    let database: "ok" | "error" = "ok";
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("database readiness timeout")), 3000);
        }),
      ]);
    } catch {
      database = "error";
    }

    const ready = database === "ok";
    return json(
      {
        status: ready ? "ok" : "error",
        checks: {
          database,
          storage: getStorageDriver(),
          email: getEmailDriver(),
        },
      },
      ready ? 200 : 503,
    );
  });
}
