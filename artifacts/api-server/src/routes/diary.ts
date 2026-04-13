import { Router, type IRouter } from "express";
import { db, diaryEntriesTable } from "@workspace/db";
import {
  GetDiaryEntriesQueryParams,
  GetDiaryEntriesResponse,
  AddDiaryEntryBody,
  DeleteDiaryEntryParams,
} from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/diary", requireAuth, async (req, res): Promise<void> => {
  const params = GetDiaryEntriesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.user!.userId;
  const entries = await db
    .select()
    .from(diaryEntriesTable)
    .where(and(eq(diaryEntriesTable.date, params.data.date), eq(diaryEntriesTable.userId, userId)));

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProteinG = entries.reduce((sum, e) => sum + e.proteinG, 0);
  const totalCarbsG = entries.reduce((sum, e) => sum + e.carbsG, 0);
  const totalFatG = entries.reduce((sum, e) => sum + e.fatG, 0);

  res.json(
    GetDiaryEntriesResponse.parse({
      date: params.data.date,
      entries,
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
    })
  );
});

router.post("/diary", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddDiaryEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db.insert(diaryEntriesTable).values({ ...parsed.data, userId: req.user!.userId }).returning();
  res.status(201).json(entry);
});

router.delete("/diary/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteDiaryEntryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(diaryEntriesTable).where(
    and(eq(diaryEntriesTable.id, params.data.id), eq(diaryEntriesTable.userId, req.user!.userId))
  );
  res.sendStatus(204);
});

export default router;
