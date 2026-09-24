import { getClientKey, handleApi, json } from "@/lib/api";
import { MAX_IMPORT_BYTES } from "@/lib/application-csv";
import { AppError } from "@/lib/errors";
import { assertRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/server/authorization/require-user";
import { importApplications } from "@/server/services/application-csv-service";

function isCsvUpload(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".csv") ||
    type.includes("csv") ||
    type === "text/plain" ||
    type === "application/vnd.ms-excel"
  );
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    assertRateLimit({
      key: `import:${user.id}:${getClientKey(request)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("VALIDATION_ERROR", "Choose a CSV file to import.");
    }
    if (!isCsvUpload(file)) {
      throw new AppError("VALIDATION_ERROR", "Upload a .csv file.");
    }
    if (file.size > MAX_IMPORT_BYTES) {
      throw new AppError("VALIDATION_ERROR", "CSV files must be 256 KB or smaller.");
    }

    const csv = await file.text();
    return json(await importApplications(user.id, csv));
  });
}
