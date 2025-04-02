![Logo](logo.png)
EzDB is a lightweight file-based database for Node.js, designed for fast key-value storage using binary files.

## Features
- **Binary storage** (`.bin` files) for efficient space usage
- **Indexing** (`.idx` files) for quick lookups
- **Thread safety** using an async mutex
- **CRUD operations** for managing data
- **Fixed-size binary chunks** for better performance

## Installation
```sh
npm install ezdb-main #or bun add ezdb-main
```

## Usage
### Importing and Initializing
```ts
import EzDB from "ezdb-main";

const db = new EzDB<{ name: string; age: number }>("users");
```

### Insert a Record
```ts
const user = await db.insert({ name: "Alice", age: 25 });
console.log(user); // { name: "Alice", age: 25, id: "uuid" }
```

### Find Records
```ts
const users = await db.find({ age: 25 });
console.log(users);
```

### Update a Record
```ts
const success = await db.update("some-id", { age: 26 });
```

### Delete a Record
```ts
const deleted = await db.delete("some-id");
```

### Clear the Database
```ts
await db.clear();
```

## How It Works
- **Data is stored in binary format** in `{dbName}.bin`.
- **Index file `{dbName}.idx`** keeps track of record positions.
- **Fixed-size chunks (512 bytes)** are used for storage.
- **Mutex locks ensure atomic operations**.

## License
EZdb is licensed under MIT license