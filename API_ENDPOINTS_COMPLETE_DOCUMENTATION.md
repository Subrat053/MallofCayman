# Mall of Cayman - Complete API Endpoints Documentation

**Project**: Mall of Cayman Multi-Vendor E-Commerce Platform  
**Base URL**: `/api/v2`  
**Last Updated**: April 4, 2026  
**Total Endpoints**: 200+ across 37 modules

---

## Table of Contents

1. [User Management](#1-user-management)
2. [Shop Management](#2-shop-management)
3. [Product Management](#3-product-management)
4. [Order Management](#4-order-management)
5. [Payment Processing](#5-payment-processing)
6. [PhonePe Payment](#6-phonepe-payment)
7. [Stripe Webhook](#7-stripe-webhook)
8. [Category Management](#8-category-management)
9. [Pincode & Delivery](#9-pincode--delivery)
10. [Shipping Configuration](#10-shipping-configuration)
11. [Vendor Delivery](#11-vendor-delivery)
12. [District Management](#12-district-management)
13. [Review Management](#13-review-management)
14. [Promotion & Discounts](#14-promotion--discounts)
15. [Advertisement](#15-advertisement)
16. [Store Manager Advertisement](#16-store-manager-advertisement)
17. [Video Banner](#17-video-banner)
18. [Video Call](#18-video-call)
19. [Store Manager Service](#19-store-manager-service)
20. [Withdrawal Management](#20-withdrawal-management)
21. [Message & Communication](#21-message--communication)
22. [Conversation](#22-conversation)
23. [AI Chat](#23-ai-chat)
24. [Banners](#24-banners)
25. [Migration](#25-migration)
26. [Department](#26-department)
27. [Site Settings](#27-site-settings)
28. [Newsletter](#28-newsletter)
29. [Notifications](#29-notifications)
30. [Contact](#30-contact)
31. [FAQ](#31-faq)
32. [Legal Pages](#32-legal-pages)
33. [Blog](#33-blog)
34. [Subscription](#34-subscription)
35. [Commission](#35-commission)
36. [Property](#36-property)
37. [Email Template](#37-email-template)

---

## 1. User Management

**Base URL**: `/api/v2/user`

### Account Creation & Authentication

| Method | Endpoint                   | Description                      | Auth | Response                |
| ------ | -------------------------- | -------------------------------- | ---- | ----------------------- |
| POST   | `/create-user`             | Create new user account          | None | User ID, JWT token      |
| POST   | `/activation`              | Activate user account with token | None | Confirmation            |
| POST   | `/login-user`              | Login user                       | None | JWT token, User data    |
| GET    | `/logout`                  | Logout user                      | None | Confirmation            |
| POST   | `/forgot-password`         | Password reset request           | None | Email sent confirmation |
| POST   | `/reset-password/:token`   | Reset password with token        | None | Success message         |
| POST   | `/send-verification-email` | Resend verification email        | None | Email sent              |
| GET    | `/verify-email/:token`     | Complete email verification      | None | Verified status         |

### User Profile Management

| Method | Endpoint                 | Description                  | Auth     | Response     |
| ------ | ------------------------ | ---------------------------- | -------- | ------------ |
| GET    | `/getuser`               | Get authenticated user info  | Required | User details |
| PUT    | `/update-user-info`      | Update user name/email/phone | Required | Updated user |
| PUT    | `/update-avatar`         | Update user profile picture  | Required | Avatar URL   |
| PUT    | `/update-user-addresses` | Manage user address book     | Required | Address list |
| PUT    | `/update-user-password`  | Change password              | Required | Confirmation |

### Admin User Management

| Method | Endpoint                      | Description                    | Auth     | Response                  |
| ------ | ----------------------------- | ------------------------------ | -------- | ------------------------- |
| GET    | `/all-users`                  | Get all users                  | Admin    | User list with pagination |
| GET    | `/get-single-user/:id`        | Get specific user              | Admin    | User details              |
| GET    | `/admin/all-users-with-roles` | Get all users grouped by role  | Admin    | Users grouped by role     |
| PATCH  | `/update-user-role/:userId`   | Change user role               | Admin    | Updated user              |
| GET    | `/get-user-by-email/:email`   | Find user by email             | Admin    | User details              |
| POST   | `/create-user-for-seller`     | Create user account for seller | Admin    | User ID, credentials      |
| GET    | `/check-user/:id`             | Verify user exists             | Admin    | Boolean                   |
| DELETE | `/delete-user/:id`            | Delete user account            | Required | Confirmation              |

### Debug Endpoints

| Method | Endpoint              | Description                   | Auth  | Response         |
| ------ | --------------------- | ----------------------------- | ----- | ---------------- |
| GET    | `/debug-users-shops`  | Debug user-shop relationships | Debug | Debug info       |
| PUT    | `/fix-supplier-roles` | Fix supplier role migration   | Debug | Migration status |

### Special

| Method | Endpoint                   | Description                | Auth  | Response             |
| ------ | -------------------------- | -------------------------- | ----- | -------------------- |
| POST   | `/add-seller-subscription` | Add subscription to seller | Admin | Subscription details |

---

## 2. Shop Management

**Base URL**: `/api/v2/shop`

### Shop Registration & Setup

| Method | Endpoint                       | Description                            | Auth | Response          |
| ------ | ------------------------------ | -------------------------------------- | ---- | ----------------- |
| POST   | `/registration-payment-intent` | Stripe payment intent for registration | None | Payment intent    |
| POST   | `/create-shop`                 | Create new shop                        | None | Shop ID           |
| POST   | `/shop-register`               | Register supplier/seller shop          | None | Shop details      |
| POST   | `/activate-seller-account`     | Activate seller account                | None | Activation status |

### Shop Information

| Method | Endpoint                       | Description               | Auth   | Response        |
| ------ | ------------------------------ | ------------------------- | ------ | --------------- |
| GET    | `/get-shop/:id`                | Get shop details          | Public | Shop info       |
| GET    | `/get-all-shop`                | Get all shops             | Public | Shop list       |
| GET    | `/get-shop-info/:shopId`       | Get shop with products    | Public | Shop + products |
| GET    | `/get-single-shop`             | Get current seller's shop | Seller | Shop details    |
| GET    | `/get-shop-products/:id`       | Get shop's products       | Public | Product list    |
| GET    | `/get-shop-categories/:shopId` | Get shop's categories     | Public | Categories      |
| GET    | `/get-shop-reviews/:shopId`    | Get shop reviews          | Public | Reviews list    |

### Shop Profile Updates

| Method | Endpoint                           | Description                   | Auth   | Response         |
| ------ | ---------------------------------- | ----------------------------- | ------ | ---------------- |
| PUT    | `/update-shop-avatar`              | Update shop logo              | Seller | Logo URL         |
| PUT    | `/update-shop-profile-cover`       | Update shop banner            | Seller | Banner URL       |
| DELETE | `/delete-shop-profile-picture/:id` | Remove shop picture           | Seller | Confirmation     |
| DELETE | `/delete-shop-banner/:id`          | Delete shop banner            | Seller | Confirmation     |
| PUT    | `/update-shop-settings`            | Update shop general settings  | Seller | Updated settings |
| PUT    | `/update-shop-info`                | Update shop info (name, desc) | Seller | Shop details     |
| PUT    | `/update-shop-business-hours`      | Set business operating hours  | Seller | Business hours   |

### Shop Approval Workflow

| Method | Endpoint                      | Description                | Auth   | Response           |
| ------ | ----------------------------- | -------------------------- | ------ | ------------------ |
| POST   | `/shop-approval-request`      | Submit shop for approval   | Seller | Request ID         |
| PUT    | `/admin/approve-shop/:shopId` | Approve shop registration  | Admin  | Approval status    |
| PUT    | `/admin/reject-shop/:shopId`  | Reject shop registration   | Admin  | Rejection status   |
| GET    | `/admin/pending-shops`        | Get pending shop approvals | Admin  | Pending shops list |

### Shop Dashboard

| Method | Endpoint                     | Description                | Auth   | Response          |
| ------ | ---------------------------- | -------------------------- | ------ | ----------------- |
| GET    | `/get-seller-dashboard-info` | Get seller dashboard stats | Seller | Dashboard metrics |
| GET    | `/get-shop-orders/:shopId`   | Get shop's orders          | Seller | Orders list       |

---

## 3. Product Management

**Base URL**: `/api/v2/product`

### Product CRUD Operations

| Method | Endpoint              | Description                   | Auth   | Response                     |
| ------ | --------------------- | ----------------------------- | ------ | ---------------------------- |
| POST   | `/create-product`     | Create new product            | Seller | Product ID                   |
| GET    | `/get-all-products`   | Get all products with filters | Public | Product list with pagination |
| GET    | `/get-product/:id`    | Get product details           | Public | Full product info            |
| PUT    | `/update-product/:id` | Update product info           | Seller | Updated product              |
| DELETE | `/delete-product/:id` | Delete product                | Seller | Confirmation                 |

### Seller Products

| Method | Endpoint               | Description           | Auth   | Response      |
| ------ | ---------------------- | --------------------- | ------ | ------------- |
| GET    | `/get-seller-products` | Get seller's products | Seller | Products list |

### Product Images & Media

| Method | Endpoint                                    | Description            | Auth   | Response         |
| ------ | ------------------------------------------- | ---------------------- | ------ | ---------------- |
| PUT    | `/update-product-images/:id`                | Update product images  | Seller | Image URLs       |
| DELETE | `/delete-product-image/:productId/:imageId` | Remove product image   | Seller | Confirmation     |
| PUT    | `/reorder-product-images/:id`               | Reorder product images | Seller | Reordered images |

### Product Pricing & Attributes

| Method | Endpoint                           | Description              | Auth   | Response           |
| ------ | ---------------------------------- | ------------------------ | ------ | ------------------ |
| PUT    | `/update-product-pricing/:id`      | Update product price     | Seller | Updated price      |
| PATCH  | `/update-product-attribute-prices` | Update attribute pricing | Seller | Updated attributes |
| PUT    | `/update-product-discount`         | Set product discount     | Seller | Updated discount   |

### Product Inventory & Status

| Method | Endpoint                    | Description      | Auth   | Response      |
| ------ | --------------------------- | ---------------- | ------ | ------------- |
| PUT    | `/update-product-stock/:id` | Update inventory | Seller | Updated stock |

### Product Features

| Method | Endpoint                    | Description              | Auth   | Response              |
| ------ | --------------------------- | ------------------------ | ------ | --------------------- |
| PUT    | `/duplicate-product/:id`    | Clone product            | Seller | New product ID        |
| GET    | `/get-related-products/:id` | Get similar products     | Public | Related products list |
| GET    | `/search-products`          | Search products by query | Public | Search results        |

### Reviews

| Method | Endpoint              | Description        | Auth | Response  |
| ------ | --------------------- | ------------------ | ---- | --------- |
| POST   | `/add-product-review` | Add product review | User | Review ID |

---

## 4. Order Management

**Base URL**: `/api/v2/order`

### Order Creation & Retrieval

| Method | Endpoint                | Description       | Auth        | Response        |
| ------ | ----------------------- | ----------------- | ----------- | --------------- |
| POST   | `/create-order`         | Create new order  | User        | Order ID        |
| GET    | `/get-all-orders`       | Get all orders    | Admin       | Orders list     |
| GET    | `/get-my-orders`        | Get user's orders | User        | User's orders   |
| GET    | `/get-single-order/:id` | Get order details | User/Seller | Full order info |

### Order Status Management

| Method | Endpoint                           | Description             | Auth         | Response                  |
| ------ | ---------------------------------- | ----------------------- | ------------ | ------------------------- |
| PUT    | `/update-order-status/:id`         | Update order status     | Seller/Admin | Updated status            |
| PUT    | `/update-order-payment-status/:id` | Update payment status   | Admin        | Updated payment status    |
| PUT    | `/cancel-order/:id`                | Cancel order            | User/Seller  | Cancellation confirmation |
| PUT    | `/mark-order-delivered/:id`        | Mark order as delivered | Seller       | Delivery confirmation     |

### Seller Orders

| Method | Endpoint                 | Description                 | Auth         | Response             |
| ------ | ------------------------ | --------------------------- | ------------ | -------------------- |
| GET    | `/get-seller-orders`     | Get seller's orders         | Seller       | Seller's orders list |
| GET    | `/get-all-seller-orders` | Get all seller's orders     | Seller       | All seller's orders  |
| GET    | `/get-new-orders`        | Get recently created orders | Seller       | New orders           |
| GET    | `/get-processing-orders` | Get being processed orders  | Seller       | Processing orders    |
| GET    | `/get-delivering-orders` | Get in-transit orders       | Seller       | Delivering orders    |
| GET    | `/get-refund-orders`     | Get refund requests         | Seller/Admin | Refund orders        |

### Order Administration

| Method | Endpoint                | Description             | Auth  | Response        |
| ------ | ----------------------- | ----------------------- | ----- | --------------- |
| GET    | `/get-orders-by-status` | Filter orders by status | Admin | Filtered orders |

### Delivery Management

| Method | Endpoint                             | Description          | Auth   | Response              |
| ------ | ------------------------------------ | -------------------- | ------ | --------------------- |
| PUT    | `/update-order-delivery-details/:id` | Update delivery info | Seller | Updated delivery info |

### Invoice Generation

| Method | Endpoint                     | Description            | Auth       | Response   |
| ------ | ---------------------------- | ---------------------- | ---------- | ---------- |
| POST   | `/generate-invoice/:orderId` | Generate order invoice | Admin      | Invoice ID |
| GET    | `/download-invoice/:orderId` | Download invoice PDF   | User/Admin | PDF file   |

---

## 5. Payment Processing

**Base URL**: `/api/v2/payment`

### Stripe Integration

| Method | Endpoint                                | Description                  | Auth                      | Response             |
| ------ | --------------------------------------- | ---------------------------- | ------------------------- | -------------------- |
| POST   | `/process`                              | Create Stripe payment intent | Required                  | Payment intent       |
| GET    | `/stripeapikey`                         | Get Stripe public key        | Required                  | API key              |
| POST   | `/stripe/create-order-checkout-session` | Create Stripe checkout       | Required                  | Session ID           |
| POST   | `/stripe/webhook`                       | Stripe webhook (raw body)    | None (Signature verified) | Webhook confirmation |

### Payment Information

| Method | Endpoint                        | Description      | Auth  | Response        |
| ------ | ------------------------------- | ---------------- | ----- | --------------- |
| GET    | `/get-payment-details/:orderId` | Get payment info | Admin | Payment details |

---

## 6. PhonePe Payment

**Base URL**: `/api/v2/payment/phonepe`

### Payment Transactions

| Method | Endpoint                   | Description              | Auth           | Response              |
| ------ | -------------------------- | ------------------------ | -------------- | --------------------- |
| POST   | `/initiate`                | Start PhonePe payment    | Required       | Transaction ID        |
| POST   | `/callback`                | PhonePe webhook callback | None (Webhook) | Callback confirmation |
| GET    | `/redirect/:transactionId` | Payment redirect handler | None           | Redirect response     |
| GET    | `/status/:transactionId`   | Check payment status     | Required       | Payment status        |

### Payout Management

| Method | Endpoint                              | Description             | Auth           | Response              |
| ------ | ------------------------------------- | ----------------------- | -------------- | --------------------- |
| POST   | `/payout/initiate`                    | Start seller payout     | Admin          | Payout transaction ID |
| GET    | `/payout/status/:payoutTransactionId` | Check payout status     | Admin          | Payout status         |
| POST   | `/payout/callback`                    | Payout webhook callback | None (Webhook) | Callback confirmation |

---

## 7. Stripe Webhook

**URL**: `/api/v2/payment/stripe/webhook`

| Method | Endpoint | Description            | Auth                        | Response           |
| ------ | -------- | ---------------------- | --------------------------- | ------------------ |
| POST   | `/`      | Stripe webhook handler | Raw body signature verified | Event confirmation |

---

## 8. Category Management

**Base URL**: `/api/v2/category`

| Method | Endpoint  | Description           | Auth   | Response          |
| ------ | --------- | --------------------- | ------ | ----------------- |
| GET    | `/`       | Get all categories    | Public | Categories list   |
| GET    | `/active` | Get active categories | Public | Active categories |
| POST   | `/create` | Create category       | Admin  | Category ID       |
| PUT    | `/:id`    | Update category       | Admin  | Updated category  |
| DELETE | `/:id`    | Delete category       | Admin  | Confirmation      |

---

## 9. Pincode & Delivery

**Base URL**: `/api/v2/pincode`

| Method | Endpoint                             | Description                  | Auth   | Response              |
| ------ | ------------------------------------ | ---------------------------- | ------ | --------------------- |
| GET    | `/check/:pincode`                    | Check delivery in pincode    | Public | Deliverable status    |
| GET    | `/check-product/:pincode/:productId` | Check product delivery       | Public | Deliverable status    |
| GET    | `/test/:pincode`                     | Test pincode validation      | Debug  | Test result           |
| GET    | `/search`                            | Search locations by query    | Public | Locations list        |
| GET    | `/place/:placeId`                    | Get location details         | Public | Location details      |
| POST   | `/calculate-shipping`                | Calculate shipping fee       | Public | Shipping cost         |
| POST   | `/initialize-areas`                  | Initialize serviceable areas | Admin  | Initialization status |

---

## 10. Shipping Configuration

**Base URL**: `/api/v2/shipping`

| Method | Endpoint                 | Description              | Auth   | Response        |
| ------ | ------------------------ | ------------------------ | ------ | --------------- |
| GET    | `/simple-config/:shopId` | Get shop shipping config | Public | Shipping config |
| POST   | `/simple-config`         | Save shipping config     | Seller | Saved config    |
| POST   | `/calculate-simple`      | Calculate shipping cost  | Public | Shipping cost   |

---

## 11. Vendor Delivery

**Base URL**: `/api/v2/vendor-delivery`

| Method | Endpoint                       | Description                     | Auth   | Response            |
| ------ | ------------------------------ | ------------------------------- | ------ | ------------------- |
| GET    | `/config/:shopId`              | Get vendor delivery config      | Public | Delivery config     |
| GET    | `/my-config`                   | Get seller's config             | Seller | Delivery config     |
| POST   | `/save-config`                 | Save delivery config            | Seller | Saved config        |
| PUT    | `/toggle-delivery`             | Enable/disable delivery         | Seller | Toggle status       |
| PUT    | `/set-district-fee`            | Set fee for district            | Seller | Updated fee         |
| DELETE | `/remove-district/:districtId` | Remove district                 | Seller | Confirmation        |
| POST   | `/check-delivery`              | Check delivery availability     | Public | Availability status |
| POST   | `/get-delivery-options`        | Get delivery options (checkout) | Public | Options list        |
| POST   | `/bulk-set-fees`               | Set multiple district fees      | Seller | Bulk update status  |

---

## 12. District Management

**Base URL**: `/api/v2/district`

| Method | Endpoint       | Description               | Auth   | Response           |
| ------ | -------------- | ------------------------- | ------ | ------------------ |
| GET    | `/all`         | Get active districts      | Public | Districts list     |
| GET    | `/admin/all`   | Get all districts         | Admin  | All districts      |
| GET    | `/:id`         | Get district details      | Public | District info      |
| POST   | `/create`      | Create district           | Admin  | District ID        |
| PUT    | `/update/:id`  | Update district           | Admin  | Updated district   |
| DELETE | `/delete/:id`  | Soft delete district      | Admin  | Confirmation       |
| POST   | `/bulk-create` | Create multiple districts | Admin  | Bulk create status |
| POST   | `/seed-cayman` | Seed Cayman Islands data  | Admin  | Seed status        |
| PUT    | `/reorder`     | Reorder districts         | Admin  | Reorder status     |

---

## 13. Review Management

**Base URL**: `/api/v2/review`

| Method | Endpoint                                    | Description                     | Auth   | Response                   |
| ------ | ------------------------------------------- | ------------------------------- | ------ | -------------------------- |
| GET    | `/get-all-reviews`                          | Get all reviews with pagination | Public | Reviews list               |
| GET    | `/get-product-reviews/:productId`           | Get reviews for product         | Public | Product reviews            |
| GET    | `/get-review-stats`                         | Get review statistics           | Public | Review stats               |
| GET    | `/seller-reviews`                           | Get seller's product reviews    | Seller | Seller's reviews           |
| GET    | `/seller-review-stats`                      | Get seller review stats         | Seller | Seller stats               |
| POST   | `/reply/:reviewId`                          | Reply to review                 | Seller | Reply confirmation         |
| DELETE | `/admin/delete-review/:productId/:reviewId` | Delete specific review          | Admin  | Deletion confirmation      |
| DELETE | `/admin/delete-reviews`                     | Delete multiple reviews         | Admin  | Bulk deletion confirmation |

---

## 14. Promotion & Discounts

**Base URL**: `/api/v2/coupon`

| Method | Endpoint                  | Description            | Auth   | Response              |
| ------ | ------------------------- | ---------------------- | ------ | --------------------- |
| POST   | `/create-coupon-code`     | Create discount coupon | Admin  | Coupon ID             |
| GET    | `/get-all-couponCode`     | Get all coupons        | Admin  | Coupons list          |
| DELETE | `/delete-coupon/:id`      | Delete coupon          | Admin  | Confirmation          |
| GET    | `/get-coupon-value/:name` | Validate coupon        | Public | Coupon value/discount |

---

## 15. Advertisement

**Base URL**: `/api/v2/advertisement`

### Pricing & Availability

| Method | Endpoint                   | Description            | Auth     | Response          |
| ------ | -------------------------- | ---------------------- | -------- | ----------------- |
| GET    | `/pricing`                 | Get ad pricing         | Public   | Pricing structure |
| POST   | `/calculate-price`         | Calculate ad cost      | Optional | Calculated price  |
| GET    | `/available-slots/:adType` | Get available ad slots | Optional | Available slots   |

### Active Ads & Tracking

| Method | Endpoint           | Description            | Auth   | Response       |
| ------ | ------------------ | ---------------------- | ------ | -------------- |
| GET    | `/active/:adType`  | Get active ads by type | Public | Active ads     |
| POST   | `/track-view/:id`  | Track ad view          | Public | View recorded  |
| POST   | `/track-click/:id` | Track ad click         | Public | Click recorded |

### Seller/Admin Ad Management

| Method | Endpoint                            | Description          | Auth                | Response                  |
| ------ | ----------------------------------- | -------------------- | ------------------- | ------------------------- |
| POST   | `/create`                           | Create advertisement | Seller/StoreManager | Ad ID                     |
| POST   | `/process-payment`                  | Process ad payment   | Seller/StoreManager | Payment confirmation      |
| POST   | `/stripe/create-ad-payment-session` | Stripe ad payment    | Seller/StoreManager | Session ID                |
| POST   | `/stripe/confirm-ad-payment`        | Confirm ad payment   | Seller/StoreManager | Payment confirmation      |
| GET    | `/vendor/my-ads`                    | Get vendor's ads     | Seller/StoreManager | Ads list                  |
| GET    | `/vendor/analytics/:id`             | Get ad analytics     | Seller/StoreManager | Analytics data            |
| PUT    | `/vendor/cancel/:id`                | Cancel ad            | Seller/StoreManager | Cancellation confirmation |
| POST   | `/vendor/renew/:id`                 | Renew ad             | Seller/StoreManager | Renewal confirmation      |
| PUT    | `/vendor/auto-renew/:id`            | Toggle auto-renewal  | Seller/StoreManager | Toggle status             |
| GET    | `/vendor/ad/:id`                    | Get single ad        | Seller/StoreManager | Ad details                |
| PUT    | `/vendor/update/:id`                | Update ad            | Seller/StoreManager | Updated ad                |

### Admin Controls

| Method | Endpoint                     | Description               | Auth  | Response               |
| ------ | ---------------------------- | ------------------------- | ----- | ---------------------- |
| GET    | `/admin/all`                 | Get all ads               | Admin | All ads list           |
| GET    | `/admin/plans`               | Get ad plans              | Admin | Plans list             |
| PUT    | `/admin/update-plan`         | Update ad plan pricing    | Admin | Updated plan           |
| PUT    | `/admin/toggle-plan/:adType` | Enable/disable ad type    | Admin | Toggle status          |
| PUT    | `/admin/toggle-free/:adType` | Toggle free plan          | Admin | Toggle status          |
| PUT    | `/admin/update-discounts`    | Update duration discounts | Admin | Updated discounts      |
| PUT    | `/admin/approve/:id`         | Approve ad                | Admin | Approval confirmation  |
| PUT    | `/admin/reject/:id`          | Reject ad                 | Admin | Rejection confirmation |

---

## 16. Store Manager Advertisement

**Base URL**: `/api/v2/store-manager-advertisement`

| Method | Endpoint               | Description            | Auth         | Response       |
| ------ | ---------------------- | ---------------------- | ------------ | -------------- |
| GET    | `/ad-types`            | Get ad types info      | StoreManager | Ad types       |
| GET    | `/shop-products`       | Get shop products      | StoreManager | Products list  |
| GET    | `/shop-ad-fee-status`  | Check ad fee exemption | StoreManager | Fee status     |
| GET    | `/statistics`          | Get ad statistics      | StoreManager | Statistics     |
| GET    | `/my-ads`              | Get manager's ads      | StoreManager | Ads list       |
| GET    | `/ad/:id`              | Get ad details         | StoreManager | Ad details     |
| GET    | `/ad/:id/analytics`    | Get ad analytics       | StoreManager | Analytics      |
| POST   | `/create`              | Create advertisement   | StoreManager | Ad ID          |
| PUT    | `/ad/:id`              | Update advertisement   | StoreManager | Updated ad     |
| PUT    | `/ad/:id/status`       | Toggle ad status       | StoreManager | Status toggle  |
| POST   | `/ad/:id/duplicate`    | Clone advertisement    | StoreManager | New ad ID      |
| DELETE | `/ad/:id`              | Delete advertisement   | StoreManager | Confirmation   |
| POST   | `/track/view/:id`      | Track ad view          | Public       | View recorded  |
| POST   | `/track/click/:id`     | Track ad click         | Public       | Click recorded |
| GET    | `/shop/:shopId/active` | Get shop's active ads  | Public       | Active ads     |

---

## 17. Video Banner

**Base URL**: `/api/v2/video-banner`

### Upload & Creation

| Method | Endpoint                      | Description                   | Auth          | Response  |
| ------ | ----------------------------- | ----------------------------- | ------------- | --------- |
| POST   | `/upload-files`               | Upload banner video/thumbnail | AdminOrSeller | File URLs |
| POST   | `/create-video-banner`        | Create video banner           | AdminOrSeller | Banner ID |
| POST   | `/seller/create-video-banner` | Create banner (seller)        | Seller        | Banner ID |

### Management

| Method | Endpoint                       | Description            | Auth          | Response         |
| ------ | ------------------------------ | ---------------------- | ------------- | ---------------- |
| GET    | `/admin-all-video-banners`     | Get all banners        | Admin         | Banners list     |
| GET    | `/active-video-banners`        | Get active banners     | Public        | Active banners   |
| GET    | `/video-banner/:id`            | Get banner details     | Public        | Banner info      |
| GET    | `/get-video-banner/:id`        | Get banner for editing | AdminOrSeller | Banner for edit  |
| GET    | `/seller/get-video-banner/:id` | Get seller's banner    | AdminOrSeller | Banner details   |
| GET    | `/my-video-banners`            | Get seller's banners   | Seller        | Seller's banners |

### Updates & Approval

| Method | Endpoint                          | Description            | Auth          | Response               |
| ------ | --------------------------------- | ---------------------- | ------------- | ---------------------- |
| PUT    | `/update-video-banner/:id`        | Update banner          | Required      | Updated banner         |
| PUT    | `/seller/update-video-banner/:id` | Update banner (seller) | AdminOrSeller | Updated banner         |
| DELETE | `/delete-video-banner/:id`        | Delete banner          | Required      | Confirmation           |
| PUT    | `/approve-video-banner/:id`       | Approve banner         | Admin         | Approval confirmation  |
| PUT    | `/reject-video-banner/:id`        | Reject banner          | Admin         | Rejection confirmation |
| PUT    | `/update-banner-approval/:id`     | Update approval status | Admin         | Status updated         |

### Analytics

| Method | Endpoint                      | Description      | Auth   | Response       |
| ------ | ----------------------------- | ---------------- | ------ | -------------- |
| POST   | `/record-view/:id`            | Record view      | Public | View recorded  |
| POST   | `/record-click/:id`           | Record click     | Public | Click recorded |
| GET    | `/banner-analytics`           | Get analytics    | Admin  | Analytics data |
| GET    | `/shop/:shopId/video-banners` | Get shop banners | Public | Shop banners   |

---

## 18. Video Call

**Base URL**: `/api/v2/video-call`

| Method | Endpoint                        | Description               | Auth         | Response              |
| ------ | ------------------------------- | ------------------------- | ------------ | --------------------- |
| POST   | `/initiate`                     | Start video call          | UserOrSeller | Call session          |
| POST   | `/respond`                      | Respond to call           | UserOrSeller | Response confirmation |
| POST   | `/end`                          | End call                  | UserOrSeller | End confirmation      |
| GET    | `/history/:sellerId`            | Get call history          | UserOrSeller | Call history          |
| GET    | `/customer-history/:customerId` | Get customer call history | UserOrSeller | Customer history      |
| GET    | `/customers/:sellerId`          | Get eligible customers    | UserOrSeller | Customers list        |
| GET    | `/analytics/:sellerId`          | Get call analytics        | UserOrSeller | Analytics data        |
| GET    | `/seller-info/:sellerId`        | Get seller info           | UserOrSeller | Seller details        |
| GET    | `/product-seller/:productId`    | Get product seller        | UserOrSeller | Seller details        |
| POST   | `/block-customer`               | Block customer            | Seller       | Block confirmation    |
| POST   | `/unblock-customer`             | Unblock customer          | Seller       | Unblock confirmation  |
| GET    | `/blocked-customers`            | Get blocked list          | Seller       | Blocked customers     |
| GET    | `/check-blocked/:customerId`    | Check if blocked          | Seller       | Boolean               |

---

## 19. Store Manager Service

**Base URL**: `/api/v2/store-manager`

| Method | Endpoint                              | Description            | Auth         | Response                |
| ------ | ------------------------------------- | ---------------------- | ------------ | ----------------------- |
| GET    | `/my-service`                         | Get service status     | Seller       | Service status          |
| POST   | `/create-purchase`                    | Create PayPal order    | Seller       | Order ID                |
| POST   | `/activate-service`                   | Activate service       | Seller       | Activation confirmation |
| GET    | `/search-users`                       | Search users to assign | Seller       | Users list              |
| POST   | `/create-manager-account`             | Create manager account | Seller       | Manager ID              |
| POST   | `/assign-manager`                     | Assign manager to shop | Seller       | Assignment confirmation |
| POST   | `/remove-manager`                     | Remove manager         | Seller       | Removal confirmation    |
| GET    | `/my-managed-shop`                    | Get managed shop info  | StoreManager | Shop info               |
| GET    | `/admin/all-services`                 | Get all services       | Admin        | Services list           |
| PUT    | `/admin/toggle-suspension/:serviceId` | Suspend/unsuspend      | Admin        | Toggle confirmation     |

---

## 20. Withdrawal Management

**Base URL**: `/api/v2/withdraw`

| Method | Endpoint                  | Description                 | Auth   | Response               |
| ------ | ------------------------- | --------------------------- | ------ | ---------------------- |
| POST   | `/request-withdraw`       | Request withdrawal          | Seller | Withdrawal ID          |
| GET    | `/get-all-withdraws`      | Get all withdrawal requests | Admin  | Withdrawals list       |
| GET    | `/withdraws`              | Get seller's withdrawals    | Seller | Seller's withdrawals   |
| PUT    | `/update-withdraw-method` | Update payment method       | Seller | Updated method         |
| GET    | `/withdrawal-methods`     | Get supported methods       | Public | Methods list           |
| PUT    | `/approve-withdraw/:id`   | Approve withdrawal          | Admin  | Approval confirmation  |
| PUT    | `/reject-withdraw/:id`    | Reject withdrawal           | Admin  | Rejection confirmation |

---

## 21. Message & Communication

**Base URL**: `/api/v2/message`

| Method | Endpoint                            | Description               | Auth     | Response              |
| ------ | ----------------------------------- | ------------------------- | -------- | --------------------- |
| POST   | `/create-message`                   | Send message              | Required | Message ID            |
| GET    | `/get-all-messages/:conversationId` | Get conversation messages | Required | Messages list         |
| PUT    | `/update-message/:id`               | Edit message              | Required | Updated message       |
| DELETE | `/delete-message/:id`               | Delete message            | Required | Deletion confirmation |

---

## 22. Conversation

**Base URL**: `/api/v2/conversation`

| Method | Endpoint                       | Description              | Auth     | Response             |
| ------ | ------------------------------ | ------------------------ | -------- | -------------------- |
| POST   | `/create-conversation`         | Start conversation       | Required | Conversation ID      |
| GET    | `/get-all-conversations`       | Get user conversations   | Required | Conversations list   |
| GET    | `/get-single-conversation/:id` | Get conversation details | Required | Conversation info    |
| PUT    | `/update-conversation`         | Update conversation      | Required | Updated conversation |

---

## 23. AI Chat

**Base URL**: `/api/v2/ai-chat`

| Method | Endpoint  | Description             | Auth | Response       |
| ------ | --------- | ----------------------- | ---- | -------------- |
| POST   | `/chat`   | Send message to AI      | None | AI response    |
| GET    | `/health` | Check AI service status | None | Service status |

---

## 24. Banners

**Base URL**: `/api/v2/banner`

| Method | Endpoint               | Description         | Auth   | Response       |
| ------ | ---------------------- | ------------------- | ------ | -------------- |
| GET    | `/get-banner`          | Get active banner   | Public | Banner info    |
| PUT    | `/update-banner`       | Update banner       | Admin  | Updated banner |
| POST   | `/upload-banner-image` | Upload banner image | Admin  | Image URL      |

---

## 25. Migration

**Base URL**: `/api/v2/migration`

| Method | Endpoint                      | Description            | Auth  | Response         |
| ------ | ----------------------------- | ---------------------- | ----- | ---------------- |
| POST   | `/migrate-product-categories` | Migrate categories     | Admin | Migration status |
| GET    | `/migration-status`           | Get migration progress | Admin | Progress info    |

---

## 26. Department

**Base URL**: `/api/v2/department`

| Method | Endpoint            | Description              | Auth   | Response             |
| ------ | ------------------- | ------------------------ | ------ | -------------------- |
| GET    | `/all`              | Get all departments      | Public | Departments list     |
| GET    | `/homepage`         | Get featured departments | Public | Featured departments |
| GET    | `/mall-map`         | Get department mall map  | Public | Mall map             |
| GET    | `/:id`              | Get department details   | Public | Department info      |
| POST   | `/admin/create`     | Create department        | Admin  | Department ID        |
| PUT    | `/admin/update/:id` | Update department        | Admin  | Updated department   |
| DELETE | `/admin/delete/:id` | Delete department        | Admin  | Confirmation         |
| POST   | `/admin/reorder`    | Reorder departments      | Admin  | Reorder status       |

---

## 27. Site Settings

**Base URL**: `/api/v2/site-settings`

| Method | Endpoint                      | Description            | Auth   | Response         |
| ------ | ----------------------------- | ---------------------- | ------ | ---------------- |
| GET    | `/get-site-settings`          | Get public settings    | Public | Settings         |
| GET    | `/admin/get-site-settings`    | Get settings for admin | Admin  | Settings         |
| PUT    | `/admin/update-site-settings` | Update settings        | Admin  | Updated settings |
| POST   | `/admin/upload-logo`          | Upload site logo       | Admin  | Logo URL         |

---

## 28. Newsletter

**Base URL**: `/api/v2/newsletter`

| Method | Endpoint              | Description             | Auth  | Response         |
| ------ | --------------------- | ----------------------- | ----- | ---------------- |
| POST   | `/subscribe`          | Subscribe to newsletter | None  | Confirmation     |
| GET    | `/subscribers`        | Get all subscribers     | Admin | Subscribers list |
| DELETE | `/unsubscribe/:email` | Unsubscribe             | None  | Confirmation     |

---

## 29. Notifications

**Base URL**: `/api/v2/notification`

| Method | Endpoint                   | Description            | Auth     | Response             |
| ------ | -------------------------- | ---------------------- | -------- | -------------------- |
| GET    | `/get-my-notifications`    | Get user notifications | Required | Notifications list   |
| PUT    | `/read-notification/:id`   | Mark as read           | Required | Updated notification |
| DELETE | `/delete-notification/:id` | Delete notification    | Required | Confirmation         |

---

## 30. Contact

**Base URL**: `/api/v2/contact`

| Method | Endpoint             | Description             | Auth  | Response        |
| ------ | -------------------- | ----------------------- | ----- | --------------- |
| POST   | `/send-message`      | Contact form submission | None  | Message ID      |
| GET    | `/admin/messages`    | Get contact messages    | Admin | Messages list   |
| PUT    | `/admin/message/:id` | Update message status   | Admin | Updated message |

---

## 31. FAQ

**Base URL**: `/api/v2/faq`

| Method | Endpoint          | Description  | Auth   | Response     |
| ------ | ----------------- | ------------ | ------ | ------------ |
| GET    | `/get-all-faqs`   | Get all FAQs | Public | FAQs list    |
| POST   | `/create-faq`     | Create FAQ   | Admin  | FAQ ID       |
| PUT    | `/update-faq/:id` | Update FAQ   | Admin  | Updated FAQ  |
| DELETE | `/delete-faq/:id` | Delete FAQ   | Admin  | Confirmation |

---

## 32. Legal Pages

**Base URL**: `/api/v2/legal-page`

| Method | Endpoint          | Description       | Auth   | Response     |
| ------ | ----------------- | ----------------- | ------ | ------------ |
| GET    | `/get-page/:slug` | Get legal page    | Public | Page content |
| GET    | `/all`            | Get all pages     | Public | Pages list   |
| POST   | `/create`         | Create legal page | Admin  | Page ID      |
| PUT    | `/update/:id`     | Update legal page | Admin  | Updated page |

---

## 33. Blog

**Base URL**: `/api/v2/blog`

| Method | Endpoint           | Description        | Auth   | Response     |
| ------ | ------------------ | ------------------ | ------ | ------------ |
| GET    | `/get-all-blogs`   | Get all blog posts | Public | Blog list    |
| GET    | `/get-blog/:slug`  | Get single blog    | Public | Blog content |
| POST   | `/create-blog`     | Create blog post   | Admin  | Blog ID      |
| PUT    | `/update-blog/:id` | Update blog        | Admin  | Updated blog |
| DELETE | `/delete-blog/:id` | Delete blog        | Admin  | Confirmation |

---

## 34. Subscription

**Base URL**: `/api/v2/subscription`

| Method | Endpoint           | Description             | Auth     | Response             |
| ------ | ------------------ | ----------------------- | -------- | -------------------- |
| GET    | `/get-plans`       | Get subscription plans  | Public   | Plans list           |
| POST   | `/subscribe`       | Subscribe to plan       | Required | Subscription ID      |
| GET    | `/my-subscription` | Get user's subscription | Required | Subscription details |

---

## 35. Commission

**Base URL**: `/api/v2/commission`

| Method | Endpoint             | Description             | Auth  | Response         |
| ------ | -------------------- | ----------------------- | ----- | ---------------- |
| GET    | `/get-commissions`   | Get commission settings | Admin | Commission rates |
| PUT    | `/update-commission` | Update commission rates | Admin | Updated rates    |

---

## 36. Property

**Base URL**: `/api/v2/property`

| Method | Endpoint               | Description        | Auth   | Response         |
| ------ | ---------------------- | ------------------ | ------ | ---------------- |
| GET    | `/get-all-properties`  | Get all properties | Public | Properties list  |
| POST   | `/create-property`     | Create property    | Admin  | Property ID      |
| PUT    | `/update-property/:id` | Update property    | Admin  | Updated property |
| DELETE | `/delete-property/:id` | Delete property    | Admin  | Confirmation     |

---

## 37. Email Template

**Base URL**: `/api/v2/email-template`

| Method | Endpoint               | Description           | Auth  | Response         |
| ------ | ---------------------- | --------------------- | ----- | ---------------- |
| GET    | `/get-templates`       | Get email templates   | Admin | Templates list   |
| GET    | `/get-template/:slug`  | Get specific template | Admin | Template details |
| PUT    | `/update-template/:id` | Update template       | Admin | Updated template |

---

## Authentication Levels Reference

### Public

- No authentication required
- Available to all visitors

### Required

- User must be logged in
- Generic authenticated user

### User

- Regular customer/user account

### Seller / isSeller

- User has seller/shop owner role

### StoreManager

- Assigned store manager for a shop

### Admin

- Administrator or SubAdmin with appropriate permissions

### AdminOrSeller

- Can be either admin or seller

### UserOrSeller

- Can be either regular user or seller

### Seller/StoreManager

- Either seller or store manager role

### Optional

- Authentication checked but not required

### Debug

- Debug/development endpoints only

### Webhook

- Special handling - signature verified instead of token

---

## Middleware & Security

### Common Middleware Applied

| Middleware                      | Purpose                   | Applied To             |
| ------------------------------- | ------------------------- | ---------------------- |
| `isAuthenticated`               | Verify user is logged in  | Protected routes       |
| `isSeller`                      | Verify user is a seller   | Seller routes          |
| `isAdmin(role)`                 | Verify admin role         | Admin routes           |
| `requirePermission(permission)` | Check specific permission | Protected admin routes |
| `allowAdminOrMaster`            | Admin/master admin only   | Admin routes           |

### Webhook Security

- **Stripe**: Raw body signature verification
- **PhonePe**: Server-side validation

---

## Rate Limiting & Best Practices

1. **Authentication**: Always use HTTPS for API calls
2. **Tokens**: Include JWT token in `Authorization: Bearer <token>` header
3. **Pagination**: Use pagination for list endpoints
4. **Error Handling**: Check HTTP status codes and error messages
5. **Timeouts**: Implement reasonable timeout values

---

## Response Format

All endpoints follow standard JSON response format:

### Success Response (200, 201)

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response (400, 401, 403, 404, 500)

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

---

## WebSocket Events

**Socket.io Events** (`/api/v2` namespace):

- Message events for real-time chat
- Video call signaling
- Notification delivery
- Order status updates

---

## File Uploads

### Supported Endpoints for File Upload

- Product images (JPEG, PNG, WebP, GIF)
- Shop avatars (JPEG, PNG)
- Shop banners (JPEG, PNG)
- Video banner videos & thumbnails
- Email template images
- Site settings logos

### Upload Limits

- Max file size: Check server configuration
- Allowed types: Configured per endpoint

---

## Notes

- **Base URL**: All endpoints prefixed with `/api/v2`
- **Total Endpoints**: 200+ across 37 modules
- **Database**: Connected MongoDB backend
- **Payment Gateways**: Stripe, PhonePe, PayPal support
- **Real-time**: Socket.io for chat, calls, notifications
- **Caching**: Implemented for frequently accessed data
- **Validation**: Input validation on all endpoints

---

## Development URLs

- **Local**: `http://localhost:<PORT>/api/v2`
- **Production**: Configure in environment variables

---

_Documentation generated on April 4, 2026_
