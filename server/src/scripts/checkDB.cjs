require('dotenv').config({path: '.env'});
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const places = await mongoose.connection.db.collection('places').countDocuments();
  const services = await mongoose.connection.db.collection('publicservices').countDocuments();
  
  console.log('Places:', places);
  console.log('Services:', services);
  
  const byCat = await mongoose.connection.db.collection('publicservices').aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]).toArray();
  
  console.log('Service Categories:', byCat);
  process.exit(0);
}

run().catch(console.error);
