import { Router, type IRouter } from "express";
import { db, recipesTable } from "@workspace/db";
import {
  CreateRecipeBody,
  GetRecipeParams,
  GetRecipeResponse,
  GetRecipesResponse,
  DeleteRecipeParams,
} from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/recipes", requireAuth, async (req, res): Promise<void> => {
  const recipes = await db.select().from(recipesTable).where(eq(recipesTable.userId, req.user!.userId)).orderBy(recipesTable.name);
  res.json(GetRecipesResponse.parse(recipes));
});

router.post("/recipes", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [recipe] = await db.insert(recipesTable).values({ ...parsed.data, userId: req.user!.userId }).returning();
  res.status(201).json(GetRecipeResponse.parse(recipe));
});

router.get("/recipes/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetRecipeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(and(eq(recipesTable.id, params.data.id), eq(recipesTable.userId, req.user!.userId)))
    .limit(1);

  if (!recipe) {
    res.status(404).json({ error: "Receita não encontrada" });
    return;
  }

  res.json(GetRecipeResponse.parse(recipe));
});

router.delete("/recipes/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteRecipeParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(recipesTable).where(and(eq(recipesTable.id, params.data.id), eq(recipesTable.userId, req.user!.userId)));
  res.sendStatus(204);
});

export default router;
