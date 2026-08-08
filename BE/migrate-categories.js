require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB:', process.env.MONGODB_URI);

  const db = mongoose.connection.db;
  
  // Create Root Categories
  const rootCats = [
    { _id: 100, name: 'Áo', parent_id: null, createdAt: new Date(), updatedAt: new Date() },
    { _id: 101, name: 'Quần', parent_id: null, createdAt: new Date(), updatedAt: new Date() }
  ];

  for (const cat of rootCats) {
    await db.collection('categories').updateOne(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true }
    );
  }

  // Get IDs of root cats
  const ao = await db.collection('categories').findOne({ name: 'Áo' });
  const quan = await db.collection('categories').findOne({ name: 'Quần' });

  // Update children
  await db.collection('categories').updateMany(
    { name: { $in: ['Áo Thun', 'Áo Khoác'] } },
    { $set: { parent_id: ao._id } }
  );

  await db.collection('categories').updateMany(
    { name: { $in: ['Quần Short', 'Quần Dài'] } },
    { $set: { parent_id: quan._id } }
  );

  // Leave Đồ Lót as parent_id = null
  await db.collection('categories').updateOne(
    { name: 'Đồ Lót' },
    { $set: { parent_id: null } }
  );

  console.log('Categories migrated to hierarchy successfully!');
  process.exit(0);
}

run().catch(console.error);
