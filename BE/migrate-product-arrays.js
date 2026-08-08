require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB:', process.env.MONGODB_URI);

  const db = mongoose.connection.db;
  const products = await db.collection('products').find({}).toArray();

  let count = 0;
  for (const p of products) {
    const updateFields = {};

    const fieldsToConvert = [
      'category_id', 'season_id', 'gender_id', 
      'sport_id', 'material_id', 'form_id'
    ];

    for (const field of fieldsToConvert) {
      if (p[field] !== undefined && p[field] !== null && !Array.isArray(p[field])) {
        updateFields[field] = [p[field]];
      }
    }

    if (Object.keys(updateFields).length > 0) {
      await db.collection('products').updateOne({ _id: p._id }, { $set: updateFields });
      count++;
    }
  }

  console.log(`Migrated ${count} products.`);
  process.exit(0);
}

run().catch(console.error);
