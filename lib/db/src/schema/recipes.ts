import { pgTable, serial, text, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  name: text("name").notNull(),
  description: text("description"),
  servings: integer("servings").notNull().default(1),
  caloriesPerServing: real("calories_per_serving").notNull(),
  proteinGPerServing: real("protein_g_per_serving").notNull().default(0),
  carbsGPerServing: real("carbs_g_per_serving").notNull().default(0),
  fatGPerServing: real("fat_g_per_serving").notNull().default(0),
  ingredients: text("ingredients").array().notNull().default([]),
  instructions: text("instructions"),
});

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({ id: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipesTable.$inferSelect;
