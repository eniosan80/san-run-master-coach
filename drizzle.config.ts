import { defineConfig } from 'drizzle-kit'; 
 
export default defineConfig({ 
  dialect: 'sqlite', 
  schema: './packages/web/src/api/database/schema.ts', 
  out: './packages/web/src/api/database/migrations', 
  dbCredentials: { 
    url: process.env.DATABASE_URL!, 
  }, 
}); 
