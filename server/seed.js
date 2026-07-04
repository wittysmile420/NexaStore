const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const DUMMY_JSON_URL = 'https://dummyjson.com/products?limit=0';

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed Users
    console.log('\n👤 Seeding users...');
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      await User.create([
        {
          username: 'admin',
          email: 'admin@nexastore.com',
          password: 'admin123',
          role: 'admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        },
        {
          username: 'user',
          email: 'user@nexastore.com',
          password: 'user123',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        },
      ]);
      console.log('✅ Created admin (admin/admin123) and user (user/user123)');
    } else {
      console.log(`ℹ️  ${existingUsers} users already exist, skipping`);
    }

    // Seed Products
    console.log('\n📦 Seeding products...');
    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
      console.log('🌐 Fetching products from DummyJSON API...');
      const response = await fetch(DUMMY_JSON_URL);
      const data = await response.json();

      const products = data.products.map((p) => ({
        productId: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        discountPercentage: p.discountPercentage,
        rating: p.rating,
        stock: p.stock,
        tags: p.tags,
        brand: p.brand || 'Unknown',
        sku: p.sku,
        weight: p.weight,
        dimensions: p.dimensions,
        warrantyInformation: p.warrantyInformation,
        shippingInformation: p.shippingInformation,
        availabilityStatus: p.availabilityStatus,
        reviews: p.reviews,
        returnPolicy: p.returnPolicy,
        minimumOrderQuantity: p.minimumOrderQuantity,
        images: p.images,
        thumbnail: p.thumbnail,
        isPublished: true,
      }));

      await Product.insertMany(products);
      console.log(`✅ Inserted ${products.length} products`);
    } else {
      console.log(`ℹ️  ${existingProducts} products already exist, skipping`);
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
