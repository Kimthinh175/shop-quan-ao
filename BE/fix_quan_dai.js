require('dotenv').config();
const connectDB = require('./src/core/config/db');
const Category = require('./src/modules/catalog/models/Category.model');

const fixImage = async () => {
  await connectDB();
  
  const cat = await Category.findOne({ name: 'Quần Dài' });
  if (cat) {
    cat.image = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60';
    await cat.save();
    console.log('Fixed Quần Dài image!');
  } else {
    console.log('Category not found');
  }

  process.exit(0);
};

fixImage();
