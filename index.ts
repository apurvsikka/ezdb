import { readFile, writeFile, access, mkdir } from "fs/promises";
import { resolve, dirname } from "path";

class JSONDatabase {
  private dbFile: string;

  constructor(dbPath?: string) {
    this.dbFile = resolve(dbPath || process.env.DB_FILE || "./db.json");
  }

  private async ensureFileExists() {
    try {
      await access(this.dbFile);
    } catch {
      await this.createEmptyDB();
    }
  }

  private async createEmptyDB() {
    const dir = dirname(this.dbFile);
    await mkdir(dir, { recursive: true });
    await writeFile(this.dbFile, JSON.stringify({}, null, 2), "utf-8");
  }

  private async readDB(): Promise<any> {
    await this.ensureFileExists();
    try {
      const data = await readFile(this.dbFile, "utf-8");
      return JSON.parse(data) || {};
    } catch {
      return {};
    }
  }

  private async writeDB(data: any): Promise<void> {
    await this.ensureFileExists();
    await writeFile(this.dbFile, JSON.stringify(data, null, 2), "utf-8");
  }

  async createCollection(name: string): Promise<void> {
    const db = await this.readDB();
    if (!db[name]) {
      db[name] = [];
      await this.writeDB(db);
    }
  }

  async getCollection<T>(name: string): Promise<T[]> {
    const db = await this.readDB();
    return db[name] || [];
  }

  async deleteCollection(name: string): Promise<void> {
    const db = await this.readDB();
    if (db[name]) {
      delete db[name];
      await this.writeDB(db);
    }
  }

  async updateCollection<T>(name: string, newData: T[]): Promise<void> {
    const db = await this.readDB();
    db[name] = newData;
    await this.writeDB(db);
  }

  async addItem<T extends { id: number }>(
    name: string,
    item: T,
  ): Promise<void> {
    const collection = await this.getCollection<T>(name);
    item.id =
      collection.length > 0 ? Math.max(...collection.map((i) => i.id)) + 1 : 1;
    collection.push(item);
    await this.updateCollection(name, collection);
  }

  async deleteItem<T extends { id: number }>(
    name: string,
    id: number,
  ): Promise<void> {
    const collection = await this.getCollection<T>(name);
    const updatedCollection = collection.filter((item) => item.id !== id);
    await this.updateCollection(name, updatedCollection);
  }

  async updateItem<T extends { id: number }>(
    name: string,
    id: number,
    newItem: Partial<T>,
  ): Promise<void> {
    const collection = await this.getCollection<T>(name);
    const index = collection.findIndex((item) => item.id === id);
    if (index !== -1) {
      collection[index] = { ...collection[index], ...newItem };
      await this.updateCollection(name, collection);
    }
  }

  async searchItems<T>(
    name: string,
    predicate: (item: T) => boolean,
  ): Promise<T[]> {
    const collection = await this.getCollection<T>(name);
    return collection.filter(predicate);
  }
}

export default JSONDatabase;
