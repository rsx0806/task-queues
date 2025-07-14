import { ObjectId, Db } from 'mongodb';
import { connectToMongo } from './mongodb.service';
import { Task, TaskStatus } from '../models/task.model';

const COLLECTION = 'tasks';

export class TaskService {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async createTask(data: Omit<Task, '_id'>): Promise<Task> {
    const result = await this.db.collection(COLLECTION).insertOne(data);
    return { ...data, _id: result.insertedId.toString() };
  }

  async getTaskById(id: string): Promise<Task | null> {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
    const task = await this.db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!task) return null;
    const { _id, ...rest } = task;
    return { ...rest, _id: _id.toString() } as Task;
  }

  async getTasks(status?: TaskStatus): Promise<Task[]> {
    const filter = status ? { status } : {};
    const tasks = await this.db.collection(COLLECTION).find(filter).toArray();
    return tasks.map((t) => {
      const { _id, ...rest } = t;
      return { ...rest, _id: _id.toString() } as Task;
    });
  }

  async updateTask(id: string, data: Partial<Omit<Task, '_id'>>): Promise<Task | null> {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
    const result = await this.db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    if (!result) return null;
    const { _id, ...rest } = result;
    return { ...rest, _id: _id.toString() } as Task;
  }
} 