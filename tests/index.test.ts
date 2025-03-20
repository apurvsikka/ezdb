import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { rm } from "fs/promises";
import JSONDatabase from "../index";

const TEST_DB_FILE = "./test_db.json";

describe("JSONDatabase", () => {
  let db: JSONDatabase;

  beforeEach(async () => {
    db = new JSONDatabase(TEST_DB_FILE);
  });

  afterEach(async () => {
    await rm(TEST_DB_FILE, { force: true });
  });

  it("should create a collection", async () => {
    await db.createCollection("users");
    const collection = await db.getCollection("users");
    expect(collection).toEqual([]);
  });

  it("should add an item to a collection", async () => {
    await db.createCollection("users");
    await db.addItem("users", { name: "Alice" });
    const users = await db.getCollection("users");
    expect(users.length).toBe(1);
    expect(users[0].name).toBe("Alice");
    expect(users[0].id).toBe(1);
  });

  it("should delete an item from a collection", async () => {
    await db.createCollection("users");
    await db.addItem("users", { name: "Alice" });
    await db.addItem("users", { name: "Bob" });
    await db.deleteItem("users", 1);
    const users = await db.getCollection("users");
    expect(users.length).toBe(1);
    expect(users[0].name).toBe("Bob");
  });

  it("should update an item in a collection", async () => {
    await db.createCollection("users");
    await db.addItem("users", { name: "Alice" });
    await db.updateItem("users", 1, { name: "Alice Updated" });
    const users = await db.getCollection("users");
    expect(users[0].name).toBe("Alice Updated");
  });

  it("should delete a collection", async () => {
    await db.createCollection("users");
    await db.deleteCollection("users");
    const users = await db.getCollection("users");
    expect(users).toEqual([]);
  });

  it("should search items in a collection", async () => {
    await db.createCollection("users");
    await db.addItem("users", { name: "Alice" });
    await db.addItem("users", { name: "Bob" });
    const result = await db.searchItems(
      "users",
      (user) => user.name === "Alice",
    );
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Alice");
  });
});
