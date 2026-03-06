// Simple test to verify order numbering system
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/config/.env' });

// Connect to database
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Order = require('./backend/model/order');

const testOrderNumbers = async () => {
  try {
    console.log('🔍 Testing order numbering system...\n');
    
    // Get some recent orders to see the current state
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('📋 Recent Orders:');
    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id}`);
      console.log(`   Order Number: ${order.orderNumber || 'NOT SET'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${order.createdAt.toISOString().split('T')[0]}`);
      console.log('   ---');
    });
    
    // Test the helper function
    const { getOrderNumber } = require('./backend/controller/order');
    console.log('\n🧪 Testing Helper Function:');
    recentOrders.forEach((order, index) => {
      const displayNumber = getOrderNumber(order);
      console.log(`${index + 1}. Display Number: ${displayNumber}`);
    });
    
    console.log('\n✅ Order numbering system test completed!');
    console.log('\nNext orders will have sequential numbers like: mallofcayman-00001, mallofcayman-00002, etc.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

testOrderNumbers();