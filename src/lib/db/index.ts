import { neon ,neonConfig} from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

neonConfig.fetchConnectionCache = true

if(!process.env.DATABASE_URL){
    throw new Error("database url not found")
}


// Connect a database
const sql = neon(process.env.DATABASE_URL)

// Drizzle use for create a schema and model
export const db = drizzle(sql)