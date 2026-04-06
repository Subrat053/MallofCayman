# Admin Endpoints Documentation

## Summary

This document lists all endpoints protected by **`isAdmin()`** and **`requirePermission()`** middleware in the Mall of Cayman backend, with "admin" in the endpoint path.

**Total Endpoints Found: 75+**

---

## USER MANAGEMENT (user.js)

### 1. Get All Users

- **Path:** `/api/v2/user/admin-all-users`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin()`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "users": [
      {
        "_id": "...",
        "name": "...",
        "email": "...",
        "role": "...",
        ...
      }
    ]
  }
  ```
- **Description:** Retrieves all users in the system with complete details

---

### 2. Delete User

- **Path:** `/api/v2/user/delete-user/:id`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageUsers')`
- **Parameters:** `id` (user ID in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "User deleted successfully!"
  }
  ```
- **Description:** Permanently deletes a user account from the system

---

### 3. Create User by Admin

- **Path:** `/api/v2/user/create-user-by-admin`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`, `upload.single("file")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "email": "string (required, unique)",
    "password": "string (required)",
    "role": "string (required - 'user', 'Admin', 'Supplier')",
    "file": "optional - avatar image"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "user": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "role": "...",
      "avatar": {
        "url": "...",
        "public_id": "..."
      }
    }
  }
  ```
- **Description:** Admin creates a new user account with optional avatar upload

---

### 4. Create User for Seller

- **Path:** `/api/v2/user/create-user-for-seller`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "email": "string (required)",
    "role": "string (required)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "...",
    "user": {...}
  }
  ```
- **Description:** Creates a user account linked to an existing seller shop

---

### 5. Change User Role

- **Path:** `/api/v2/user/change-user-role/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (user ID in URL)
- **Request Body:**
  ```json
  {
    "role": "string (required - 'User', 'Admin', 'Supplier')"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "user": {...},
    "message": "Role updated successfully"
  }
  ```
- **Description:** Changes a user's role. Automatically creates a shop when promoting to Supplier

---

### 6. Force Create Shop

- **Path:** `/api/v2/user/force-create-shop/:email`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `email` (shop email in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "shop": {...}
  }
  ```
- **Description:** Admin force-creates a shop for a given email address

---

### 7. Get All Admin Users

- **Path:** `/api/v2/user/admin-all-admins`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "adminUsers": [
      {
        "_id": "...",
        "name": "...",
        "email": "...",
        "role": "Admin|SubAdmin|Manager"
      }
    ]
  }
  ```
- **Description:** Lists all admin, subadmin, and manager accounts

---

### 8. Create Admin User

- **Path:** `/api/v2/user/create-admin-user`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "email": "string (required)",
    "password": "string (required)",
    "role": "string (required)",
    "customPermissions": "object (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "user": {...}
  }
  ```
- **Description:** Creates a new admin, subadmin, or manager account with custom permissions

---

### 9. Update Admin Permissions

- **Path:** `/api/v2/user/update-admin-permissions/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (admin user ID in URL)
- **Request Body:**
  ```json
  {
    "role": "string",
    "permissions": "object with permission flags"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "user": {...}
  }
  ```
- **Description:** Updates admin user permissions and role

---

### 10. Delete Admin User

- **Path:** `/api/v2/user/delete-admin-user/:id`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (admin user ID in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Admin user deleted successfully"
  }
  ```
- **Description:** Removes an admin, subadmin, or manager account

---

### 11. Check User Details

- **Path:** `/api/v2/user/check-user/:id`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageUsers')`
- **Parameters:** `id` (user ID in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "user": {...},
    "shop": {...}
  }
  ```
- **Description:** Retrieves detailed user and associated shop information

---

## COMMISSION MANAGEMENT (commission.js)

### 12. Get All Commissions

- **Path:** `/api/v2/commission/admin/all-commissions`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:**
  - `page` (query: default 1)
  - `limit` (query: default 50)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "commissions": [{...}],
    "totalCommissions": 150,
    "totalPages": 3,
    "currentPage": 1,
    "platformStats": {
      "totalPlatformRevenue": 5000,
      "totalVendorPayouts": 4000,
      "totalSales": 9000
    }
  }
  ```
- **Description:** Lists all commission records with platform revenue statistics

---

### 13. Mark Commission Payment as Paid

- **Path:** `/api/v2/commission/admin/mark-payment-paid/:commissionId`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `commissionId` (commission ID in URL)
- **Request Body:**
  ```json
  {
    "vendorPayoutId": "string (payout transaction ID)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Payment marked as paid",
    "commission": {...}
  }
  ```
- **Description:** Marks a vendor commission payment as completed

---

## PRODUCT MANAGEMENT (product.js)

### 14. Admin Create Product

- **Path:** `/api/v2/product/admin-create-product`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `requirePermission("canManageProducts")`, `uploadFields`
- **Parameters:** None (multipart form data)
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "description": "string",
    "category": "string (category ID)",
    "originalPrice": "number",
    "discountPrice": "number",
    "stock": "number",
    "attributes": "JSON string or object",
    "isSellerProduct": "boolean (default false)",
    "sellerShop": "string (seller shop ID, optional)",
    "images": "file array (max 5)",
    "videos": "file array"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "product": {...},
    "message": "Product created successfully!"
  }
  ```
- **Description:** Admin creates and publishes products directly, optionally assigning to sellers

---

### 15. Get Pending Products for Approval

- **Path:** `/api/v2/product/admin/pending-products`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission("canApproveProducts")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "products": [{...}]
  }
  ```
- **Description:** Lists all seller products awaiting admin approval

---

### 16. Admin Cleanup Orphaned Products

- **Path:** `/api/v2/product/admin-cleanup-orphaned-products`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Cleanup completed",
    "removed": 10,
    "updated": 5
  }
  ```
- **Description:** Removes products belonging to deleted shops and fixes ownership

---

### 17. Admin Fix Product Ownership

- **Path:** `/api/v2/product/admin-fix-product-ownership`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Product ownership fixed",
    "updated": {...}
  }
  ```
- **Description:** Repairs product shop references and ownership mappings

---

## SHOP/VENDOR MANAGEMENT (shop.js)

### 18. Delete Seller/Vendor

- **Path:** `/api/v2/shop/delete-seller/:id`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageVendors')`
- **Parameters:** `id` (shop ID in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Seller deleted successfully"
  }
  ```
- **Description:** Permanently removes a seller account and associated data

---

### 19. Get Pending Sellers for Approval

- **Path:** `/api/v2/shop/admin-pending-sellers`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission('canApproveVendors')`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "sellers": [{...}]
  }
  ```
- **Description:** Lists all sellers awaiting admin approval

---

### 20. Toggle Ad Fee Exemption

- **Path:** `/api/v2/shop/admin/toggle-ad-fee-exempt/:shopId`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `shopId` (shop ID in URL)
- **Request Body:**
  ```json
  {
    "adFeeExempt": "boolean",
    "adFeeExemptReason": "string (optional)",
    "isInHouseStore": "boolean",
    "inHouseStoreNote": "string (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "shop": {...}
  }
  ```
- **Description:** Exempts or applies advertising fees to a shop

---

### 21. Get Ad Fee Exempt Shops

- **Path:** `/api/v2/shop/admin/ad-fee-exempt-shops`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "shops": [{...}]
  }
  ```
- **Description:** Lists all shops exempt from advertising fees

---

### 22. Get Shop Ad Status

- **Path:** `/api/v2/shop/admin/shop-ad-status/:shopId`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `shopId` (shop ID in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "shop": {
      "_id": "...",
      "name": "...",
      "adFeeExempt": "boolean",
      "adFeeExemptReason": "...",
      "isInHouseStore": "boolean"
    }
  }
  ```
- **Description:** Retrieves advertising fee status for a specific shop

---

## CATEGORY MANAGEMENT (category.js)

### 23. Create Category

- **Path:** `/api/v2/category/create-category`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageCategories')`, `upload.single("image")`
- **Parameters:** None (multipart form data)
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "description": "string",
    "parent": "string (parent category ID, optional)",
    "sortOrder": "number",
    "metaTitle": "string",
    "metaDescription": "string",
    "image": "file (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "category": {
      "_id": "...",
      "name": "...",
      "slug": "...",
      "image": {...}
    }
  }
  ```
- **Description:** Creates a new product category with optional image

---

### 24. Update Category

- **Path:** `/api/v2/category/update-category/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageCategories')`, `upload.single("image")`
- **Parameters:** `id` (category ID in URL)
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "parent": "string (optional)",
    "sortOrder": "number",
    "metaTitle": "string",
    "metaDescription": "string",
    "image": "file (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "category": {...}
  }
  ```
- **Description:** Updates category details and icon

---

### 25. Delete Category

- **Path:** `/api/v2/category/delete-category/:id`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageCategories')`
- **Parameters:** `id` (category ID in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Category deleted successfully"
  }
  ```
- **Description:** Removes a category and reassigns child categories

---

## BANNER MANAGEMENT (banner.js)

### 26. Update Banner

- **Path:** `/api/v2/banner/update-banner`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageContent')`, `upload.array('slidingImages', 10)`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "title": "string",
    "subtitle": "string",
    "description": "string",
    "buttonText": "string",
    "secondaryButtonText": "string",
    "customerCount": "number",
    "productCount": "number",
    "displayMode": "string (single|sliding)",
    "autoSlideInterval": "number (milliseconds)",
    "transitionEffect": "string",
    "slidingImagesData": "JSON string (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "banner": {...}
  }
  ```
- **Description:** Updates homepage banner with text and/or sliding image support

---

## ORDER MANAGEMENT (order.js)

### 27. Get Single Order by ID (Admin)

- **Path:** `/api/v2/order/admin-get-order/:id`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageOrders')`
- **Parameters:** `id` (order ID in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "order": {
      "_id": "...",
      "orderNumber": "...",
      "userId": "...",
      "cart": [...],
      "totalPrice": "number",
      "status": "...",
      ...
    }
  }
  ```
- **Description:** Retrieves complete order details for admin review

---

## WITHDRAWAL MANAGEMENT (withdraw.js)

### 28. Get All Withdrawal Requests

- **Path:** `/api/v2/withdraw/get-all-withdraw-request`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageOrders')`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "withdrawals": [{...}]
  }
  ```
- **Description:** Lists all pending and completed seller withdrawal requests

---

### 29. Approve Withdrawal with PhonePe Payout

- **Path:** `/api/v2/withdraw/approve-withdrawal-with-phonepe-payout/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageOrders')`
- **Parameters:** `id` (withdrawal request ID in URL)
- **Request Body:**
  ```json
  {
    "payoutDetails": "object (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Withdrawal approved",
    "withdrawal": {...}
  }
  ```
- **Description:** Approves seller withdrawal and initiates PhonePe payout

---

## CONTENT MANAGEMENT

### 30. Legal Pages - Get All Pages

- **Path:** `/api/v2/legal/admin-get-all-pages`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageContent')`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "pages": [{...}]
  }
  ```
- **Description:** Retrieves all legal pages (terms, privacy, etc.)

---

### 31. Legal Pages - Get Specific Page

- **Path:** `/api/v2/legal/admin-get-page/:pageType`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageContent')`
- **Parameters:** `pageType` (terms-of-service, privacy-policy, etc.)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "page": {
      "pageType": "...",
      "title": "...",
      "content": "...",
      "contentType": "html|text|document"
    }
  }
  ```
- **Description:** Retrieves a specific legal page for editing

---

### 32. Legal Pages - Create/Update Page

- **Path:** `/api/v2/legal/admin-create-update-page`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageContent')`, `uploadDocument.single("document")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "pageType": "string (required)",
    "title": "string",
    "content": "string",
    "contentType": "string (html|text|document)",
    "metaDescription": "string",
    "metaKeywords": "string",
    "isActive": "boolean",
    "document": "file (Word .docx)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "page": {...}
  }
  ```
- **Description:** Creates or updates legal pages with rich content support

---

### 33. Terms Migration

- **Path:** `/api/v2/legal/admin-migrate-terms`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Migration completed"
  }
  ```
- **Description:** Migrates old terms-of-service to new format

---

### 34. FAQ - Get All FAQs

- **Path:** `/api/v2/faq/admin/get-all-faqs`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission('canManageContent')`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "faqs": [{...}]
  }
  ```
- **Description:** Retrieves all FAQ entries for admin management

---

### 35. Blog - Get All Blogs

- **Path:** `/api/v2/blog/admin/get-all-blogs`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission("canManageContent")`
- **Parameters:**
  - `page` (query: default 1)
  - `limit` (query: default 10)
  - `search` (query: optional)
  - `status` (query: optional - published|draft)
  - `category` (query: optional)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "blogs": [{...}],
    "total": 25,
    "totalPages": 3,
    "currentPage": 1,
    "stats": {
      "total": 25,
      "published": 20,
      "draft": 5,
      "totalViews": 1500
    }
  }
  ```
- **Description:** Lists all blog posts with filtering and statistics

---

### 36. Properties - Get All Properties

- **Path:** `/api/v2/property/admin/get-all-properties`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `requirePermission("canManageContent")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "properties": [{...}]
  }
  ```
- **Description:** Retrieves all properties (inactive and active)

---

### 37. Email Templates - Initialize Templates

- **Path:** `/api/v2/email/init-templates`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `requirePermission("canManageSettings")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Templates initialized",
    "templates": [{...}]
  }
  ```
- **Description:** Initializes or resets default email templates

---

## SITE SETTINGS (siteSettings.js)

### 38. Get Site Settings

- **Path:** `/api/v2/settings/admin/get-site-settings`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "settings": {
      "siteName": "...",
      "siteUrl": "...",
      "favicon": {...},
      "appleTouchIcon": {...},
      ...
    }
  }
  ```
- **Description:** Retrieves all site-wide configuration settings

---

### 39. Update Site Settings

- **Path:** `/api/v2/settings/admin/update-site-settings`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "siteName": "string",
    "siteUrl": "string",
    "maintenanceMode": "boolean",
    "customSettings": "object"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "settings": {...}
  }
  ```
- **Description:** Updates global site configuration

---

### 40. Reset Site Settings

- **Path:** `/api/v2/settings/admin/reset-site-settings`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Settings reset to defaults"
  }
  ```
- **Description:** Resets all settings to system defaults

---

### 41. Upload Branding Image

- **Path:** `/api/v2/settings/admin/upload-branding-image`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`, `upload.single("image")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "imageType": "string (favicon|appleTouchIcon)",
    "image": "file (PNG/ICO)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "imageUrl": "...",
    "message": "Image uploaded successfully"
  }
  ```
- **Description:** Uploads site favicon or Apple touch icon

---

### 42. Delete Branding Image

- **Path:** `/api/v2/settings/admin/delete-branding-image/:imageType`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `imageType` (favicon|appleTouchIcon)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Image deleted successfully"
  }
  ```
- **Description:** Removes a branding image

---

## SUBSCRIPTION MANAGEMENT (subscription.js)

### 43. Get All Subscriptions

- **Path:** `/api/v2/subscription/admin/all-subscriptions`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "subscriptions": [{...}]
  }
  ```
- **Description:** Lists all active and inactive subscriptions

---

### 44. Get Subscription Statistics

- **Path:** `/api/v2/subscription/admin/subscription-stats`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "stats": {
      "basic": 50,
      "professional": 30,
      "enterprise": 10,
      "totalRevenue": 5000
    }
  }
  ```
- **Description:** Aggregated subscription metrics and revenue

---

### 45. Cancel Subscription

- **Path:** `/api/v2/subscription/admin/cancel-subscription/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (subscription ID)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Subscription cancelled"
  }
  ```
- **Description:** Cancels an active subscription

---

### 46. Change Subscription Plan

- **Path:** `/api/v2/subscription/admin/change-subscription/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (subscription ID)
- **Request Body:**
  ```json
  {
    "newPlan": "string (plan key)",
    "billingCycle": "string (monthly|yearly)",
    "reason": "string (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "subscription": {...}
  }
  ```
- **Description:** Changes a subscription to a different plan

---

### 47. Create Subscription

- **Path:** `/api/v2/subscription/admin/create-subscription`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "shopId": "string (required)",
    "plan": "string (plan key)",
    "billingCycle": "string (monthly|yearly)",
    "durationMonths": "number",
    "isFree": "boolean",
    "reason": "string (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "subscription": {...}
  }
  ```
- **Description:** Admin creates a subscription for a shop

---

### 48. Get Shops Without Subscription

- **Path:** `/api/v2/subscription/admin/shops-without-subscription`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "shops": [{...}]
  }
  ```
- **Description:** Lists all shops without active subscriptions

---

### 49. Manage Plans

- **Path:** `/api/v2/subscription/admin/manage-plans`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "plans": [{...}]
  }
  ```
- **Description:** Retrieves all subscription plan definitions

---

### 50. Create Plan

- **Path:** `/api/v2/subscription/admin/create-plan`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "planKey": "string (required)",
    "name": "string (required)",
    "monthlyPrice": "number",
    "maxProducts": "number",
    "features": "array",
    "isActive": "boolean",
    "sortOrder": "number"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "plan": {...}
  }
  ```
- **Description:** Creates a new subscription plan type

---

### 51. Update Plan

- **Path:** `/api/v2/subscription/admin/update-plan/:planKey`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `planKey` (plan key in URL)
- **Request Body:**
  ```json
  {
    "name": "string",
    "monthlyPrice": "number",
    "maxProducts": "number",
    "features": "array",
    "isActive": "boolean",
    "sortOrder": "number"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "plan": {...}
  }
  ```
- **Description:** Modifies subscription plan details

---

### 52. Toggle Plan Status

- **Path:** `/api/v2/subscription/admin/toggle-plan/:planKey`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `planKey` (plan key in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "plan": {...}
  }
  ```
- **Description:** Activates or deactivates a subscription plan

---

### 53. Delete Plan

- **Path:** `/api/v2/subscription/admin/delete-plan/:planKey`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `planKey` (plan key in URL)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Plan deleted successfully"
  }
  ```
- **Description:** Removes a subscription plan

---

## ADVERTISEMENT MANAGEMENT (advertisement.js - from routes)

### 54. Get Advertisement Plans

- **Path:** `/api/v2/advertisement/admin/plans`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "plans": [{...}]
  }
  ```
- **Description:** Lists all advertisement pricing plans

---

### 55. Update Advertisement Plan

- **Path:** `/api/v2/advertisement/admin/update-plan`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "planId": "string",
    "price": "number",
    "features": "object"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "plan": {...}
  }
  ```
- **Description:** Modifies advertisement plan pricing

---

### 56. Toggle Advertisement Plan

- **Path:** `/api/v2/advertisement/admin/toggle-plan/:adType`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `adType` (ad type identifier)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "plan": {...}
  }
  ```
- **Description:** Enables or disables ad type for vendors

---

### 57. Toggle Free Advertisement Plan

- **Path:** `/api/v2/advertisement/admin/toggle-free/:adType`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `adType` (ad type identifier)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "plan": {...}
  }
  ```
- **Description:** Marks advertisement as free or paid

---

### 58. Update Advertisement Discounts

- **Path:** `/api/v2/advertisement/admin/update-discounts`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "discounts": [
      {
        "duration": "number (days)",
        "discountPercentage": "number"
      }
    ]
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "discounts": {...}
  }
  ```
- **Description:** Sets duration-based discount rates for advertisements

---

## DEPARTMENT MANAGEMENT (department.js - from routes)

### 59. Create Department

- **Path:** `/api/v2/department/admin/create-department`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`, `upload.fields`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "description": "string",
    "icon": "file (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "department": {...}
  }
  ```
- **Description:** Creates a new product department

---

### 60. Update Department

- **Path:** `/api/v2/department/admin/update-department/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`, `upload.fields`
- **Parameters:** `id` (department ID)
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "icon": "file (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "department": {...}
  }
  ```
- **Description:** Updates department information

---

### 61. Delete Department

- **Path:** `/api/v2/department/admin/delete-department/:id`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (department ID)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Department deleted successfully"
  }
  ```
- **Description:** Removes a department

---

### 62. Reorder Departments

- **Path:** `/api/v2/department/admin/reorder-departments`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "departments": [
      {
        "id": "string",
        "order": "number"
      }
    ]
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Department order updated"
  }
  ```
- **Description:** Reorders departments display sequence

---

## LOCATION MANAGEMENT (district.js - from routes)

### 63. Add District

- **Path:** `/api/v2/district/admin-add-district`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "name": "string (required)",
    "state": "string",
    "country": "string"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "district": {...}
  }
  ```
- **Description:** Creates a new district/region

---

### 64. Update District

- **Path:** `/api/v2/district/admin-update-district/:id`
- **Method:** `PUT`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (district ID)
- **Request Body:**
  ```json
  {
    "name": "string",
    "state": "string",
    "country": "string"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "district": {...}
  }
  ```
- **Description:** Updates district details

---

### 65. Delete District

- **Path:** `/api/v2/district/admin-delete-district/:id`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** `id` (district ID)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "District deleted successfully"
  }
  ```
- **Description:** Removes a district

---

## DATA MIGRATION (migration.js - from routes)

### 66. Migrate Pincode Data

- **Path:** `/api/v2/migration/migrate-pincode`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "sourceField": "string",
    "targetField": "string",
    "transformFunction": "string (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "migratedCount": "number",
    "message": "Migration completed"
  }
  ```
- **Description:** Migrates pincode and location data

---

## PAYMENT & PAYOUT (phonePePayment.js - from routes)

### 67. Initiate PhonePe Payout

- **Path:** `/api/v2/payment/payout/initiate`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin('Admin')`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "vendorId": "string",
    "amount": "number",
    "phoneNumber": "string",
    "transferId": "string (optional)"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "payoutId": "...",
    "transactionId": "...",
    "status": "..."
  }
  ```
- **Description:** Initiates PhonePe vendor payout

---

### 68. Check PhonePe Payout Status

- **Path:** `/api/v2/payment/payout/status/:payoutTransactionId`
- **Method:** `GET`
- **Middleware:** `isAuthenticated`, `isAdmin('Admin')`
- **Parameters:** `payoutTransactionId` (transaction ID from PhonePe)
- **Request Body:** None
- **Response Format:**
  ```json
  {
    "success": true,
    "status": "completed|pending|failed",
    "transactionDetails": {...}
  }
  ```
- **Description:** Retrieves the status of a PhonePe payout

---

## PINCODE/SERVICE AREA (pincode.js - from routes)

### 69. Initialize Serviceable Areas

- **Path:** `/api/v2/pincode/initialize-areas`
- **Method:** `POST`
- **Middleware:** `isAuthenticated`, `isAdmin("Admin")`
- **Parameters:** None
- **Request Body:**
  ```json
  {
    "areas": [
      {
        "pincode": "string",
        "district": "string",
        "state": "string",
        "serviceable": "boolean"
      }
    ]
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "initialized": "number",
    "message": "Service areas initialized"
  }
  ```
- **Description:** Bulk initializes serviceable pincodes and areas

---

## PERMISSION MATRIX

The following permissions control access to endpoints:

| Permission            | Endpoints                          |
| --------------------- | ---------------------------------- |
| `canManageUsers`      | User management, user deletion     |
| `canManageVendors`    | Seller management, vendor approval |
| `canManageCategories` | Category CRUD                      |
| `canManageProducts`   | Product CRUD, product approval     |
| `canApproveProducts`  | Pending product review             |
| `canApproveVendors`   | Seller approval workflow           |
| `canManageOrders`     | Order view, withdrawal management  |
| `canManageContent`    | Pages, blogs, FAQs, banners        |
| `canManageSettings`   | Site settings, email templates     |
| `canViewAnalytics`    | Shop and sales analytics           |

---

## AUTHENTICATION

All endpoints require:

1. **`isAuthenticated`** - Valid JWT token in Authorization header or `auth_token` cookie
2. **`isAdmin(role)`** - Admin-only access. Role parameter is optional (defaults to any admin level)
3. **`requirePermission(permission)`** - Role-based permission check

### Header Format:

```
Authorization: Bearer <jwt_token>
```

Or via Cookie:

```
auth_token=<jwt_token>
```

---

## RESPONSE FORMAT CONVENTIONS

All endpoints follow this structure:

**Success Response:**

```json
{
  "success": true,
  "data": {...} or [...],  // Endpoint-specific data
  "message": "Operation description"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description"
}
```

**Status Codes:**

- `200/201` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## NOTES

- All `POST` and `PUT` endpoints processing file uploads use multipart form-data
- Pagination uses `page` and `limit` query parameters (1-indexed)
- Most responses include populated foreign key references (shop details, user info, etc.)
- Admin operations create audit trails in the system
- Rate limiting may apply to high-volume operations
- Timestamps are in ISO 8601 format
