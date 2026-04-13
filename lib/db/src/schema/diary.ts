import { pgTable, serial, text, real, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const diaryEntriesTable = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(),
  foodId: serial("food_id"),
  foodName: text("food_name").notNull(),
  quantityG: real("quantity_g").notNull(),
  calories: real("calories").notNull(),
  proteinG: real("protein_g").notNull().default(0),
  carbsG: real("carbs_g").notNull().default(0),
  fatG: real("fat_g").notNull().default(0),
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntriesTable).omit({ id: true });
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntriesTable.$inferSelect;
