import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const athletes = sqliteTable("athletes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(), // 'male' | 'female' | 'other'
  experience: text("experience").notNull(), // 'never' | 'beginner' | 'intermediate' | 'advanced'
  weeklyFrequency: text("weekly_frequency").notNull(), // '0' | '1-2' | '3-4' | '5+'
  goal: text("goal").notNull(),
  level: integer("level").notNull().default(1), // 1-5
  phase: text("phase").notNull().default("Adaptação"), // Adaptação | Construção | Evolução | Desempenho | Retorno
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const checkins = sqliteTable("checkins", {
  id: text("id").primaryKey(),
  athleteId: text("athlete_id").notNull().references(() => athletes.id),
  sleep: integer("sleep").notNull(), // 1-5
  energy: integer("energy").notNull(), // 1-5
  pain: integer("pain").notNull(), // 0-10
  motivation: integer("motivation").notNull(), // 1-5
  readiness: text("readiness").notNull(), // 'high' | 'medium' | 'low'
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),
  athleteId: text("athlete_id").notNull().references(() => athletes.id),
  title: text("title").notNull(),
  duration: text("duration").notNull(),
  rpe: integer("rpe").notNull(),
  instructions: text("instructions").notNull(),
  why: text("why").notNull(),
  successCriteria: text("success_criteria").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
