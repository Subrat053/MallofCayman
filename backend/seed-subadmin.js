const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./db/Database");
const User = require("./model/user");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "config", ".env"),
});

// SubAdmin user configuration
const subAdminUser = {
  name: "SubAdmin User",
  email: "subadmin@mallofcayman.com",
  password: "SubAdmin@123",
  role: "SubAdmin",
  phoneNumber: 9876543212,
  addresses: [
    {
      addressType: "Office",
      address1: "SubAdmin Office, Building A",
      address2: "Tech Park",
      zipCode: 560001,
      city: "Bangalore",
      country: "India"
    }
  ],
  avatar: {
    url: "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
    public_id: "avatar_gfxgav"
  }
  // Don't set permissions - uses role-based defaults from rolePermissions.js
};

const seedSubAdmin = async () => {
  try {
    console.log("=".repeat(60));
    console.log("🔧 SUBADMIN ACCOUNT SEED SCRIPT");
    console.log("=".repeat(60));
    
    console.log("\n🔗 Connecting to database...");
    await connectDatabase();
    console.log("✅ Database connected successfully\n");

    console.log(`📝 Processing SubAdmin: ${subAdminUser.email}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: subAdminUser.email });

    if (existingUser) {
      console.log(`⚠️  User already exists with email: ${subAdminUser.email}`);
      console.log(`   Current role: ${existingUser.role}`);
      
      // Update existing user to SubAdmin role
      existingUser.name = subAdminUser.name;
      existingUser.role = subAdminUser.role;
      existingUser.phoneNumber = subAdminUser.phoneNumber;
      existingUser.addresses = subAdminUser.addresses;
      existingUser.avatar = subAdminUser.avatar;
      // Remove all custom permissions to use role-based defaults
      existingUser.permissions = undefined;
      
      await existingUser.save();
      console.log(`✅ Updated existing user to SubAdmin role`);
    } else {
      // Create new SubAdmin user
      const newUser = await User.create(subAdminUser);
      console.log(`✅ Created new SubAdmin account`);
      console.log(`   ID: ${newUser._id}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ SUBADMIN SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    
    console.log("\n📋 SubAdmin Login Credentials:");
    console.log("─".repeat(40));
    console.log("   Email:    subadmin@mallofcayman.com");
    console.log("   Password: SubAdmin@123");
    console.log("─".repeat(40));
    
    console.log("\n🔑 SubAdmin Permissions (Role-Based Defaults):");
    console.log("─".repeat(40));
    console.log("   ✅ canApproveVendors    - Approve/reject seller applications");
    console.log("   ✅ canApproveProducts   - Approve/reject product listings");
    console.log("   ✅ canApproveAds        - Approve/reject advertisements");
    console.log("   ✅ canModerateReviews   - Moderate customer reviews");
    console.log("   ✅ canViewAnalytics     - View analytics & reports");
    console.log("   ❌ canManageOrders      - NO order management");
    console.log("   ❌ canManageProducts    - NO product management");
    console.log("   ❌ canManageCoupons     - NO coupon management");
    console.log("   ❌ canManageCategories  - NO category management");
    console.log("   ❌ canManageUsers       - NO user management");
    console.log("   ❌ canManageVendors     - NO vendor management");
    console.log("   ❌ canManageContent     - NO content management");
    console.log("   ❌ canAccessSetup       - NO access to setup/configuration");
    console.log("─".repeat(40));
    
    console.log("\n📌 SubAdmin Menu Access:");
    console.log("   • Dashboard");
    console.log("   • Pending Sellers (approve/reject)");
    console.log("   • Pending Products (approve/reject)");
    console.log("   • Pending Video Banners (approve/reject)");
    console.log("   • Review Management (moderate)");
    console.log("   • Ad Pre-Approval (approve/reject ads)");
    console.log("   • Analytics (view only)");
    
    console.log("\n🚫 SubAdmin CANNOT Access:");
    console.log("   • All Sellers (full management)");
    console.log("   • All Orders");
    console.log("   • All Products (full management)");
    console.log("   • Categories");
    console.log("   • All Users");
    console.log("   • Home Banner");
    console.log("   • All Video Banners (full management)");
    console.log("   • Legal Pages");
    console.log("   • FAQ Management");
    console.log("   • Withdraw Requests");
    console.log("   • Site Settings");
    console.log("   • Plan Management");
    console.log("   • Subscription Management");
    console.log("   • Admin Staff Management");
    console.log("   • Ad Plan Management");
    
    console.log("\n💡 SubAdmin Role Purpose:");
    console.log("   The SubAdmin role is designed for team members who");
    console.log("   handle approvals and moderation tasks without having");
    console.log("   access to operational management or system settings.");
    
    console.log("\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding SubAdmin:");
    console.error(error);
    process.exit(1);
  }
};

// Run the seed function
seedSubAdmin();
