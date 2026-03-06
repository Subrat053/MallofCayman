const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/config/.env' });

// Connect to database
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    testOrderNumbering();
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

const Order = require('./backend/model/order');

async function testOrderNumbering() {
  try {
    console.log('\n🧪 Testing Order Numbering System...');
    
    // Get current order count
    const currentCount = await Order.countDocuments();
    console.log(`📊 Current orders in database: ${currentCount}`);
    
    // Create a test order
    const testOrder = new Order({
      cart: [{ name: 'Test Product', qty: 1, discountPrice: 100 }],
      shippingAddress: { city: 'Test City', address1: 'Test Address' },
      user: { name: 'Test User', email: 'test@test.com', _id: 'testuser123' },
      totalPrice: 100,
      paymentInfo: { type: 'Test Payment' }
    });
    
    await testOrder.save();
    
    console.log(`✅ Test order created successfully!`);
    console.log(`📝 Order ID: ${testOrder._id}`);
    console.log(`🔢 Order Number: ${testOrder.orderNumber}`);
    console.log(`📅 Created At: ${testOrder.createdAt}`);
    
    // Verify format
    if (testOrder.orderNumber && testOrder.orderNumber.startsWith('mallofcayman-')) {
      console.log('✅ Order number format is correct!');
      
      // Extract the numeric part
      const numericPart = testOrder.orderNumber.split('-')[1];
      const expectedNumber = String(currentCount + 1).padStart(5, '0');
      
      if (numericPart === expectedNumber) {
        console.log('✅ Order numbering sequence is correct!');
      } else {
        console.log(`❌ Expected: mallofcayman-${expectedNumber}, Got: ${testOrder.orderNumber}`);
      }
    } else {
      console.log('❌ Order number format is incorrect!');
    }
    
    // Clean up test order (optional - comment out if you want to keep it)
    await Order.findByIdAndDelete(testOrder._id);
    console.log('🧹 Test order cleaned up');
    
    console.log('\n🎉 Order numbering test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}