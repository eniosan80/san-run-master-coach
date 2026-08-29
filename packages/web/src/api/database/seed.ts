import { db } from './index';
import { athletes, workouts, checkins } from './schema';

export async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await db.delete(checkins);
  await db.delete(workouts);
  await db.delete(athletes);

  // Inserir atletas de teste
  const athleteIds = await db.insert(athletes).values([
    {
      id: 'athlete-1',
      name: 'João Silva',
      email: 'joao@sanrun.com',
      level: 'intermediate',
      phase: 'build',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'athlete-2',
      name: 'Maria Santos',
      email: 'maria@sanrun.com',
      level: 'advanced',
      phase: 'peak',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]).returning();

  console.log('✅ Atletas inseridos:', athleteIds.length);

  // Inserir treinos de teste
  const workoutIds = await db.insert(workouts).values([
    {
      id: 'workout-1',
      athleteId: athleteIds[0].id,
      name: 'Treino Fácil',
      type: 'easy',
      duration: 30,
      distance: 5,
      rpe: 3,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'workout-2',
      athleteId: athleteIds[0].id,
      name: 'Treino Forte',
      type: 'hard',
      duration: 45,
      distance: 8,
      rpe: 8,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]).returning();

  console.log('✅ Treinos inseridos:', workoutIds.length);
  console.log('🌱 Seed concluído com sucesso!');
}

seedDatabase().catch(console.error);
