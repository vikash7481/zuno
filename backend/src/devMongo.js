import { MongoMemoryServer } from 'mongodb-memory-server';

console.log('[DevMongo] Initializing local MongoDB engine...');
try {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'zuno_db'
    },
    spawnTimeout: 60000
  });

  const uri = mongod.getUri();
  console.log(`[DevMongo] SUCCESS: MongoDB instance running at ${uri}`);
  console.log('[DevMongo] Ready for seeding, testing, and backend execution.');

  // Keep process alive
  setInterval(() => {}, 1000 * 60 * 60);

  process.on('SIGINT', async () => {
    console.log('[DevMongo] Shutting down...');
    await mongod.stop();
    process.exit(0);
  });
} catch (err) {
  console.error('[DevMongo] Error starting in-memory MongoDB:', err.message);
  process.exit(1);
}
