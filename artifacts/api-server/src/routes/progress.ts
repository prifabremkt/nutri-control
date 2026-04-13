import { Router, type IRouter } from "express";
import { db, weightEntriesTable, diaryEntriesTable, profileTable } from "@workspace/db";
import {
  LogWeightBody,
  GetProgressResponse,
  GetDiarySummaryResponse,
} from "@workspace/api-zod";
import { sql, desc, eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/progress", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  const weightEntries = await db
    .select()
    .from(weightEntriesTable)
    .where(eq(weightEntriesTable.userId, userId))
    .orderBy(desc(weightEntriesTable.date))
    .limit(30);

  const dailySummaries = await db
    .select({
      date: diaryEntriesTable.date,
      totalCalories: sql<number>`sum(${diaryEntriesTable.calories})::float`,
    })
    .from(diaryEntriesTable)
    .where(eq(diaryEntriesTable.userId, userId))
    .groupBy(diaryEntriesTable.date)
    .orderBy(desc(diaryEntriesTable.date))
    .limit(30);

  const profiles = await db.select().from(profileTable).where(eq(profileTable.userId, userId)).limit(1);
  const targetCalories = profiles.length > 0 ? profiles[0].weightKg * 2 * 4 + 1200 : 2000;

  res.json(
    GetProgressResponse.parse({
      weightEntries,
      dailySummaries: dailySummaries.map((s) => ({
        date: s.date,
        totalCalories: s.totalCalories ?? 0,
        targetCalories,
      })),
    })
  );
});

router.post("/progress", requireAuth, async (req, res): Promise<void> => {
  const parsed = LogWeightBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db.insert(weightEntriesTable).values({ ...parsed.data, userId: req.user!.userId }).returning();
  res.status(201).json(entry);
});

router.get("/diary/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const profiles = await db.select().from(profileTable).where(eq(profileTable.userId, userId)).limit(1);
  const targetCalories = profiles.length > 0 ? profiles[0].weightKg * 2 * 4 + 1200 : 2000;

  const summaries = await db
    .select({
      date: diaryEntriesTable.date,
      totalCalories: sql<number>`sum(${diaryEntriesTable.calories})::float`,
    })
    .from(diaryEntriesTable)
    .where(eq(diaryEntriesTable.userId, userId))
    .groupBy(diaryEntriesTable.date)
    .orderBy(desc(diaryEntriesTable.date))
    .limit(7);

  res.json(
    GetDiarySummaryResponse.parse(
      summaries.map((s) => ({
        date: s.date,
        totalCalories: s.totalCalories ?? 0,
        targetCalories,
      }))
    )
  );
});

export default router;
