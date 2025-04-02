import EzDB from "ezdb-main";

// Define the database storage path (optional, defaults to './data')
const DB_PATH = "./database"; // Change this path if needed

async function main() {
    console.log("🔥 Initializing EzDB...");
    
    // Initialize database with a custom path
    const db = new EzDB("users", { path: DB_PATH });

    console.log("\n📂 Data is being stored in:", `${DB_PATH}/users.ezdb`);

    console.log("\n➕ Inserting users into the database...");
    const user1 = await db.insert({ name: "Alice", age: 25 });
    const user2 = await db.insert({ name: "Bob", age: 30 });

    console.log("\n📋 Fetching all users:");
    console.table(await db.getAll());

    console.log("\n🔍 Finding a user by name (Alice):");
    console.table(await db.find({ name: "Alice" }));

    console.log("\n✏️ Updating Bob's age from 30 to 31...");
    await db.update(user2, { age: 31 });
    console.log("\n📋 Updated user record:");
    console.table(await db.findById(user2));

    console.log("\n🗑️ Deleting Alice from the database...");
    await db.delete(user1);
    console.log("\n📋 Users after deletion:");
    console.table(await db.getAll());

    console.log("\n🔄 Running a transaction to insert multiple users...");
    await db.transaction(async (txn) => {
        await txn.insert({ name: "Charlie", age: 40 });
        await txn.insert({ name: "Dave", age: 35 });
    });

    console.log("\n📋 All users after transaction:");
    console.table(await db.getAll());

    console.log("\n🧹 Clearing the database...");
    await db.clear();
    console.log("\n📋 Users after clearing:");
    console.table(await db.getAll());

    console.log("\n✅ Demo complete! 🚀");
}

// Run the script
main().catch(console.error);
