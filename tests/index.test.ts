import { describe, it, expect, beforeEach } from "bun:test";
import EzDB from "ezdb-main";

describe("EzDB", () => {
  let db: EzDB;

  beforeEach(async () => {
    db = new EzDB("testdb");
    await db.clear(); // Ensure a clean slate before each test
  });

  it("should insert and retrieve a record", async () => {
    const id = await db.insert({ name: "Alice", age: 25 });
    const record = await db.findById(id);
    expect(record).toBeTruthy();
    expect(record?.name).toBe("Alice");
    expect(record?.age).toBe(25);
  });

  it("should update a record", async () => {
    const id = await db.insert({ name: "Bob", age: 30 });
    await db.update(id, { age: 31 });
    const updated = await db.findById(id);
    expect(updated?.age).toBe(31);
  });

  it("should delete a record", async () => {
    const id = await db.insert({ name: "Charlie", age: 40 });
    await db.delete(id);
    const deleted = await db.findById(id);
    expect(deleted).toBeNull();
  });

  it("should find records by query", async () => {
    await db.insert({ name: "Eve", age: 28 });
    await db.insert({ name: "Eve", age: 35 });
    const results = await db.find({ name: "Eve" });
    expect(results.length).toBe(2);
  });

  it("should support transactions", async () => {
    await db.transaction(async (txn) => {
      const id = await txn.insert({ name: "Dave", age: 45 });
      const record = await txn.findById(id);
      expect(record).toBeTruthy();
      expect(record?.name).toBe("Dave");
    });
  });

  it("should rollback transaction on failure", async () => {
    try {
      await db.transaction(async (txn) => {
        await txn.insert({ name: "FailCase", age: 50 });
        throw new Error("Test error");
      });
    } catch {}

    const records = await db.find({ name: "FailCase" });
    expect(records.length).toBe(0);
  });

  it("should clear all records", async () => {
    await db.insert({ name: "John", age: 22 });
    await db.clear();
    const allRecords = await db.getAll();
    expect(allRecords.length).toBe(0);
  });
});
