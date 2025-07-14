import { MongoClient, Db } from 'mongodb';
import { MONGODB_URL } from '../config';

const DB_NAME = process.env.MONGODB_DB || 'taskqueues';

let client: MongoClient;
let db: Db;

export async function connectToMongo(): Promise<Db> {
  if (db) return db;
  if (!MONGODB_URL) throw new Error('MONGODB_URL is not defined');
  client = new MongoClient(MONGODB_URL);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error('MongoClient not initialized. Call connectToMongo first.');
  }
  return client;
} 