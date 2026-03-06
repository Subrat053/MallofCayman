const axios = require('axios');

// Hardcode credentials for testing
const PAYPAL_CLIENT_ID = 'AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA';
const PAYPAL_SECRET = 'EH0vP4NgiaX9xhw8LDoZJaPkh6sw1lostSYjeQJQxjegPWyHlCYLQxlONQ11B03W3SrxzvKB6pD-gsdI';
const PAYPAL_API_URL = 'https://api-m.paypal.com';

/**
 * Test PayPal Payout Configuration
 * This script will help diagnose why payouts aren't working
 */

async function testPayPalSetup() {
  console.log('\n🔍 PAYPAL PAYOUT DIAGNOSTIC TEST\n');
  console.log('='.repeat(60));

  // Step 1: Check environment variables
  console.log('\n1️⃣ Checking Environment Variables...');
  console.log('-'.repeat(60));
  
  const clientId = PAYPAL_CLIENT_ID;
  const secret = PAYPAL_SECRET;
  const apiUrl = PAYPAL_API_URL;

  if (!clientId || !secret) {
    console.error('❌ MISSING CREDENTIALS!');
    console.error('   PayPal Client ID or Secret not found in .env file');
    return;
  }

  console.log('✅ Client ID:', clientId.substring(0, 20) + '...');
  console.log('✅ Secret:', secret.substring(0, 10) + '...');
  console.log('✅ API URL:', apiUrl);

  // Step 2: Test Authentication
  console.log('\n2️⃣ Testing PayPal Authentication...');
  console.log('-'.repeat(60));

  try {
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    const authResponse = await axios.post(
      `${apiUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ Authentication Successful!');
    console.log('   Access Token:', authResponse.data.access_token.substring(0, 30) + '...');
    console.log('   Token Type:', authResponse.data.token_type);
    console.log('   Expires In:', authResponse.data.expires_in, 'seconds');

    const accessToken = authResponse.data.access_token;

    // Step 3: Check Account Permissions
    console.log('\n3️⃣ Checking PayPal Account Permissions...');
    console.log('-'.repeat(60));

    try {
      // Try to get account information
      const accountResponse = await axios.get(
        `${apiUrl}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Account Info Retrieved:');
      console.log('   Account ID:', accountResponse.data.user_id || 'N/A');
      console.log('   Email:', accountResponse.data.emails?.[0]?.value || 'N/A');
      console.log('   Verified:', accountResponse.data.verified_account || 'N/A');
    } catch (error) {
      console.log('⚠️  Could not retrieve account info (this is optional)');
    }

    // Step 4: Test Payout Creation (Small amount)
    console.log('\n4️⃣ Testing Payout Creation...');
    console.log('-'.repeat(60));
    console.log('⚠️  IMPORTANT: This will attempt a REAL payout!');
    console.log('   Attempting to send $0.01 to test email...\n');

    const testEmail = 'sb-buyer@test.com'; // Replace with your test email
    const senderBatchId = `test_${Date.now()}`;

    const payoutRequest = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'Test Payout from Mall of Cayman',
        email_message: 'This is a test payout',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: '0.01',
            currency: 'USD',
          },
          note: 'Test payout',
          sender_item_id: 'test_001',
          receiver: testEmail,
        },
      ],
    };

    try {
      const payoutResponse = await axios.post(
        `${apiUrl}/v1/payments/payouts`,
        payoutRequest,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ PAYOUT CREATED SUCCESSFULLY!');
      console.log('   Batch ID:', payoutResponse.data.batch_header.payout_batch_id);
      console.log('   Batch Status:', payoutResponse.data.batch_header.batch_status);
      console.log('   Amount:', payoutResponse.data.batch_header.amount?.value, payoutResponse.data.batch_header.amount?.currency);
      console.log('\n   🎉 YOUR PAYPAL ACCOUNT IS CONFIGURED CORRECTLY!');
      console.log('   💰 Money should reach the recipient within minutes');

    } catch (payoutError) {
      console.error('\n❌ PAYOUT FAILED!');
      console.error('   Status:', payoutError.response?.status);
      console.error('   Error Name:', payoutError.response?.data?.name);
      console.error('   Error Message:', payoutError.response?.data?.message);
      
      if (payoutError.response?.data?.details) {
        console.error('\n   📋 Error Details:');
        payoutError.response.data.details.forEach((detail, index) => {
          console.error(`      ${index + 1}. ${detail.issue}: ${detail.description}`);
        });
      }

      // Common issues
      console.log('\n💡 COMMON ISSUES & SOLUTIONS:');
      console.log('-'.repeat(60));
      
      if (payoutError.response?.data?.name === 'INSUFFICIENT_FUNDS') {
        console.log('❌ Issue: Insufficient balance in PayPal account');
        console.log('✅ Solution: Add money to your PayPal business account');
      } else if (payoutError.response?.data?.name === 'PERMISSION_DENIED' || 
                 payoutError.response?.data?.message?.includes('not permitted')) {
        console.log('❌ Issue: Payouts API not enabled for your account');
        console.log('✅ Solution:');
        console.log('   1. Log in to PayPal Developer Dashboard');
        console.log('   2. Go to your app settings');
        console.log('   3. Enable "Payouts" feature');
        console.log('   4. Submit for PayPal approval (may take 1-2 days)');
        console.log('   5. OR apply at: https://www.paypal.com/us/webapps/mpp/merchant-fees');
      } else if (payoutError.response?.data?.name === 'RECEIVER_UNREGISTERED') {
        console.log('❌ Issue: Recipient email not registered with PayPal');
        console.log('✅ Solution: Recipient will receive email to claim payment');
      } else {
        console.log('❌ Unknown error - see details above');
        console.log('✅ Check PayPal dashboard for more information');
      }

      console.log('\n📚 More Help:');
      console.log('   - PayPal Payouts Guide: https://developer.paypal.com/docs/payouts/');
      console.log('   - Check Account Status: https://www.paypal.com/merchantapps/');
    }

  } catch (authError) {
    console.error('\n❌ AUTHENTICATION FAILED!');
    console.error('   Status:', authError.response?.status);
    console.error('   Error:', authError.response?.data?.error);
    console.error('   Description:', authError.response?.data?.error_description);
    console.log('\n✅ Solution:');
    console.log('   1. Verify your Client ID and Secret are correct');
    console.log('   2. Make sure they are from LIVE credentials, not sandbox');
    console.log('   3. Check https://www.paypal.com/businessmanage/credentials/apiAccess');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Complete!\n');
}

// Run the test
testPayPalSetup().catch(error => {
  console.error('\n💥 Unexpected Error:', error.message);
  console.error('Stack:', error.stack);
});
