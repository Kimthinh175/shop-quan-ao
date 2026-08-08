const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
  await mongoose.connect('mongodb://localhost:27017/shop');
  const db = mongoose.connection;
  const coll = db.collection('users'); // Let's check users collection again
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);
  
  // Update the user to have username field
  await coll.updateOne(
    { $or: [{ phone: '0999999999' }, { username: '0999999999' }] }, 
    { $set: { username: '0999999999', phone: '0999999999', password: hashedPassword, role: 'admin', is_admin: 1 } },
    { upsert: true }
  );
  
  console.log("Fixed admin account.");
  process.exit(0);
}

fixAdmin().catch(console.error);
