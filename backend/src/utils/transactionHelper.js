import mongoose from 'mongoose';

/**
 * Check if the active MongoDB connection supports multi-document ACID transactions.
 * MongoDB requires a Replica Set or Sharded cluster for transaction support.
 */
export function supportsTransactions() {
  const type = mongoose.connection.client?.topology?.description?.type;
  return type === 'ReplicaSetWithPrimary' || type === 'Sharded';
}

/**
 * Execute an operation within a MongoDB transaction if the connected deployment
 * supports replica set transactions. If running on a standalone MongoDB instance,
 * it safely executes the callback with session = null, allowing atomic conditional
 * operations to protect concurrency.
 *
 * @param {Function} callback - Async function receiving (session)
 * @returns {Promise<*>} Result of the callback
 */
export async function withOptionalTransaction(callback) {
  if (supportsTransactions()) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } else {
    return await callback(null);
  }
}
