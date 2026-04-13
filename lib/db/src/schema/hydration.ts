import { pgTable, serial, real, integer, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hydrationTable = pgTable("hydration", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  date: date("date").notNull(),
  totalMl: real("total_ml").notNull().default(0),
  cups: integer("cups").notNull().default(0),
}, (table) => [
  unique("hydration_date_user_unique").on(table.date, table.userId),
]);

export const insertHydrationSchema = createInsertSchema(hydrationTable).omit({ id: true });
export type InsertHydration = z.infer<typeof insertHydrationSchema>;
export type Hydration = typeof hydrationTable.$inferSelect;
