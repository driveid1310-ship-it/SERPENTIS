import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env' });

async function run(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Failed to access database instance.');
    process.exit(1);
  }

  const places = await db.collection('places').countDocuments();
  const services = await db.collection('publicservices').countDocuments();

  console.log('Places count:', places);
  console.log('Services count:', services);

  const byCat = await db.collection('publicservices').aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]).toArray();

  console.log('Public Service Categories:', byCat);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('checkDB error:', err);
  process.exit(1);
});

