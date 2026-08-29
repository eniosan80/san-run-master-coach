import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq, desc } from "drizzle-orm";
import {
classifyAthlete,
generateDiagnosis,
generateWorkout,
} from "./lib/classify";
import type {
ExperienceLevel,
WeeklyFrequency,
} from "./lib/classify";
import { randomUUID } from "crypto";
import prescriptionRoutes from "./routes/prescription";

const app = new Hono();

app.use("*", cors({ origin: "*" }));

// ============================================================
// HEALTH
// ============================================================

app.get("/api/health", (c) => {
return c.json({ status: "ok" }, 200);
});

// ============================================================
// PRESCRIPTION
// ============================================================

app.route("/api/prescription", prescriptionRoutes);

// ============================================================
// CREATE ATHLETE
// ============================================================

app.post("/api/athlete", async (c) => {
const body = await c.req.json();

const name = String(body.name ?? "");
const age = Number(body.age);
const sex = String(body.sex ?? "");
const experience =
body.experience as ExperienceLevel;
const weeklyFrequency =
body.weeklyFrequency as WeeklyFrequency;
const goal = String(body.goal ?? "");

const classification = classifyAthlete({
age,
sex,
experience,
weeklyFrequency,
goal,
});

const athleteId = randomUUID();

await db.insert(schema.athletes).values({
id: athleteId,
name,
age,
sex,
experience,
weeklyFrequency,
goal,


level: String(classification.level),
phase: String(classification.phase),
goalType: goal,

weeklyVolume: 0,


});

const diagnosis = generateDiagnosis(
{
age,
sex,
experience,
weeklyFrequency,
goal,
},
classification,
);

const generatedWorkout = generateWorkout(
classification.level,
classification.phase,
);

const workoutId = randomUUID();
console.log("DEBUG generatedWorkout:", generatedWorkout);
console.log("DEBUG duration:", generatedWorkout.duration);
await db.insert(schema.workouts).values({
id: workoutId,
athleteId: athleteId,
title: generatedWorkout.title,
type: "easy",
duration: Number.parseInt(generatedWorkout.duration, 10),
distance: 0,
rpe: Number(generatedWorkout.rpe),
instructions: generatedWorkout.instructions,
why: generatedWorkout.why,
successCriteria: generatedWorkout.successCriteria,
status: "planned",
completed: false,
});

return c.json(
{
athlete: {
id: athleteId,
name,
level: classification.level,
phase: classification.phase,
},
classification,
diagnosis,
workout: {
id: workoutId,
...generatedWorkout,
},
},
201,
);
});

// ============================================================
// GET ATHLETE
// ============================================================

app.get("/api/athlete/:id", async (c) => {
const id = c.req.param("id");

const [athlete] = await db
.select()
.from(schema.athletes)
.where(eq(schema.athletes.id, id));

if (!athlete) {
return c.json(
{ error: "Atleta não encontrado" },
404,
);
}

return c.json({ athlete }, 200);
});

// ============================================================
// CREATE CHECK-IN
// ============================================================

app.post("/api/checkin", async (c) => {
const body = await c.req.json();

const athleteId = String(
body.athleteId ?? "",
);

const sleep = Number(body.sleep);
const energy = Number(body.energy);
const pain = Number(body.pain);
const motivation = Number(body.motivation);

const score =
(sleep + energy + motivation) / 3 -
pain / 5;

let readiness: "high" | "medium" | "low";

if (score >= 3.5) {
readiness = "high";
} else if (score >= 2) {
readiness = "medium";
} else {
readiness = "low";
}

const checkinId = randomUUID();

await db.insert(schema.checkins).values({
id: checkinId,
athleteId,
sleep,
energy,
pain,
motivation,
readiness,
});

const [athlete] = await db
.select()
.from(schema.athletes)
.where(
eq(
schema.athletes.id,
athleteId,
),
);

let workout = null;

if (athlete) {
const generatedWorkout = generateWorkout(
Number(athlete.level),
athlete.phase as any,
readiness,
);


const workoutId = randomUUID();

await db.insert(schema.workouts).values({
  id: workoutId,
  athleteId: athlete.id,
  title: generatedWorkout.title,
  type: "easy",
  duration: Number.parseInt(generatedWorkout.duration, 10),
  distance: 0,
  rpe: Number(generatedWorkout.rpe),
  instructions:
    generatedWorkout.instructions,
  why: generatedWorkout.why,
  successCriteria:
    generatedWorkout.successCriteria,
  status: "planned",
  completed: false,
});

workout = {
  id: workoutId,
  ...generatedWorkout,
};


}

return c.json(
{
checkin: {
id: checkinId,
readiness,
score,
},
workout,
},
201,
);
});

// ============================================================
// GET CHECK-INS
// ============================================================

app.get(
"/api/checkin/:athleteId",
async (c) => {
const athleteId =
c.req.param("athleteId");


const checkinsList = await db
  .select()
  .from(schema.checkins)
  .where(
    eq(
      schema.checkins.athleteId,
      athleteId,
    ),
  )
  .orderBy(
    desc(schema.checkins.createdAt),
  )
  .limit(7);

return c.json(
  {
    checkins: checkinsList,
  },
  200,
);


},
);

// ============================================================
// GET TODAY'S WORKOUT
// ============================================================

app.get(
"/api/workout/:athleteId/today",
async (c) => {
const athleteId =
c.req.param("athleteId");


const [workout] = await db
  .select()
  .from(schema.workouts)
  .where(
    eq(
      schema.workouts.athleteId,
      athleteId,
    ),
  )
  .orderBy(
    desc(schema.workouts.createdAt),
  )
  .limit(1);

if (!workout) {
  return c.json(
    {
      error:
        "Nenhum treino encontrado",
    },
    404,
  );
}

return c.json(
  { workout },
  200,
);


},
);

// ============================================================
// COMPLETE WORKOUT
// ============================================================

app.post(
"/api/workout/:id/complete",
async (c) => {
const id = c.req.param("id");


await db
  .update(schema.workouts)
  .set({
    completed: true,
    status: "completed",
  })
  .where(
    eq(
      schema.workouts.id,
      id,
    ),
  );

return c.json(
  { success: true },
  200,
);


},
);

// ============================================================
// EXPORT
// ============================================================

export type AppType = typeof app;

export default app;




