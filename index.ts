import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { Mutex } from "async-mutex";

type Record<T> = T & { id: string };

type Query<T> = Partial<T>;

class EzDB<T> {
  private filePath: string;
  private indexPath: string;
  private data: Map<string, Record<T>> = new Map();
  private mutex = new Mutex();

  constructor(private dbName: string, private dir = "./db") {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.filePath = join(dir, `${dbName}.bin`);
    this.indexPath = join(dir, `${dbName}.idx`);
    this.load();
  }

  private load() {
    if (existsSync(this.indexPath) && existsSync(this.filePath)) {
      const indexData = readFileSync(this.indexPath);
      const dataFile = readFileSync(this.filePath);
      const index = JSON.parse(indexData.toString()) as Record<T>[];
      index.forEach((entry, i) => {
        const start = i * 512;
        const buffer = dataFile.slice(start, start + 512);
        const record = JSON.parse(buffer.toString().trim());
        this.data.set(entry.id, record);
      });
    }
  }

  private save() {
    const records = Array.from(this.data.values());
    const indexData = JSON.stringify(records.map(({ id }) => ({ id })));
    const dataBuffer = Buffer.alloc(records.length * 512);

    records.forEach((record, i) => {
      const buffer = Buffer.from(JSON.stringify(record).padEnd(512, " "));
      buffer.copy(dataBuffer, i * 512);
    });

    writeFileSync(this.indexPath, indexData, "utf-8");
    writeFileSync(this.filePath, dataBuffer);
  }

  async insert(record: Omit<Record<T>, "id">): Promise<Record<T>> {
    return this.mutex.runExclusive(() => {
      const newRecord = { ...record, id: crypto.randomUUID() } as Record<T>;
      this.data.set(newRecord.id, newRecord);
      this.save();
      return newRecord;
    });
  }

  async find(query: Query<T>): Promise<Record<T>[]> {
    return this.mutex.runExclusive(() => {
      return Array.from(this.data.values()).filter((record) =>
        Object.entries(query).every(([key, value]) => record[key as keyof T] === value)
      );
    });
  }

  async update(id: string, updates: Partial<T>): Promise<boolean> {
    return this.mutex.runExclusive(() => {
      if (!this.data.has(id)) return false;
      this.data.set(id, { ...this.data.get(id)!, ...updates });
      this.save();
      return true;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.mutex.runExclusive(() => {
      if (!this.data.has(id)) return false;
      this.data.delete(id);
      this.save();
      return true;
    });
  }

  async clear(): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.data.clear();
      this.save();
    });
  }
}

export default EzDB;
