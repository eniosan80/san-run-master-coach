import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq, desc } from "drizzle-orm";
import { classifyAthlete, generateDiagnosis, generateWorkout } from "./lib/classify";
import type { ExperienceLevel, WeeklyFrequency } from "./lib/classify";
import { randomUUID } from "crypto";

const app = new Hono()
  .basePath("api")
  .use(cors({ origin: "*" }))

  .get("/health", (c) => c.json({ status: "ok" }, 200))

  // --- ATHLETE ---
  .post("/athlete", async (c) => {
    const body = await c.req.json();
    const { name, age, sex, experience, weeklyFrequency, goal } = body;

    const classification = classifyAthlete({
      age: Number(age),
      sex,
      experience: experience as ExperienceLevel,
      weeklyFrequency: weeklyFrequency as WeeklyFrequency,
      goal,
    });

    const id = randomUUID();

    await db.insert(schema.athletes).values({
      id,
      name,
      age: Number(age),
      sex,
      experience,
      weeklyFrequency,
      goal,
      level: classification.level,
      phase: classification.phase,
    });

    const diagnosis = generateDiagnosis(
      { age: Number(age), sex, experience: experience as ExperienceLevel, weeklyFrequency: weeklyFrequency as WeeklyFrequency, goal },
      classification
    );

    const workout = generateWorkout(classification.level, classification.phase);

    // Save workout
    const workoutId = randomUUID();
    await db.insert(schema.workouts).values({
      id: workoutId,
      athleteId: id,
      title: workout.title,
      duration: workout.duration,
      rpe: workout.rpe,
      instructions: workout.instructions,
      why: workout.why,
      successCriteria: workout.successCriteria,
    });

    return c.json({ athlete: { id, name, level: classification.level, phase: classification.phase }, classification, diagnosis, workout }, 201);
  })

  .get("/athlete/:id", async (c) => {
    const id = c.req.param("id");
    const [athlete] = await db.select().from(schema.athletes).where(eq(schema.athletes.id, id));
    if (!athlete) return c.json({ error: "Atleta não encontrado" }, 404);
    return c.json({ athlete }, 200);
  })

  // --- CHECKIN ---
  .post("/checkin", async (c) => {
    const body = await c.req.json();
    const { athleteId, sleep, energy, pain, motivation } = body;

    const s = Number(sleep);
    const e = Number(energy);
    const p = Number(pain);
    const m = Number(motivation);

    // Readiness formula
    const score = (s + e + m) / 3 - p / 5;
    let readiness: "high" | "medium" | "low";
    if (score >= 3.5) readiness = "high";
    else if (score >= 2) readiness = "medium";
    else readiness = "low";

    const id = randomUUID();
    await db.insert(schema.checkins).values({
      id,
      athleteId,
      sleep: s,
      energy: e,
      pain: p,
      motivation: m,
      readiness,
    });

    // Get athlete for workout generation
    const [athlete] = await db.select().from(schema.athletes).where(eq(schema.athletes.id, athleteId));
    let workout = null;
    if (athlete) {
      const w = generateWorkout(athlete.level, athlete.phase as any, readiness);
      const workoutId = randomUUID();
      await db.insert(schema.workouts).values({
        id: workoutId,
        athleteId,
        title: w.title,
        duration: w.duration,
        rpe: w.rpe,
        instructions: w.instructions,
        why: w.why,
        successCriteria: w.successCriteria,
      });
      workout = { id: workoutId, ...w };
    }

    return c.json({ checkin: { id, readiness }, workout }, 201);
  })

  .get("/checkin/:athleteId", async (c) => {
    const athleteId = c.req.param("athleteId");
    const checkinsList = await db
      .select()
      .from(schema.checkins)
      .where(eq(schema.checkins.athleteId, athleteId))
      .orderBy(desc(schema.checkins.createdAt))
      .limit(7);
    return c.json({ checkins: checkinsList }, 200);
  })

  // --- WORKOUT ---
  .get("/workout/:athleteId/today", async (c) => {
    const athleteId = c.req.param("athleteId");
    const [workout] = await db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.athleteId, athleteId))
      .orderBy(desc(schema.workouts.createdAt))
      .limit(1);
    if (!workout) return c.json({ error: "Nenhum treino encontrado" }, 404);
    return c.json({ workout }, 200);
  })

  .post("/workout/:id/complete", async (c) => {
    const id = c.req.param("id");
    await db.update(schema.workouts).set({ completed: true }).where(eq(schema.workouts.id, id));
    return c.json({ success: true }, 200);
  });

export type AppType = typeof app;
export default app;
