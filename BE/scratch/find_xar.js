const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shop')
  .then(async () => {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (let col of collections) {
      const docs = await db.collection(col.name).find({
        $or: [
          { color: /Xar/i },
          { size: /Xar/i },
          { name: /Xar/i }
        ]
      }).toArray();
      if (docs.length > 0) {
        console.log(`Collection: ${col.name}`);
        console.log(docs);
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
