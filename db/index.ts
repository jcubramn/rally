import {drizzle} from 'drizzle-orm/neon-http';
import * as schema from './schema';

let cached: ReturnType<typeof drizzle> | null = null;

export function database() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  cached = drizzle(url, {schema});
  return cached;
}
