import { PostgresStore } from '@mastra/pg';

export const pStore = new PostgresStore({
  id: 'validpost-store',
  connectionString: process.env.DATABASE_URL!,
});
