async function runSeed() {
  try {
  const { seedDatabase } = await import('./seed.ts');

    await seedDatabase();

    console.log('🌱 Seed executado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  }
}

runSeed();