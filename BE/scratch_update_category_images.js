require('dotenv').config();
const connectDB = require('./src/core/config/db');
const Category = require('./src/modules/catalog/models/Category.model');

const imagesMap = {
  'Áo Thun': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60',
  'Áo Khoác': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60',
  'Quần Short': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=60',
  'Quần Dài': 'https://images.unsplash.com/photo-1624378439575-d1ead6bb19f8?w=500&auto=format&fit=crop&q=60',
  'Đồ Lót': 'https://images.unsplash.com/photo-1618354691438-25af61086434?w=500&auto=format&fit=crop&q=60',
  'Áo': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60',
  'Quần': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60'
};

const updateImages = async () => {
  await connectDB();
  const categories = await Category.find();

  for (const cat of categories) {
    if (imagesMap[cat.name]) {
      cat.image = imagesMap[cat.name];
      await cat.save();
      console.log(`Updated ${cat.name} with image.`);
    }
  }

  console.log('Update complete!');
  process.exit(0);
};

updateImages();
