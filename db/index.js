import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

// Pastikan DATABASE_URL ada di .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL tidak ditemukan di environment variable');
}

// Client untuk query
const client = postgres(connectionString);

// Export instance db dengan schema agar fitur autocompletion (IntelliSense) Jalan
export const db = drizzle(client, { schema });