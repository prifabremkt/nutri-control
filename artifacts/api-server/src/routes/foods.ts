import { Router, type IRouter } from "express";
import { db, foodsTable } from "@workspace/db";
import { SearchFoodsQueryParams, SearchFoodsResponse } from "@workspace/api-zod";
import { ilike } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/foods/search", requireAuth, async (req, res): Promise<void> => {
  const params = SearchFoodsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { q, limit = 20 } = params.data;

  const foods = await db
    .select()
    .from(foodsTable)
    .where(ilike(foodsTable.name, `%${q}%`))
    .limit(limit);

  res.json(SearchFoodsResponse.parse(foods));
});

export default router;
