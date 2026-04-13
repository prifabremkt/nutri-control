import { pgTable, serial, text, real, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Usuário"),
  age: integer("age").notNull().default(30),
  sex: text("sex").notNull().default("F"),
  weightKg: real("weight_kg").notNull().default(70),
  heightCm: real("height_cm").notNull().default(165),
  activityLevel: text("activity_level").notNull().default("lightly_active"),
  caloricGoal: text("caloric_goal").notNull().default("maintain"),
  intermittentFasting: boolean("intermittent_fasting").notNull().default(false),
  fastingStartHour: integer("fasting_start_hour").default(20),
  fastingEndHour: integer("fasting_end_hour").default(12),
});

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profileTable.$inferSelect;
