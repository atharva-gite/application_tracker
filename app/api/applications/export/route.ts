import { NextResponse } from "next/server";

import { handleApi } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";
import { exportApplicationsCsv } from "@/server/services/application-csv-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const csv = await exportApplicationsCsv(user.id);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="folio-applications.csv"',
      },
    });
  });
}
