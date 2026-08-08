const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  await mongoose.connect('mongodb://localhost:27017/shop');
  
  const db = mongoose.connection;
  const usersCollection = db.collection('user_accounts'); // usually it's user_accounts or users
  
  // Actually, wait, let's try 'users' first, or check the existing collections
  const collections = await db.db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  console.log("Available collections:", collectionNames);
  
  let targetCollection = collectionNames.includes('user_accounts') ? 'user_accounts' : 'users';
  if (!collectionNames.includes(targetCollection)) {
    console.log("No user collection found.");
  }
  
  const coll = db.collection(targetCollection);
  
  // Check if admin already exists (phone 0999999999)
  let adminUser = await coll.findOne({ phone: '0999999999' });
  
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    await coll.insertOne({
      name: 'Super Admin',
      phone: '0999999999',
      password: hashedPassword,
      role: 'admin', // FE looks for role: 'admin' or role: 0
      is_admin: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Created new admin account:");
  } else {
    // Force update password to 123456 and role to admin just in case
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    await coll.updateOne({ phone: '0999999999' }, { $set: { password: hashedPassword, role: 'admin', is_admin: 1 } });
    console.log("Updated existing admin account:");
  }
  
  console.log("Phone: 0999999999");
  console.log("Password: 123456");
  
  process.exit(0);
}

seedAdmin().catch(console.error);
