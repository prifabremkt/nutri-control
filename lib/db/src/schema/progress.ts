import { pgTable, serial, real, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const weightEntriesTable = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  date: date("date").notNull(),
  weightKg: real("weight_kg").notNull(),
});

export const insertWeightEntrySchema = createInsertSchema(weightEntriesTable).omit({ id: true });
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type WeightEntry = typeof weightEntriesTable.$inferSelect;
