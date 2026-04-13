import { Router, type IRouter } from "express";
import { db, hydrationTable } from "@workspace/db";
import {
  GetHydrationQueryParams,
  GetHydrationResponse,
  AddHydrationBody,
  AddHydrationResponse,
  ResetHydrationBody,
  ResetHydrationResponse,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getOrCreateHydration(date: string) {
  const existing = await db
    .select()
    .from(hydrationTable)
    .where(eq(hydrationTable.date, date))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(hydrationTable).values({ date, totalMl: 0, cups: 0 }).returning();
  return created;
}

router.get("/hydration", async (req, res): Promise<void> => {
  const params = GetHydrationQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const hydration = await getOrCreateHydration(params.data.date);
  res.json(GetHydrationResponse.parse(hydration));
});

router.post("/hydration", async (req, res): Promise<void> => {
  const parsed = AddHydrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, amountMl } = parsed.data;
  const existing = await getOrCreateHydration(date);

  const [updated] = await db
    .update(hydrationTable)
    .set({
      totalMl: existing.totalMl + amountMl,
      cups: existing.cups + 1,
    })
    .where(eq(hydrationTable.date, date))
    .returning();

  res.json(AddHydrationResponse.parse(updated));
});

router.post("/hydration/reset", async (req, res): Promise<void> => {
  const parsed = ResetHydrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date } = parsed.data;
  await getOrCreateHydration(date);

  const [updated] = await db
    .update(hydrationTable)
    .set({ totalMl: 0, cups: 0 })
    .where(eq(hydrationTable.date, date))
    .returning();

  res.json(ResetHydrationResponse.parse(updated));
});

export default router;
