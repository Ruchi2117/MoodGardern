import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
const dbPath = fileURLToPath(new URL('../../.local/mongodb/', import.meta.url));
await mkdir(dbPath, { recursive: true });
const database = await MongoMemoryServer.create({ instance: { port: 27017, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger' } });
console.log('Local MongoDB ready at mongodb://127.0.0.1:27017/moodgarden (persistent .local/mongodb)');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await database.stop({ doCleanup: false }); process.exit(0); });
