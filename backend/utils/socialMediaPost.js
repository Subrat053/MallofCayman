const axios = require("axios");

/**
 * Social Media Auto-Posting Utility
 * Posts product announcements to Facebook and Instagram when products are approved
 * 
 * Mall of Cayman Social Media:
 * - Instagram: https://www.instagram.com/mallofcayman/
 * - Facebook: https://www.facebook.com/profile.php?id=61586438575556
 */

// Facebook/Instagram Graph API Configuration
const FACEBOOK_PAGE_ID = "61586438575556"; // Mall of Cayman Facebook Page ID
const FACEBOOK_PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN || "EAAiptZC49JygBQtVGIAZAjmFlQYKSuzWHZBdYRUToJspt0jGB8dvKuOWzYsAgLPbwmtZArCCu1ZBV4Yofl2BOMtg7T2pdh9urLwlUXDFhqb6choYB6LMQqUicSQbiSEKJlUDiRKBKNcjKzdWtBRPEi9MxSb0CRuEatFpi427S95rmMYObZC7CTlDPTDeikvES4ZB2tZCZAWMHKMjX8cnCS139SYZC9m8gmAXXgo9CG";
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID; // Will be fetched from Facebook Page

// Website URL for product links
const WEBSITE_URL = process.env.FRONTEND_URL || "https://mallofcayman.com";

/**
 * Post a new product announcement to Facebook
 * @param {Object} product - The product object
 * @param {Object} shop - The shop/seller object
 * @returns {Promise<Object>} - Facebook API response
 */
const postToFacebook = async (product, shop) => {
  try {
    const productUrl = `${WEBSITE_URL}/product/${product._id}`;
    const shopUrl = `${WEBSITE_URL}/shop/preview/${shop._id}`;
    
    // Format price
    const price = product.discountPrice || product.originalPrice;
    const formattedPrice = `$${price.toFixed(2)}`;
    
    // Create engaging post message
    const message = `🛍️ NEW ARRIVAL at Mall of Cayman! 🎉

✨ ${product.name}

💰 Price: ${formattedPrice}
🏪 Shop: ${shop.name}

${product.description ? product.description.substring(0, 200) + (product.description.length > 200 ? '...' : '') : ''}

🔗 Shop Now: ${productUrl}
🏬 Visit Store: ${shopUrl}

#MallOfCayman #CaymanIslands #Shopping #NewArrival #${shop.name.replace(/\s+/g, '')}`;

    // If product has an image, post with image
    if (product.images && product.images.length > 0 && product.images[0].url) {
      const photoUrl = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/photos`;
      
      const response = await axios.post(photoUrl, {
        url: product.images[0].url,
        caption: message,
        access_token: FACEBOOK_PAGE_TOKEN
      });
      
      console.log(`✅ Facebook photo post created for product: ${product.name}`);
      return { success: true, platform: 'facebook', postId: response.data.id, type: 'photo' };
    } else {
      // Text-only post
      const feedUrl = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/feed`;
      
      const response = await axios.post(feedUrl, {
        message: message,
        link: productUrl,
        access_token: FACEBOOK_PAGE_TOKEN
      });
      
      console.log(`✅ Facebook text post created for product: ${product.name}`);
      return { success: true, platform: 'facebook', postId: response.data.id, type: 'text' };
    }
  } catch (error) {
    console.error(`❌ Facebook post failed for product ${product.name}:`, error.response?.data || error.message);
    return { success: false, platform: 'facebook', error: error.response?.data?.error?.message || error.message };
  }
};

/**
 * Get Instagram Business Account ID from Facebook Page
 * @returns {Promise<string|null>} - Instagram Business Account ID
 */
const getInstagramAccountId = async () => {
  try {
    const url = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}?fields=instagram_business_account&access_token=${FACEBOOK_PAGE_TOKEN}`;
    const response = await axios.get(url);
    
    if (response.data.instagram_business_account) {
      return response.data.instagram_business_account.id;
    }
    return null;
  } catch (error) {
    console.error("❌ Failed to get Instagram Business Account ID:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Post a new product announcement to Instagram
 * Note: Instagram Graph API requires images to be publicly accessible URLs
 * @param {Object} product - The product object
 * @param {Object} shop - The shop/seller object
 * @returns {Promise<Object>} - Instagram API response
 */
const postToInstagram = async (product, shop) => {
  try {
    // Instagram requires an image
    if (!product.images || product.images.length === 0 || !product.images[0].url) {
      console.log(`⚠️ Instagram post skipped for ${product.name}: No image available`);
      return { success: false, platform: 'instagram', error: 'No image available for Instagram post' };
    }

    // Get Instagram Business Account ID
    const instagramAccountId = INSTAGRAM_BUSINESS_ACCOUNT_ID || await getInstagramAccountId();
    
    if (!instagramAccountId) {
      console.log(`⚠️ Instagram post skipped: No Instagram Business Account linked to Facebook Page`);
      return { success: false, platform: 'instagram', error: 'No Instagram Business Account linked' };
    }

    const productUrl = `${WEBSITE_URL}/product/${product._id}`;
    
    // Format price
    const price = product.discountPrice || product.originalPrice;
    const formattedPrice = `$${price.toFixed(2)}`;
    
    // Create engaging Instagram caption (2200 char limit)
    const caption = `🛍️ NEW ARRIVAL! 🎉

✨ ${product.name}

💰 ${formattedPrice}
🏪 ${shop.name}

${product.description ? product.description.substring(0, 300) + (product.description.length > 300 ? '...' : '') : ''}

🔗 Link in bio or visit mallofcayman.com

#MallOfCayman #CaymanIslands #Shopping #NewArrival #CaymanShopping #GrandCayman #ShopLocal #OnlineShopping #${shop.name.replace(/\s+/g, '')}`;

    // Step 1: Create media container
    const createMediaUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media`;
    
    const mediaResponse = await axios.post(createMediaUrl, {
      image_url: product.images[0].url,
      caption: caption,
      access_token: FACEBOOK_PAGE_TOKEN
    });
    
    const containerId = mediaResponse.data.id;
    
    // Step 2: Publish the media container
    const publishUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`;
    
    const publishResponse = await axios.post(publishUrl, {
      creation_id: containerId,
      access_token: FACEBOOK_PAGE_TOKEN
    });
    
    console.log(`✅ Instagram post created for product: ${product.name}`);
    return { success: true, platform: 'instagram', postId: publishResponse.data.id };
  } catch (error) {
    console.error(`❌ Instagram post failed for product ${product.name}:`, error.response?.data || error.message);
    return { success: false, platform: 'instagram', error: error.response?.data?.error?.message || error.message };
  }
};

/**
 * Post product to both Facebook and Instagram
 * @param {Object} product - The product object (must include images array)
 * @param {Object} shop - The shop/seller object
 * @returns {Promise<Object>} - Combined results from both platforms
 */
const postProductToSocialMedia = async (product, shop) => {
  console.log(`\n📱 Starting social media posts for product: ${product.name}`);
  
  const results = {
    facebook: null,
    instagram: null,
    timestamp: new Date(),
    productId: product._id,
    productName: product.name,
  };

  // Post to Facebook
  try {
    results.facebook = await postToFacebook(product, shop);
  } catch (error) {
    results.facebook = { success: false, platform: 'facebook', error: error.message };
  }

  // Post to Instagram
  try {
    results.instagram = await postToInstagram(product, shop);
  } catch (error) {
    results.instagram = { success: false, platform: 'instagram', error: error.message };
  }

  // Log summary
  const fbStatus = results.facebook?.success ? '✅' : '❌';
  const igStatus = results.instagram?.success ? '✅' : '❌';
  console.log(`\n📊 Social Media Post Summary for "${product.name}":`);
  console.log(`   ${fbStatus} Facebook: ${results.facebook?.success ? 'Posted' : results.facebook?.error}`);
  console.log(`   ${igStatus} Instagram: ${results.instagram?.success ? 'Posted' : results.instagram?.error}`);

  return results;
};

/**
 * Post seller/shop approval announcement
 * @param {Object} shop - The approved shop object
 * @returns {Promise<Object>} - Combined results
 */
const postShopApprovalToSocialMedia = async (shop) => {
  console.log(`\n📱 Posting shop approval for: ${shop.name}`);
  
  const shopUrl = `${WEBSITE_URL}/shop/preview/${shop._id}`;
  
  const message = `🎉 Welcome to the Mall of Cayman Family! 🏪

We're excited to announce that "${shop.name}" has joined our marketplace!

${shop.description ? shop.description.substring(0, 200) + (shop.description.length > 200 ? '...' : '') : ''}

🔗 Visit their store: ${shopUrl}

#MallOfCayman #NewSeller #WelcomeAboard #CaymanIslands #Shopping #${shop.name.replace(/\s+/g, '')}`;

  const results = { facebook: null, instagram: null };

  try {
    // Post to Facebook
    if (shop.avatar?.url) {
      const photoUrl = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/photos`;
      const response = await axios.post(photoUrl, {
        url: shop.avatar.url,
        caption: message,
        access_token: FACEBOOK_PAGE_TOKEN
      });
      results.facebook = { success: true, postId: response.data.id };
    } else {
      const feedUrl = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/feed`;
      const response = await axios.post(feedUrl, {
        message: message,
        link: shopUrl,
        access_token: FACEBOOK_PAGE_TOKEN
      });
      results.facebook = { success: true, postId: response.data.id };
    }
    console.log(`✅ Facebook: Shop approval posted for ${shop.name}`);
  } catch (error) {
    console.error(`❌ Facebook shop approval post failed:`, error.response?.data || error.message);
    results.facebook = { success: false, error: error.response?.data?.error?.message || error.message };
  }

  return results;
};

module.exports = {
  postToFacebook,
  postToInstagram,
  postProductToSocialMedia,
  postShopApprovalToSocialMedia,
  getInstagramAccountId,
};
