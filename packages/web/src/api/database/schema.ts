import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================================
// ATHLETES
// ============================================================================

export const athletes = sqliteTable('athletes', {
  id: text('id').primaryKey(),

  name: text('name').notNull(),

  age: integer('age').notNull(),

  sex: text('sex').notNull(),

  experience: text('experience').notNull(),

  weeklyFrequency: text('weekly_frequency').notNull(),

  goal: text('goal').notNull(),

  // Dados usados pelo PrescriptionEngine
  level: text('level').notNull(),

  phase: text('phase').notNull(),

  goalType: text('goal_type').notNull(),

  weeklyVolume: real('weekly_volume').notNull().default(0),

  maxHeartRate: integer('max_heart_rate'),

  lactateThreshold: real('lactate_threshold'),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
});

// ============================================================================
// CHECK-INS
// ============================================================================

export const checkins = sqliteTable('checkins', {
  id: text('id').primaryKey(),

  athleteId: text('athlete_id')
    .notNull()
    .references(() => athletes.id),

  sleep: integer('sleep').notNull(),

  energy: integer('energy').notNull(),

  pain: integer('pain').notNull(),

  motivation: integer('motivation').notNull(),

  readiness: text('readiness').notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
});

// ============================================================================
// WORKOUTS
// ============================================================================

export const workouts = sqliteTable('workouts', {
  id: text('id').primaryKey(),

  athleteId: text('athlete_id')
    .notNull()
    .references(() => athletes.id),

  title: text('title').notNull(),

  type: text('type').notNull().default('easy'),

  duration: integer('duration').notNull(),

  distance: real('distance').notNull().default(0),

  rpe: integer('rpe').notNull(),

  instructions: text('instructions').notNull(),

  why: text('why').notNull(),

  successCriteria: text('success_criteria').notNull(),

  status: text('status').notNull().default('planned'),

  completed: integer('completed', { mode: 'boolean' }).default(false),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
});