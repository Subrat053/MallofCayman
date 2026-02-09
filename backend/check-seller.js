// Script to check seller data in database
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from config/.env
dotenv.config({
  path: path.join(__dirname, 'config', '.env'),
});

// Use hardcoded connection or environment variable
const DB_URL = process.env.DB_URL || process.env.MONGO_URI;

console.log('Connecting to database...');

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const Shop = require('./model/shop');
  
  // Find seller by email
  const seller = await Shop.findOne({ email: '2370463@kiit.ac.in' });
  
  if (seller) {
    console.log('\n=== SELLER DATA ===');
    console.log('ID:', seller._id);
    console.log('Name:', seller.name);
    console.log('Email:', seller.email);
    console.log('Phone:', seller.phoneNumber);
    console.log('Address:', seller.address);
    console.log('Approval Status:', seller.approvalStatus);
    console.log('\n=== TRADE LICENSES ===');
    console.log('Count:', seller.tradeLicenses?.length || 0);
    console.log('Data:', JSON.stringify(seller.tradeLicenses, null, 2));
    console.log('\n=== AVATAR ===');
    console.log('Avatar:', JSON.stringify(seller.avatar, null, 2));
  } else {
    console.log('Seller not found with email: 2370463@kiit.ac.in');
    
    // List all pending sellers
    const pendingSellers = await Shop.find({ approvalStatus: 'pending' });
    console.log('\nPending sellers count:', pendingSellers.length);
    pendingSellers.forEach(s => {
      console.log(`- ${s.name} (${s.email}), tradeLicenses: ${s.tradeLicenses?.length || 0}`);
    });
  }
  
  mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err.message);
  process.exit(1);
});
