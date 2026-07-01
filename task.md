# TAREFA: Fonte única de verdade — treinos SAN RUN

## PROBLEMA
- `WeeklyWorkout` tem só: title, duration, rpe, objective — SEM instructions/blocks
- `session.workout` é UM treino global — não varia por dia
- weekly.tsx navega para /workout sem passar qual dia foi clicado
- workout.tsx sempre lê `session.workout` (o mesmo para todos os dias)

## SOLUÇÃO

### 1. Criar tipo `WorkoutTemplate` com blocos estruturados em classify.ts
```ts
interface WorkoutBlock {
  type: "warmup" | "series" | "cooldown"
  label: string
  durationMin?: number   // warmup/cooldown
  rpe?: number
  reps?: number          // series
  workDurationMin?: number
  restDurationMin?: number
  workRpe?: number
  restRpe?: number
}

interface FullWorkout extends WorkoutRecommendation {
  blocks: WorkoutBlock[]
}
```

### 2. Expandir WeeklyWorkout para incluir dados completos
```ts
interface WeeklyWorkout {
  ...atual...
  instructions: string
  why: string
  successCriteria: string
  blocks: WorkoutBlock[]  // NOVO: blocos estruturados
}
```

### 3. generateDefaultWeeklyPlan popula instructions+why+successCriteria+blocks por treino
- Cada template tem seu próprio conjunto de blocos — não compartilha

### 4. weekly.tsx: ao clicar num dia, salvar `session.workout` com os dados daquele dia
- navigate("/workout") + session.workout = workout daquele dia

### 5. workout.tsx: phasesFromInstructions substituído por phasesFromBlocks quando blocks disponíveis
- Blocos estruturados = preview exato sem parse de string

## ARQUIVOS A MODIFICAR
1. `packages/web/src/api/lib/classify.ts` — adicionar blocks em cada WorkoutRecommendation + generateFullWeeklyTemplates()
2. `packages/web/src/web/lib/store.ts` — expandir WeeklyWorkout com instructions/why/successCriteria/blocks
3. `packages/web/src/web/pages/weekly.tsx` — ao clicar, salvar session.workout com dados do dia e navegar
4. `packages/web/src/web/pages/workout.tsx` — usar blocks quando disponíveis (já tem phasesFromBlocks)

## STATUS
- [ ] classify.ts — WorkoutBlock type + blocks em cada template
- [ ] store.ts — WeeklyWorkout expandido + generateDefaultWeeklyPlan com dados completos
- [ ] weekly.tsx — click handler salva o workout correto no session
- [ ] workout.tsx — prioriza blocks quando disponíveis (já implementado)
- [ ] build verify
