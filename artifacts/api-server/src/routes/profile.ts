import { Router, type IRouter } from "express";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody, GetProfileResponse, UpdateProfileResponse } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function calculateNutrition(profile: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: string;
  activityLevel: string;
  caloricGoal: string;
}) {
  const { weightKg, heightCm, age, sex, activityLevel, caloricGoal } = profile;

  const bmi = weightKg / Math.pow(heightCm / 100, 2);

  let bmr: number;
  if (sex === "M") {
    bmr = 88.36 + 13.4 * weightKg + 4.8 * heightCm - 5.7 * age;
  } else {
    bmr = 447.6 + 9.2 * weightKg + 3.1 * heightCm - 4.3 * age;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  const tdee = bmr * (activityMultipliers[activityLevel] ?? 1.375);

  const caloricAdjustments: Record<string, number> = {
    maintain: 0,
    lose_mild: -250,
    lose_moderate: -500,
    lose_aggressive: -750,
    gain: 300,
  };
  const targetCalories = tdee + (caloricAdjustments[caloricGoal] ?? 0);

  const targetProteinG = weightKg * 2;
  const targetFatG = (targetCalories * 0.25) / 9;
  const remainingCalories = targetCalories - targetProteinG * 4 - targetFatG * 9;
  const targetCarbsG = Math.max(remainingCalories / 4, 0);
  const targetWaterMl = weightKg * 35;

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    targetProteinG: Math.round(targetProteinG),
    targetCarbsG: Math.round(targetCarbsG),
    targetFatG: Math.round(targetFatG),
    targetWaterMl: Math.round(targetWaterMl),
  };
}

async function ensureProfile() {
  const existing = await db.select().from(profileTable).limit(1);
  if (existing.length === 0) {
    const [created] = await db.insert(profileTable).values({}).returning();
    return created;
  }
  return existing[0];
}

router.get("/profile", async (req, res): Promise<void> => {
  const profile = await ensureProfile();
  const nutrition = calculateNutrition(profile);
  res.json(GetProfileResponse.parse({ ...profile, ...nutrition }));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await ensureProfile();
  const [updated] = await db
    .update(profileTable)
    .set(parsed.data)
    .where(eq(profileTable.id, profile.id))
    .returning();

  const nutrition = calculateNutrition(updated);
  res.json(UpdateProfileResponse.parse({ ...updated, ...nutrition }));
});

export default router;
