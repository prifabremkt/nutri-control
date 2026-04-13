import { pgTable, serial, real, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hydrationTable = pgTable("hydration", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  totalMl: real("total_ml").notNull().default(0),
  cups: integer("cups").notNull().default(0),
});

export const insertHydrationSchema = createInsertSchema(hydrationTable).omit({ id: true });
export type InsertHydration = z.infer<typeof insertHydrationSchema>;
export type Hydration = typeof hydrationTable.$inferSelect;
