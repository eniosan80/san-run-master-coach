import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/api/database/schema.ts',
  out: './src/api/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
