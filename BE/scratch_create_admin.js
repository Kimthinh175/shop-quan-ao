const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await mongoose.connect('mongodb://localhost:27017/shop');
  const db = mongoose.connection;
  const coll = db.collection('admins'); 
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);
  
  await coll.updateOne(
    { username: 'admin' }, 
    { $set: { 
        username: 'admin', 
        password: hashedPassword, 
        role: 0, // usually 0 or 'admin'
        fullName: 'Super Admin',
        email: 'admin@closet.com',
        status: 1
      } 
    },
    { upsert: true }
  );
  
  console.log("Created real admin account in admins collection.");
  process.exit(0);
}

createAdmin().catch(console.error);
