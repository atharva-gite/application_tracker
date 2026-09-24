import { z } from "zod";

import { ANALYTICS_RANGES } from "@/lib/analytics-period";

export const analyticsQuerySchema = z.object({
  range: z.enum(ANALYTICS_RANGES).default("all"),
});
