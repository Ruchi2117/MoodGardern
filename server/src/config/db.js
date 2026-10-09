import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) throw new Error('Set MONGODB_URI in server/.env before starting the API.');
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}
