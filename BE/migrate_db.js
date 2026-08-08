const mongoose = require('mongoose');

const localUri = 'mongodb://localhost:27017/shop';
const remoteUri = 'mongodb+srv://kimthinhtran175_db_user:5oWVasbZMKyEdjjZ@cluster0.xk3vo6w.mongodb.net/shop';

async function migrate() {
    console.log('Connecting to Local DB...');
    const localConn = await mongoose.createConnection(localUri).asPromise();
    
    console.log('Connecting to Remote DB...');
    const remoteConn = await mongoose.createConnection(remoteUri).asPromise();

    const collections = await localConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);

    for (let col of collections) {
        if (col.name === 'system.indexes' || col.name.startsWith('system.')) continue;
        
        console.log(`Migrating collection: ${col.name}...`);
        
        const localCol = localConn.collection(col.name);
        const remoteCol = remoteConn.collection(col.name);

        const docs = await localCol.find({}).toArray();
        if (docs.length > 0) {
            // Delete existing on remote to avoid duplicates
            await remoteCol.deleteMany({});
            await remoteCol.insertMany(docs);
            console.log(` -> Copied ${docs.length} documents.`);
        } else {
            console.log(` -> Empty collection, skipped.`);
        }
    }

    console.log('Migration completed successfully!');
    await localConn.close();
    await remoteConn.close();
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
