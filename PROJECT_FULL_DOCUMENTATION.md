# Mall of Cayman — Complete Project Documentation

> **Multi-Vendor E-Commerce Marketplace Platform**
> Repository: `Subrat053/MallofCayman` | Branch: `main`
> Generated from actual codebase analysis

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Backend Server Configuration](#5-backend-server-configuration)
6. [Database Schema — All 36 Models](#6-database-schema--all-36-models)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Role-Based Access Control (RBAC)](#8-role-based-access-control-rbac)
9. [API Endpoints](#9-api-endpoints)
10. [Frontend Architecture](#10-frontend-architecture)
11. [State Management (Redux)](#11-state-management-redux)
12. [Frontend Routing](#12-frontend-routing)
13. [Real-Time Features (Socket.io)](#13-real-time-features-socketio)
14. [Payment Systems](#14-payment-systems)
15. [Order Lifecycle & Delivery](#15-order-lifecycle--delivery)
16. [Subscription & Commission System](#16-subscription--commission-system)
17. [Advertisement System](#17-advertisement-system)
18. [Seller Approval Workflow](#18-seller-approval-workflow)
19. [Store Manager System](#19-store-manager-system)
20. [Shipping & Delivery Configuration](#20-shipping--delivery-configuration)
21. [Video Call System](#21-video-call-system)
22. [Content Management](#22-content-management)
23. [Notification System](#23-notification-system)
24. [File Uploads & Media](#24-file-uploads--media)
25. [Email Template System](#25-email-template-system)
26. [Cron Jobs & Scheduled Tasks](#26-cron-jobs--scheduled-tasks)
27. [Backend Utilities](#27-backend-utilities)
28. [Frontend Custom Hooks & Services](#28-frontend-custom-hooks--services)
29. [Environment Variables](#29-environment-variables)
30. [Deployment](#30-deployment)

---

## 1. Project Overview

**Mall of Cayman** is a full-featured multi-vendor e-commerce marketplace built for the Cayman Islands market. It allows multiple sellers (vendors) to register, list products, and sell through a unified storefront. The platform supports four distinct user roles with granular permissions, real-time messaging, video calling, multiple payment gateways, district-based delivery, subscription plans, and a comprehensive admin dashboard.

### Core Business Features

| Feature | Description |
|---------|-------------|
| Multi-Vendor Marketplace | Multiple sellers operate independent shops within one platform |
| Subscription Plans | Free, Bronze, Silver, Gold, Revenue-Share tiers for sellers |
| Commission System | Platform takes configurable commission on each sale |
| District-Based Delivery | Cayman Islands district-level delivery fee configuration |
| Real-Time Chat | Socket.io powered messaging between customers and sellers |
| Video Calls | WebRTC-based video calls for order support and product inquiries |
| Advertisement System | Multiple ad types with slot management, auto-renewal, and analytics |
| Real Estate Module | Property listings with leads management |
| AI Integration | Gemini AI service for chatbot functionality |
| Multi-Currency | USD, EUR, GBP, INR, KYD, and more |
| Store Manager Role | Delegated shop management by assigned store managers |
| In-House Stores | Admin-operated stores within the marketplace |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NGINX REVERSE PROXY                      │
│                     (cloudtesting.cloud.conf)                   │
├───────────────┬──────────────────────┬──────────────────────────┤
│               │                      │                          │
│   Frontend    │    Backend API       │    Socket Server          │
│   React SPA   │    Express REST      │    Socket.io              │
│   Port 3000   │    Port 8000         │    Port 4000              │
│               │    /api/v2/*         │    WebSocket              │
├───────────────┼──────────────────────┼──────────────────────────┤
│               │                      │                          │
│  Redux Store  │  MongoDB (Mongoose)  │  In-Memory Stores:       │
│  9 Slices     │  36 Collections      │  - users[]               │
│               │                      │  - messages{}             │
│  React Router │  Cloudinary (Files)  │  - orderTracking{}       │
│  60+ Pages    │  Stripe / PayPal     │  - videoCalls{}          │
│               │  Nodemailer (Email)  │                          │
└───────────────┴──────────────────────┴──────────────────────────┘
```

### Three-Tier Architecture

| Tier | Technology | Port | Purpose |
|------|-----------|------|---------|
| **Frontend** | React 18 + Redux Toolkit | 3000 | Single Page Application with Tailwind CSS |
| **Backend** | Node.js + Express | 8000 | REST API, business logic, database operations |
| **Socket** | Socket.io | 4000 | Real-time messaging, order tracking, video calls |

### External Services

| Service | Usage |
|---------|-------|
| MongoDB | Primary database |
| Cloudinary | Image/video storage and CDN |
| Stripe | Payment processing (cards, checkout sessions) |
| PayPal | Payment processing + seller payouts |
| PhonePe | Payment gateway (India market) |
| Nodemailer | Transactional emails |
| Google Maps API | Distance calculation, shipping rates |
| Gemini AI | AI chatbot |
| Puppeteer | PDF invoice generation |

---

## 3. Technology Stack

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 4.18.2 | Web framework |
| mongoose | 7.0.0 | MongoDB ODM |
| cloudinary | 2.7.0 | Media storage |
| stripe | 12.0.0 | Payment processing |
| jsonwebtoken | 9.0.0 | JWT authentication |
| bcryptjs | 2.4.3 | Password hashing |
| nodemailer | 6.9.1 | Email service |
| multer | 1.4.5-lts.1 | File uploads |
| cookie-parser | 1.4.6 | Cookie handling |
| cors | 2.8.5 | Cross-origin support |
| dotenv | 16.0.3 | Environment config |
| node-cron | 3.0.3 | Scheduled tasks |
| puppeteer | 24.8.0 | PDF generation |
| pdf-lib | 1.17.1 | PDF manipulation |
| archiver | 7.0.1 | ZIP file creation |
| @paypal/checkout-server-sdk | 1.0.3 | PayPal server SDK |
| axios | 1.8.4 | HTTP client |

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | DOM rendering |
| react-router-dom | 6.8.1 | Client-side routing |
| @reduxjs/toolkit | 1.9.3 | State management |
| react-redux | 8.0.5 | Redux bindings |
| axios | 1.3.4 | HTTP client |
| @material-ui/core | 4.12.4 | UI component library |
| @stripe/react-stripe-js | 2.1.0 | Stripe React components |
| @paypal/react-paypal-js | 7.8.3 | PayPal React components |
| socket.io-client | 4.6.1 | WebSocket client |
| tailwindcss | 3.3.2 | Utility-first CSS |
| react-toastify | 9.1.1 | Toast notifications |
| react-icons | 4.7.1 | Icon library |
| lucide-react | 0.510.0 | Modern icon library |
| react-quill | 2.0.0 | Rich text editor |
| jspdf | 2.5.2 | Client-side PDF generation |
| xlsx | 0.18.5 | Excel export |
| country-state-city | 3.0.1 | Location data |
| react-lottie | 1.2.4 | Lottie animations |
| timeago.js | 4.0.2 | Relative time display |
| @react-google-maps/api | 2.20.6 | Google Maps integration |
| react-slick | 0.30.3 | Carousel/slider |

### Socket Server Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| socket.io | 4.6.1 | WebSocket server |
| express | 4.18.2 | HTTP server for health checks |
| cors | 2.8.5 | CORS for socket connections |
| dotenv | 16.0.3 | Environment config |

---

## 4. Project Structure

```
Mall-of-cayman/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   ├── multer.js                    # Multer upload config
│   ├── config/
│   │   ├── .env                     # Environment variables
│   │   └── cloudinary.js            # Cloudinary setup
│   ├── controller/                  # 32 Route controllers
│   │   ├── advertisement.js
│   │   ├── banner.js
│   │   ├── blog.js
│   │   ├── category.js
│   │   ├── commission.js
│   │   ├── contact.js
│   │   ├── conversation.js
│   │   ├── coupounCode.js
│   │   ├── department.js
│   │   ├── emailTemplate.js
│   │   ├── event.js
│   │   ├── faq.js
│   │   ├── legalPage.js
│   │   ├── message.js
│   │   ├── newsletter.js
│   │   ├── notification.js
│   │   ├── order.js
│   │   ├── payment.js
│   │   ├── phonePePayment.js
│   │   ├── product.js
│   │   ├── productAttribute.js
│   │   ├── property.js
│   │   ├── shipping.js
│   │   ├── shop.js
│   │   ├── siteSettings.js
│   │   ├── storeManagerAdvertisement.js
│   │   ├── subscription.js
│   │   ├── supplier.js
│   │   ├── user.js
│   │   ├── videoBanner.js
│   │   ├── videoCall.js
│   │   └── withdraw.js
│   ├── db/
│   │   └── Database.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT auth + RBAC middleware
│   │   ├── catchAsyncErrors.js      # Async error wrapper
│   │   └── error.js                 # Global error handler
│   ├── model/                       # 36 Mongoose schemas
│   │   ├── advertisement.js
│   │   ├── banner.js
│   │   ├── blockedCustomer.js
│   │   ├── blog.js
│   │   ├── category.js
│   │   ├── commission.js
│   │   ├── conversation.js
│   │   ├── coupounCode.js
│   │   ├── department.js
│   │   ├── district.js
│   │   ├── emailTemplate.js
│   │   ├── event.js
│   │   ├── faq.js
│   │   ├── legalPage.js
│   │   ├── messages.js
│   │   ├── newsletter.js
│   │   ├── notification.js
│   │   ├── order.js
│   │   ├── pincode.js
│   │   ├── product.js
│   │   ├── productAttribute.js
│   │   ├── property.js
│   │   ├── propertyLead.js
│   │   ├── shippingCalculation.js
│   │   ├── shippingConfig.js
│   │   ├── shop.js
│   │   ├── siteSettings.js
│   │   ├── storeManager.js
│   │   ├── storeManagerAdvertisement.js
│   │   ├── subscription.js
│   │   ├── subscriptionPlan.js
│   │   ├── user.js
│   │   ├── vendorDeliveryConfig.js
│   │   ├── videoBanner.js
│   │   ├── videoCall.js
│   │   └── withdraw.js
│   ├── routes/                      # 15 Additional route files
│   │   ├── advertisement.js
│   │   ├── ai-chat.js
│   │   ├── category.js
│   │   ├── department.js
│   │   ├── district.js
│   │   ├── migration.js
│   │   ├── phonePePayment.js
│   │   ├── pincode.js
│   │   ├── review.js
│   │   ├── shipping.js
│   │   ├── storeManager.js
│   │   ├── storeManagerAdvertisement.js
│   │   ├── vendorDelivery.js
│   │   ├── videoBanner.js
│   │   └── videoCall.js
│   ├── uploads/                     # Temporary file uploads
│   └── utils/                       # 19 Utility modules
│       ├── currencyFormatter.js
│       ├── DistanceCalculationService.js
│       ├── DynamicShippingService.js
│       ├── emailTemplates.js
│       ├── EnhancedShippingService.js
│       ├── ErrorHandler.js
│       ├── GoogleMapsService.js
│       ├── jwtToken.js
│       ├── migrate-avatars.js
│       ├── migrate-products.js
│       ├── migrateOrderCoordinates.js
│       ├── NotificationService.js
│       ├── paypalPayout.js
│       ├── pdfGenerator.js
│       ├── rolePermissions.js
│       ├── seedNotifications.js
│       ├── sendMail.js
│       ├── shopToken.js
│       └── socialMediaPost.js
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── App.js                   # Root component with routing
│       ├── server.js                # API base URL config
│       ├── components/
│       │   ├── Admin/               # ~50 admin components
│       │   ├── Shop/                # ~40 seller components
│       │   ├── StoreManager/        # ~15 store manager components
│       │   ├── Layout/              # Header, Footer, Sidebar
│       │   ├── Checkout/            # Checkout flow components
│       │   ├── Products/            # Product cards, details
│       │   ├── Events/              # Event components
│       │   ├── VideoCall/           # Video call UI
│       │   ├── Route/               # Route protection HOCs
│       │   └── ...
│       ├── pages/                   # 80+ page components
│       ├── redux/
│       │   ├── store.js             # Redux store config
│       │   ├── actions/             # Action creators
│       │   └── reducers/            # 9 Redux slices
│       ├── hooks/                   # 9+ custom hooks
│       ├── context/                 # CurrencyContext
│       ├── contexts/                # SocketContext
│       ├── services/                # geminiService, videoBannerService
│       ├── utils/                   # csvExporter, invoiceGenerator, etc.
│       └── static/                  # Static data files
├── socket/
│   ├── index.js                     # Socket.io server
│   └── package.json
├── nginx/
│   └── cloudtesting.cloud.conf      # Nginx configuration
├── ecosystem.config.js              # PM2 deployment config
└── deploy.sh                        # Deployment script
```

---

## 5. Backend Server Configuration

The Express server (`backend/server.js`) initializes in the following order:

1. **Environment Config** — Loads `.env` from `config/.env`
2. **Database Connection** — Connects to MongoDB, initializes default site settings
3. **Upload Directory** — Creates `uploads/` if not present
4. **Stripe Webhook** — Registered before `express.json()` (requires raw body)
5. **Middleware Stack** — `express.json(50mb)`, `urlencoded`, `cookie-parser`, CORS
6. **Static Files** — `/uploads` served statically
7. **API Routes** — 34 route handlers mounted under `/api/v2/`
8. **Error Handler** — Global error middleware
9. **Cron Jobs** — Advertisement expiry check (midnight), auto-renewal (1 AM)
10. **Server Startup** — Listens on `process.env.PORT`

### API Base Paths

All routes are prefixed with `/api/v2/`:

| Prefix | Controller/Route |
|--------|-----------------|
| `/api/v2/user` | User management |
| `/api/v2/shop` | Seller/shop operations |
| `/api/v2/product` | Product CRUD |
| `/api/v2/event` | Event/promotion management |
| `/api/v2/coupon` | Coupon codes |
| `/api/v2/payment` | Stripe payment processing |
| `/api/v2/payment/phonepe` | PhonePe payment processing |
| `/api/v2/order` | Order management |
| `/api/v2/conversation` | Chat conversations |
| `/api/v2/message` | Chat messages |
| `/api/v2/withdraw` | Seller withdrawals |
| `/api/v2/newsletter` | Newsletter subscriptions |
| `/api/v2/notification` | Notification system |
| `/api/v2/pincode` | Pincode/delivery check |
| `/api/v2/shipping` | Shipping rate calculation |
| `/api/v2/ai-chat` | AI chatbot |
| `/api/v2/banner` | Homepage banners |
| `/api/v2/category` | Category management |
| `/api/v2/migration` | Data migration utilities |
| `/api/v2/review` | Product reviews |
| `/api/v2/legal-page` | Legal pages (T&C, privacy, etc.) |
| `/api/v2/site-settings` | Global site settings |
| `/api/v2/faq` | FAQ management |
| `/api/v2/video-banner` | Video banner management |
| `/api/v2/video-call` | Video call management |
| `/api/v2/subscription` | Seller subscriptions |
| `/api/v2/commission` | Commission tracking |
| `/api/v2/advertisement` | Ad campaigns |
| `/api/v2/department` | Mall department management |
| `/api/v2/contact` | Contact form submissions |
| `/api/v2/district` | Cayman Islands districts |
| `/api/v2/store-manager` | Store manager operations |
| `/api/v2/vendor-delivery` | Vendor delivery config |
| `/api/v2/email-template` | Email templates |
| `/api/v2/store-manager-advertisement` | Store manager ads |
| `/api/v2/blog` | Blog posts |
| `/api/v2/property` | Real estate properties |

---

## 6. Database Schema — All 36 Models

### 6.1 Advertisement (`advertisement`)

Manages paid advertising campaigns with slot management and auto-renewal.

| Field | Type | Required | Details |
|-------|------|----------|---------|
| shopId | ObjectId → Shop | ✓ | Vendor who placed the ad |
| adType | String (enum) | ✓ | leaderboard, top_sidebar, right_sidebar_top/middle/bottom, featured_store, featured_product, newsletter_inclusion, editorial_writeup |
| slotNumber | Number | | 1–6, for banner ad types |
| title | String | ✓ | Max 100 chars |
| description | String | | Max 500 chars |
| image/video | Object | | {url, public_id} |
| mediaType | String | | 'image' or 'video' |
| linkUrl | String | ✓ | Click-through URL |
| productId | ObjectId → Product | | Required for featured_product type |
| duration | Number (enum) | ✓ | 1, 3, 6, or 12 months |
| basePrice / discount / totalPrice | Number | ✓ | Pricing |
| startDate / endDate | Date | ✓ | Campaign period |
| autoRenew | Boolean | | Default: true |
| status | String (enum) | | awaiting_payment, pending, active, expired, cancelled, rejected |
| paymentStatus | String (enum) | | pending, completed, failed, refunded |
| views / clicks / clickThroughRate | Number | | Analytics |
| renewalHistory | Array | | Historical renewals |

**Indexes:** `{shopId, status}`, `{adType, status, startDate}`, `{status, endDate}`, `{adType, slotNumber, status}`

**Static Methods:** `getPricing()` — returns pricing table per ad type

---

### 6.2 Banner (`banner`)

Homepage hero banner with single image or sliding carousel mode.

| Field | Type | Details |
|-------|------|---------|
| title / subtitle / description | String | Hero text content |
| image | Object | {url, public_id} for single mode |
| images | Array | [{url, public_id, title, description}] for sliding mode |
| displayMode | String | 'single' or 'sliding' |
| autoSlideInterval | Number | Default: 5000ms |
| transitionEffect | String | 'fade', 'slide', 'zoom' |
| buttonText / secondaryButtonText | String | CTA buttons |
| stats | Object | customers/products/satisfaction counters |
| isActive | Boolean | Default: true |

---

### 6.3 BlockedCustomer (`blockedcustomer`)

Sellers can block abusive customers from video calls.

| Field | Type | Details |
|-------|------|---------|
| seller | ObjectId → Shop | Required |
| customer | ObjectId → User | Required |
| reason | String (enum) | spam_calls, inappropriate_behavior, abusive_language, other |
| isActive | Boolean | Default: true |

**Unique Index:** `{seller, customer}`

**Static Methods:** `isCustomerBlocked()`, `getBlockedCustomers()`

---

### 6.4 Blog (`blog`)

Platform blog with SEO, categories, and estimated read time.

| Field | Type | Details |
|-------|------|---------|
| title | String | Required, max 200 |
| slug | String | Auto-generated, unique |
| content | String | Required (HTML) |
| category | String (enum) | news, tips, guide, announcement, deals, lifestyle, technology, other |
| status | String | 'draft' or 'published' |
| author | ObjectId → User | Required |
| readTime | Number | Auto-calculated |

**Indexes:** `{status, publishedAt}`, `{slug}` (unique), text index on title/content/tags

---

### 6.5 Category (`category`)

Unlimited-depth hierarchical category tree.

| Field | Type | Details |
|-------|------|---------|
| name | String | Required, max 100 |
| slug | String | Required, unique |
| parent | ObjectId → Category | Self-referencing |
| level | Number | Auto-set from parent depth |
| path | String | Auto-built ancestor path |
| productCount | Number | Cached product count |
| image | Object | {url, public_id} |
| sortOrder | Number | Display ordering |
| metaTitle / metaDescription | String | SEO fields |

**Instance Methods:** `getAncestors()`, `getDescendants()`, `updateProductCount()`
**Static Methods:** `getCategoryTree()`, `getBreadcrumb()`

---

### 6.6 Commission (`commission`)

Tracks platform commission on each order.

| Field | Type | Details |
|-------|------|---------|
| order | ObjectId → Order | Required |
| shop | ObjectId → Shop | Required |
| totalAmount | Number | Full order amount |
| platformCommissionPercent | Number | Default: 10% |
| platformCommissionAmount | Number | Calculated |
| vendorAmount | Number | Seller's share |
| minimumMonthlyPayment | Number | Default: $25 |
| vendorPaymentStatus | String (enum) | pending, processing, paid, failed |
| paypalOrderId / vendorPayoutId | String | Payment references |

**Static Methods:** `calculateCommission(totalAmount)`

---

### 6.7 Conversation (`conversation`)

Chat conversation between users/sellers.

| Field | Type |
|-------|------|
| groupTitle | String |
| members | Array |
| lastMessage | String |
| lastMessageId | String |

---

### 6.8 CoupounCode (`coupouncode`)

Discount coupon codes created by sellers.

| Field | Type | Details |
|-------|------|---------|
| name | String | Required, unique |
| value | Number | Discount percentage |
| minAmount / maxAmount | Number | Order amount range |
| shopId | String | Required |
| selectedProduct | String | Product-specific coupon |

---

### 6.9 Department (`department`)

Mall directory departments with map positioning.

| Field | Type | Details |
|-------|------|---------|
| name | String | Required, unique |
| slug | String | Auto-generated |
| categories | Array of ObjectId → Category | Linked categories |
| displayOrder | Number | Sort order |
| showOnHomepage | Boolean | Default: true |
| color | String | Default: '#000000' |
| mapPosition | Object | {x, y, floor} for mall map |
| icon / image | Object | {url, public_id} |

---

### 6.10 District (`district`)

Cayman Islands districts for delivery zone configuration.

| Field | Type | Details |
|-------|------|---------|
| name | String | Required, unique |
| code | String | Required, unique, uppercase |
| region | String | Default: "Cayman Islands" |
| defaultDeliveryFee | Number | Default: 0 |
| defaultEstimatedDays | Number | Default: 3 |

**Static Methods:** `getActiveDistricts()`, `districtExists()`

---

### 6.11 EmailTemplate (`emailtemplate`)

Customizable transactional email templates with variable interpolation.

| Field | Type | Details |
|-------|------|---------|
| name | String | Required, unique |
| slug | String | Required, unique |
| subject | String | Required |
| htmlBody | String | Required (HTML with {{variables}}) |
| availableVariables | Array | [{variable, description, required}] |
| styling | Object | primaryColor, secondaryColor, fontFamily, logoUrl, etc. |

**Instance Methods:** `render(variables)` — replaces {{placeholders}} and applies styling
**Static Methods:** `getBySlug(slug)`

---

### 6.12 Event (`event`)

Time-limited promotional events/sales created by sellers.

| Field | Type | Details |
|-------|------|---------|
| name / description / category | String | Required |
| start_Date / Finish_Date | Date | Required |
| originalPrice / discountPrice | Number | Pricing |
| stock | Number | Required |
| images | Array | [{url, public_id}] |
| reviews / ratings | Array / Number | Customer feedback |
| shopId | String | Required |
| shop | Object | Required |
| sold_out | Number | Default: 0 |

---

### 6.13 FAQ (`faq`)

FAQ entries with helpfulness voting system.

| Field | Type | Details |
|-------|------|---------|
| question / answer | String | Required |
| category | String (enum) | general, ordering, shipping, payment, returns, account, technical, products |
| votes | Array | [{userIdentifier, voteType, votedAt}] |
| helpful / notHelpful | Number | Vote counters |

**Instance Methods:** `markHelpful(userIdentifier)`, `markNotHelpful(userIdentifier)`, `getUserVoteStatus()`

---

### 6.14 LegalPage (`legalpage`)

Admin-editable legal/policy pages.

| Field | Type | Details |
|-------|------|---------|
| pageType | String (enum, unique) | buyer-terms-of-service, seller-terms-of-service, privacy-policy, return-refund, shipping-policy, about-us |
| title / content | String | Required |
| contentType | String | html, markdown, plain-text |
| version | Number | Auto-incremented |
| documentFile | Object | Cloudinary-uploaded PDF |

---

### 6.15 Messages (`messages`)

Individual chat messages within conversations.

| Field | Type |
|-------|------|
| conversationId | String |
| text | String |
| sender | String |
| images | String |

---

### 6.16 Newsletter (`newsletter`)

Email newsletter subscriptions.

| Field | Type | Details |
|-------|------|---------|
| email | String | Required, unique, validated |
| isActive | Boolean | Default: true |
| subscribedAt / unsubscribedAt | Date | Timestamp tracking |

---

### 6.17 Notification (`notification`)

In-app notification system.

| Field | Type | Details |
|-------|------|---------|
| recipient | ObjectId → User | Required |
| recipientType | String (enum) | admin, user, seller |
| type | String (enum) | info, success, warning, error |
| title / message | String | Required |
| isRead | Boolean | Default: false |
| actionUrl | String | Deep link |

**Static Methods:** `createNotification()`, `markAllAsRead()`, `getUnreadCount()`

---

### 6.18 Order (`order`)

Core order model with full lifecycle tracking.

| Field | Type | Details |
|-------|------|---------|
| orderNumber | String | Auto-generated: `mallofcayman-XXXXX` |
| cart | Array | Required — items with product data |
| shippingAddress | Object | Required |
| user | Object | Required — customer info |
| shopId / shopName | String | Seller identification |
| totalPrice / subTotalPrice / shippingPrice / discountPrice / tax | Number | Price breakdown |
| deliveryMethod | String (enum) | COLLECT or DELIVERY |
| deliveryDistrict | Object | {districtId, districtName, districtCode} |
| deliveryFeeAmount | Number | Calculated delivery charge |
| deliveryProviderType | String | VENDOR or MALL |
| status | String | Default: "Processing" |
| statusHistory | Array | [{status, timestamp, note}] |
| trackingNumber / courierPartner | String | Shipping tracking |
| paymentInfo | Object | {id, status, type} |

**Pre-save Hook:** Auto-generates `orderNumber` with format `mallofcayman-XXXXX`

---

### 6.19 Pincode (`pincode`)

Delivery availability by pincode/postal code.

| Field | Type | Details |
|-------|------|---------|
| pincode | String | Required, unique, 6-digit validated |
| state | String | Required |
| deliveryAvailable | Boolean | Default: true |
| estimatedDeliveryDays | Number | 1–30, default: 7 |
| shippingCharge | Number | Default: 50 |
| cashOnDelivery | Boolean | Default: true |
| expressDelivery | Boolean | Default: false |

---

### 6.20 Product (`product`)

Core product model with attributes, reviews, shipping, and approval workflow.

| Field | Type | Details |
|-------|------|---------|
| name / description | String | Required |
| category | ObjectId → Category | Required |
| originalPrice / discountPrice | Number | Pricing |
| stock | Number | Required |
| inventoryAlerts | Object | lowStockThreshold (20), criticalStockThreshold (10) |
| images / videos | Array | [{url, public_id}] |
| reviews | Array | [{user, rating, comment, isVerifiedPurchase, isApprovedByAdmin, vendorReply}] |
| ratings | Number | Average rating |
| shopId / shop | String / Object | Required — seller info |
| shipping | Object | baseShippingRate, weight, dimensions, expressDelivery, restrictions |
| gstConfiguration | Object | GST/tax rates and HSN code |
| attributes | Array | [{name, values[{value, price}], type, hasPriceVariation}] |
| approvalStatus | String (enum) | pending, approved, rejected |

---

### 6.21 ProductAttribute (`productAttribute`)

Empty placeholder schema (attributes stored inline on Product).

---

### 6.22 Property (`property`)

Real estate property listings.

| Field | Type | Details |
|-------|------|---------|
| title | String | Required, max 200 |
| slug | String | Auto-generated unique |
| price | Number | Required |
| listingType | String | sale or rent |
| propertyType | String (enum) | house, apartment, land, villa, commercial, office, townhouse, condo, other |
| sqft / bedrooms / bathrooms / garage | Number | Property specs |
| location | Object | address, city, district, country, zipCode, lat/lng |
| images | Array | [{url, publicId}] |
| features | Array of String | Feature list |
| status | String | active, sold, rented, inactive |

---

### 6.23 PropertyLead (`propertylead`)

Customer inquiries for real estate properties.

| Field | Type | Details |
|-------|------|---------|
| name / email / phone / message | String | Required |
| property | ObjectId → Property | Required |
| inquiryType | String (enum) | details, visit, general |
| status | String (enum) | new, contacted, qualified, closed |

---

### 6.24 ShippingCalculation (`shippingcalculation`)

Cached shipping rate calculations with Google Maps integration.

| Field | Type | Details |
|-------|------|---------|
| orderId / shopId / userId | String/ObjectId | Required identifiers |
| origin / destination | Object | {address, latitude, longitude, pincode} |
| distance / duration / durationInTraffic | Object | Google Maps data |
| calculation | Object | baseRate, distanceRate, peakHourMultiplier, weightMultiplier, etc. |
| expiresAt | Date | TTL 24 hours |

---

### 6.25 ShippingConfig (`shippingconfig`)

Per-vendor shipping rate configuration.

| Field | Type | Details |
|-------|------|---------|
| shopId | ObjectId → Shop | Required, unique |
| baseRate | Number | Default: 50 |
| perKmRate | Number | Default: 5 |
| freeShippingThreshold | Number | Default: 999 |
| maxDeliveryDistance | Number | Default: 100km |
| peakHourMultiplier | Number | Default: 1.2 |
| weightBasedPricing | Object | {enabled, baseWeight, additionalWeightRate} |
| expressDelivery | Object | {enabled, multiplier} |
| location | Object | Shop's origin address with lat/lng |
| serviceAreas | Array | [{pincode, area, district, customRate}] |

---

### 6.26 Shop (`shop`)

Core vendor/seller model.

| Field | Type | Details |
|-------|------|---------|
| name / email / password | String | Required |
| avatar | Object | {url, public_id} |
| tradeLicenses | Array | [{url, public_id, originalName, uploadedAt}] — optional |
| address / phoneNumber / zipCode | String/Number | Required |
| paypalEmail | String | Required, email validated |
| bankAccountDetails | Object | accountHolderName, accountNumber, bankName, ifscCode, accountType |
| availableBalance | Number | Default: 0 |
| approvalStatus | String (enum) | pending, approved, rejected |
| subscriptionPlan | String (enum) | free, bronze, silver, gold, revenue-share |
| currentSubscription | ObjectId → Subscription | Active subscription reference |
| revenueShare | Object | monthlyMinimum, isPaid, lastPaymentDate, currentMonthRevenue |
| simpleShippingConfig | Object | baseShippingRate, freeShippingThreshold, isShippingEnabled |
| customHtml / customCss | String | Shop page customization (50k/20k char limits) |
| storeManagerService | ObjectId → StoreManagerService | Linked store manager |
| storeSettings | Object | SEO, payment, policies, notification settings |
| isBanned | Boolean | Default: false |
| isInHouseStore | Boolean | Default: false |
| adFeeExempt | Boolean | Default: false |

**Pre-save Hook:** Hashes password with bcrypt
**Instance Methods:** `getJwtToken()`

---

### 6.27 SiteSettings (`sitesettings`)

Global platform configuration (single active document).

| Field | Type | Details |
|-------|------|---------|
| branding | Object | favicon, themeColor, metaDescription, siteTitle |
| currency | Object | code (enum), symbol, position, decimalPlaces, separators |
| footerAddress | Object | Physical mall address details |
| companyInfo | Object | name, description, website |
| socialMedia | Object | facebook, twitter, instagram, linkedin, youtube |
| businessHours | Object | weekdays, weekends |
| paymentSettings | Object | PayPal/Stripe/COD toggles, keys, tax rate, commission rate |

**Pre-save Hook:** Ensures only one active settings document

---

### 6.28 StoreManager (`storemanagerservice`)

Store Manager service subscription per shop.

| Field | Type | Details |
|-------|------|---------|
| shop | ObjectId → Shop | Required, unique |
| serviceStatus | String (enum) | inactive, active, expired, suspended |
| purchaseInfo | Object | amount (default $100), paymentMethod, paypalOrderId |
| assignedManager | ObjectId → User | The assigned store_manager user |
| managerHistory | Array | [{user, action, actionDate, actionBy, reason}] |
| autoRenew | Boolean | Default: false |

**Instance Methods:** `isServiceActive()`, `isExpired()`, `getDaysRemaining()`, `hasManager()`
**Static Methods:** `updateExpiredSubscriptions()`

---

### 6.29 StoreManagerAdvertisement (`storemanageradvertisement`)

In-store advertisements created by store managers.

| Field | Type | Details |
|-------|------|---------|
| shopId | ObjectId → Shop | Required |
| createdBy | ObjectId → User | Required |
| adType | String (enum) | store_banner, store_sidebar, product_highlight, store_announcement, seasonal_promo, clearance_sale, new_arrival, flash_deal |
| title / description | String | Required / optional |
| image / video | Object | {url, public_id} |
| linkUrl | String | Required |
| productId | ObjectId → Product | Optional product reference |
| startDate / endDate | Date | Required |
| status | String (enum) | draft, pending, active, paused, expired, cancelled |
| priority | Number | 0–10 |
| targetAudience | String (enum) | all, new_customers, returning_customers |
| views / clicks / clickThroughRate | Number | Analytics |

---

### 6.30 Subscription (`subscription`)

Active seller subscription records.

| Field | Type | Details |
|-------|------|---------|
| shop | ObjectId → Shop | Required |
| plan | String | Required (plan name) |
| maxProducts | Number | Product listing limit |
| features | Object | businessProfile, logo, pdfUpload, imagesPerProduct, videoOption, contactSeller, htmlCssEditor, adPreApproval |
| monthlyPrice / finalPrice | Number | Required |
| billingCycle | String (enum) | monthly, 3-months, 6-months, 12-months |
| status | String (enum) | pending, active, expired, cancelled, suspended |
| startDate / endDate | Date | Subscription period |
| paymentMethod | String | Default: paypal |
| paypalSubscriptionId / stripeSessionId | String | Payment references |
| paymentHistory | Array | [{amount, date, status, transactionId}] |

---

### 6.31 SubscriptionPlan (`subscriptionplan`)

Admin-configurable subscription plan definitions.

| Field | Type | Details |
|-------|------|---------|
| planKey | String | Required, unique, lowercase |
| name | String | Required |
| monthlyPrice | Number | Required |
| maxProducts | Number | Required |
| features | Object | Feature flags matching Subscription.features |
| isActive | Boolean | Default: true |
| sortOrder | Number | Display order |

---

### 6.32 User (`user`)

Customer, admin, and staff user accounts.

| Field | Type | Details |
|-------|------|---------|
| name / email / password | String | Required |
| phoneNumber | Number | Optional |
| addresses | Array | [{country, city, address1, address2, zipCode, addressType, lat, lng}] |
| role | String (enum) | User, Supplier, Admin, SubAdmin, Manager, store_manager |
| managedShop | ObjectId → Shop | For store_manager role |
| permissions | Object | 13 granular permission flags |
| avatar | Object | {url, public_id} |
| isBanned | Boolean | Default: false |
| roleChangedAt | Date | Forces re-login on role change |

**Pre-save Hook:** Hashes password
**Instance Methods:** `getJwtToken()`, `comparePassword()`

---

### 6.33 VendorDeliveryConfig (`vendordeliveryconfig`)

Per-vendor district-based delivery configuration.

| Field | Type | Details |
|-------|------|---------|
| shopId | ObjectId → Shop | Required, unique |
| deliveryEnabled | Boolean | Default: false |
| deliveryProviderType | String | VENDOR or MALL |
| districtFees | Array | [{districtId, districtName, districtCode, fee, isAvailable, estimatedDays}] |
| defaultDeliveryFee | Number | Default: 0 |
| freeDeliveryThreshold | Number | Optional |
| pickupEnabled | Boolean | Default: true |
| pickupAddress / pickupInstructions | String | In-store pickup info |

**Static Methods:** `getByShopId()`, `canDeliverToDistrict()`, `getDeliveryFee()`

---

### 6.34 VideoBanner (`videobanner`)

Video banners displayed on homepage with approval workflow.

| Field | Type | Details |
|-------|------|---------|
| title | String | Required, max 100 |
| videoUrl / thumbnailUrl | String | Required |
| productId | ObjectId → Product | Required |
| shopId | ObjectId → Shop | null = admin-created |
| isActive | Boolean | Default: false |
| priority | Number | 1–10 |
| approvalStatus | String (enum) | pending, approved, rejected |
| views / clicks | Number | Analytics |

**Pre-save Hook:** Seller banners start as pending; only approved banners can be active

---

### 6.35 VideoCall (`videocall`)

Video call session records between customers and sellers.

| Field | Type | Details |
|-------|------|---------|
| callId | String | Required, unique |
| seller | ObjectId → Shop | Required |
| customer | ObjectId → User | Required |
| orderId | ObjectId → Order | Optional — for order support |
| productId | ObjectId → Product | Optional — for product inquiries |
| callType | String (enum) | order_support, product_inquiry, general_support, sales |
| status | String (enum) | initiated, ringing, accepted, declined, ended, missed, failed |
| initiatedBy | String | seller or customer |
| startTime / endTime | Date | Call timing |
| duration | Number | Seconds |
| callQuality | String | excellent, good, fair, poor |
| metadata | Object | Device info, network info, locations |

---

### 6.36 Withdraw (`withdraw`)

Seller withdrawal requests for available balance.

| Field | Type | Details |
|-------|------|---------|
| seller | Object | Required — seller info snapshot |
| amount | Number | Required |
| status | String (enum) | Processing, succeed, failed, payout_initiated, payout_completed, payout_failed |
| payoutMethod | String (enum) | bank, upi, paypal, manual |
| paypalPayoutBatchId / paypalPayoutItemId | String | PayPal payout references |
| payoutStatus | String | pending, completed, failed |
| payoutError | String | Error details |

---

## 7. Authentication & Authorization

### Authentication Flow

The platform uses **JWT tokens stored in HTTP-only cookies** with separate tokens for users and sellers:

| Token | Cookie Name | Purpose |
|-------|------------|---------|
| User Token | `token` | Customer / Admin / SubAdmin / Manager / StoreManager |
| Seller Token | `seller_token` | Seller / Shop access |

### Auth Middleware Stack (`backend/middleware/auth.js`)

| Middleware | Purpose |
|-----------|---------|
| `isAuthenticated` | Validates user JWT, checks ban status, blocks Suppliers from user login |
| `isSeller` | Validates seller JWT, checks role compatibility, allows banned sellers dashboard access |
| `isSellerNotBanned` | Blocks banned sellers from operational actions |
| `isSellerApproved` | Blocks pending/rejected sellers from operations |
| `isAdmin(...roles)` | Validates admin-level role (Admin, SubAdmin, Manager) |
| `requirePermission(perm)` | Checks specific RBAC permission |
| `requireAnyPermission([perms])` | Checks if user has at least one of the listed permissions |
| `isStoreManager` | Validates store_manager role and assigned shop |

### Security Features

- Passwords hashed with **bcrypt** (pre-save hooks on User and Shop models)
- JWT tokens include user/shop ID, verified with `JWT_SECRET_KEY`
- Role change detection: `roleChangedAt` field forces re-authentication
- Ban system with reason tracking for both users and sellers
- Cookie-based auth (not localStorage) for XSS protection
- CORS configured with explicit allowed origins

---

## 8. Role-Based Access Control (RBAC)

### User Roles

| Role | Scope | Description |
|------|-------|-------------|
| **User** | Frontend | Regular customer — browse, buy, review |
| **Supplier** | Shop Dashboard | Seller/vendor — manages shop via seller_token |
| **Admin** | Admin Panel | Full platform access |
| **SubAdmin** | Admin Panel | Approval-focused: vendors, products, ads, reviews |
| **Manager** | Admin Panel | Operations-focused: orders, products, categories, users |
| **store_manager** | Store Manager Panel | Manages assigned shop on behalf of seller |

### Permission Matrix

| Permission | Admin | SubAdmin | Manager | User | Supplier |
|-----------|-------|----------|---------|------|----------|
| canApproveVendors | ✅ | ✅ | ❌ | ❌ | ❌ |
| canApproveProducts | ✅ | ✅ | ❌ | ❌ | ❌ |
| canApproveAds | ✅ | ✅ | ❌ | ❌ | ❌ |
| canModerateReviews | ✅ | ✅ | ❌ | ❌ | ❌ |
| canManageOrders | ✅ | ❌ | ✅ | ❌ | ❌ |
| canManageProducts | ✅ | ❌ | ✅ | ❌ | ❌ |
| canManageCoupons | ✅ | ❌ | ✅ | ❌ | ❌ |
| canManageCategories | ✅ | ❌ | ✅ | ❌ | ❌ |
| canManageUsers | ✅ | ❌ | ✅ | ❌ | ❌ |
| canManageVendors | ✅ | ❌ | ✅ | ❌ | ❌ |
| canViewAnalytics | ✅ | ✅ | ✅ | ❌ | ❌ |
| canManageContent | ✅ | ❌ | ✅ | ❌ | ❌ |
| canAccessSetup | ✅ | ❌ | ❌ | ❌ | ❌ |

### Custom Permissions

Admins can override default permissions per user via the `permissions` field on the User model. Custom permissions take precedence over role defaults.

---

## 9. API Endpoints

### User APIs (`/api/v2/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-user` | Public | Register new user |
| POST | `/activation` | Public | Activate via email token |
| POST | `/login-user` | Public | Login |
| GET | `/getuser` | isAuthenticated | Get current user |
| GET | `/logout` | — | Logout |
| PUT | `/update-user-info` | isAuthenticated | Update profile |
| PUT | `/update-avatar` | isAuthenticated | Update avatar |
| PUT | `/update-user-addresses` | isAuthenticated | Add/update address |
| DELETE | `/delete-user-address/:id` | isAuthenticated | Delete address |
| PUT | `/update-user-password` | isAuthenticated | Change password |
| POST | `/forgot-password` | Public | Request password reset |
| PUT | `/reset-password/:token` | Public | Reset with token |
| GET | `/admin-all-users` | isAuthenticated + isAdmin | List all users |
| DELETE | `/delete-user/:id` | isAuthenticated + isAdmin | Delete user |

### Shop APIs (`/api/v2/shop`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-shop` | Public | Register new seller |
| POST | `/activation` | Public | Activate seller |
| POST | `/login-shop` | Public | Seller login |
| GET | `/getSeller` | isSeller | Get current seller |
| GET | `/logout` | — | Seller logout |
| GET | `/get-shop-info/:id` | Public | Get shop public info |
| PUT | `/update-shop-avatar` | isSeller | Update shop avatar |
| PUT | `/update-seller-info` | isSeller | Update shop info |
| GET | `/admin-all-sellers` | isAuthenticated + isAdmin | List all sellers |
| GET | `/admin-pending-sellers` | isAuthenticated | Pending sellers |
| POST | `/admin-approve-seller/:id` | isAuthenticated | Approve seller |
| POST | `/admin-reject-seller/:id` | isAuthenticated | Reject seller |
| PUT | `/admin-ban-seller/:id` | isAuthenticated + isAdmin | Ban seller |
| PUT | `/admin-unban-seller/:id` | isAuthenticated + isAdmin | Unban seller |
| DELETE | `/delete-seller/:id` | isAuthenticated + isAdmin | Delete seller |

### Product APIs (`/api/v2/product`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-product` | isSeller | Create product |
| GET | `/get-all-products-shop/:id` | Public | Shop's products |
| GET | `/get-all-products` | Public | All marketplace products |
| PUT | `/update-shop-product/:id` | isSeller | Update product |
| DELETE | `/delete-shop-product/:id` | isSeller | Delete product |
| PUT | `/admin-approve-product/:id` | isAuthenticated + isAdmin | Approve product |
| PUT | `/admin-reject-product/:id` | isAuthenticated + isAdmin | Reject product |

### Order APIs (`/api/v2/order`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-order` | isAuthenticated | Create new order |
| GET | `/get-all-orders/:userId` | isAuthenticated | User's orders |
| GET | `/get-seller-all-orders/:shopId` | isSeller | Seller's orders |
| GET | `/admin-all-orders` | isAuthenticated + isAdmin | All orders |
| PUT | `/update-order-status/:id` | isSeller | Update status |

### Payment APIs (`/api/v2/payment`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/process` | isAuthenticated | Create Stripe PaymentIntent |
| POST | `/stripe/webhook` | — (raw body) | Stripe webhook handler |
| GET | `/stripeapikey` | isAuthenticated | Get Stripe publishable key |

### Subscription APIs (`/api/v2/subscription`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/plans` | Public | List subscription plans |
| POST | `/create-checkout-session` | isSeller | Create payment session |
| POST | `/verify-payment` | isSeller | Verify and activate |
| GET | `/current` | isSeller | Current subscription |

---

## 10. Frontend Architecture

### Core Technologies

- **React 18.2** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router DOM 6** for client-side routing
- **Tailwind CSS 3.3** + **Material UI 4.12** for styling
- **Socket.io Client** for real-time features
- **Axios** for HTTP requests

### Component Organization

```
frontend/src/
├── components/
│   ├── Admin/                   # ~50 admin components
│   │   ├── AdminDashboardMain.jsx
│   │   ├── AllUsers.jsx
│   │   ├── AllSellers.jsx
│   │   ├── PendingSellers.jsx
│   │   ├── AllOrders.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── AllProducts.jsx
│   │   ├── PendingProducts.jsx
│   │   ├── BannerManagement.jsx
│   │   ├── CategoryManagement.jsx
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── SiteSettingsManager.jsx
│   │   ├── EmailTemplateEditor.jsx
│   │   ├── LegalPageManager.jsx
│   │   ├── FAQManager.jsx
│   │   ├── BlogManager.jsx
│   │   ├── DistrictManagement.jsx
│   │   ├── AdvertisementManagement.jsx
│   │   ├── SubscriptionManagement.jsx
│   │   ├── StaffManagement.jsx
│   │   ├── VideoBannerManagement.jsx
│   │   └── ...
│   ├── Shop/                    # ~40 seller components
│   │   ├── ShopCreate.jsx
│   │   ├── ShopCreateWithSubscription.jsx
│   │   ├── DashboardHero.jsx
│   │   ├── AllProducts.jsx
│   │   ├── CreateProduct.jsx
│   │   ├── EditProduct.jsx
│   │   ├── AllOrders.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── AllEvents.jsx
│   │   ├── ShopSettings.jsx
│   │   ├── ShopProfileData.jsx
│   │   ├── WithDrawMoney.jsx
│   │   ├── ShippingManagement.jsx
│   │   └── ...
│   ├── StoreManager/            # ~15 store manager components
│   │   ├── SMDashboard.jsx
│   │   ├── SMProducts.jsx
│   │   ├── SMCreateProduct.jsx
│   │   ├── SMOrders.jsx
│   │   ├── SMOrderDetails.jsx
│   │   ├── SMInventoryAlerts.jsx
│   │   └── ...
│   ├── Layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── AdminHeader.jsx
│   │   ├── AdminSideBar.jsx
│   │   └── DashboardSideBar.jsx
│   ├── Checkout/
│   │   ├── Checkout.jsx
│   │   ├── CheckoutSteps.jsx
│   │   └── DeliveryChoice.jsx
│   ├── Products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductDetails.jsx
│   │   └── SuggestedProduct.jsx
│   ├── VideoCall/
│   │   ├── VideoCallComponent.jsx
│   │   └── IncomingCallNotification.jsx
│   └── Route/                   # Route protection
│       ├── ProtectedRoute.js
│       ├── ProtectedAdminRoute.js
│       ├── SellerProtectedRoute.js
│       ├── SellerSubscriptionProtectedRoute.js
│       ├── StoreManagerProtectedRoute.js
│       └── BanProtection.js
├── pages/                       # 80+ page components
├── redux/
│   ├── store.js
│   ├── actions/
│   └── reducers/
├── hooks/
├── context/
├── contexts/
├── services/
├── utils/
└── static/
```

---

## 11. State Management (Redux)

### Redux Store — 9 Slices

#### 1. User Reducer

| State | Type | Description |
|-------|------|-------------|
| isAuthenticated | Boolean | Login status |
| user | Object | Current user data |
| loading | Boolean | Request loading state |
| addressloading | Boolean | Address operation loading |
| successMessage | String | Success feedback |
| error | String | Error messages |

**Key Actions:** `loadUser()`, `logoutUser()`, `updateUserInformation()`, `updateUserAddress()`, `getAllUsers()`, `checkBanStatus()`

#### 2. Seller Reducer

| State | Type | Description |
|-------|------|-------------|
| isSeller | Boolean | Seller auth flag |
| seller | Object | Current seller/shop data |
| sellers | Array | All sellers (admin view) |
| pendingSellers | Array | Pending approval |
| sellerStats | Object | Dashboard statistics |

**Key Actions:** `getAllSellers()`, `getPendingSellers()`, `getSellerStats()`

#### 3. Product Reducer

| State | Type | Description |
|-------|------|-------------|
| product | Object | Single product |
| products | Array | Shop products |
| allProducts | Array | All marketplace products |
| success | Boolean | Operation result |

**Key Actions:** `createProduct()`, `getAllProductsShop()`, `getAllProducts()`, `getSingleProduct()`, `deleteProduct()`, `updateProduct()`

#### 4. Cart Reducer

| State | Persisted To |
|-------|-------------|
| cart (Array) | localStorage ("cartItems") |

**Actions:** `addTocart()`, `removeFromCart()`

#### 5. Wishlist Reducer

| State | Persisted To |
|-------|-------------|
| wishlist (Array) | localStorage ("wishlistItems") |

**Actions:** `addToWishlist()`, `removeFromWishlist()`

#### 6. Order Reducer

| State | Type |
|-------|------|
| orders | Array — User/seller orders |
| adminOrders | Array — All orders (admin) |

**Actions:** `getAllOrdersOfUser()`, `getAllOrdersOfShop()`, `getAllOrdersOfAdmin()`

#### 7. Event Reducer

| State | Type |
|-------|------|
| events | Array — Shop events |
| allEvents | Array — All events |
| adminEvents | Array — Admin view |

**Actions:** `createevent()`, `getAllEventsShop()`, `getAllEvents()`, `deleteEvent()`

#### 8. Category Reducer

| State | Type |
|-------|------|
| categories | Array |
| subcategories | Array |
| categoryTree | Array (nested) |
| totalPages / currentPage | Number |

**Actions:** `getAllCategoriesPublic()`, `getRootCategoriesPublic()`, `getSubcategoriesPublic()`, `getAllCategories()`

#### 9. Notification Reducer

| State | Type |
|-------|------|
| notifications | Array |
| unreadCount | Number |

**Actions:** `getAllNotifications()`, `getUnreadCount()`, `markNotificationAsRead()`, `markAllNotificationsAsRead()`, `deleteNotification()`

---

## 12. Frontend Routing

### Public Routes

| Path | Page Component |
|------|---------------|
| `/` | HomePage |
| `/login` | LoginPage |
| `/sign-up` | SignupPage |
| `/forgot-password` | UserForgotPasswordPage |
| `/reset-password/:token` | UserResetPasswordPage |
| `/activation/:activation_token` | ActivationPage |
| `/products` | ProductsPage |
| `/product/:id` | ProductDetailsPage |
| `/best-selling` | BestSellingPage |
| `/events` | EventsPage |
| `/faq` | FAQPage |
| `/contact` | ContactPage |
| `/blog` | BlogPage |
| `/blog/:slug` | BlogDetailPage |
| `/about` | AboutUsPage |
| `/real-estate` | RealEstatePage |
| `/real-estate/:slug` | PropertyDetailsPage |
| `/terms` | TermsOfServicePage |
| `/buyer-terms` | BuyerTermsOfServicePage |
| `/seller-terms` | SellerTermsOfServicePage |
| `/privacy` | PrivacyPolicyPage |
| `/refund` | RefundPolicyPage |
| `/shipping` | ShippingPolicyPage |

### Protected Customer Routes (Require Auth + Ban Check)

| Path | Page Component |
|------|---------------|
| `/checkout` | CheckoutPage |
| `/profile` | ProfilePage |
| `/payment` | PaymentPage |
| `/order/success` | OrderSuccessPage |
| `/stripe/order-success` | StripeOrderSuccessPage |

### Seller Routes (Require Seller Auth)

| Path | Page Component |
|------|---------------|
| `/shop/create` | ShopCreate |
| `/shop/login` | ShopLoginPage |
| `/shop/dashboard` | ShopDashboardPage |
| `/shop/products` | ShopAllProducts |
| `/shop/create-product` | ShopCreateProduct |
| `/shop/edit-product/:id` | ShopEditProductPage |
| `/shop/orders` | ShopAllOrders |
| `/shop/order/:id` | ShopOrderDetails |
| `/shop/refunds` | ShopAllRefunds |
| `/shop/events` | ShopAllEvents |
| `/shop/coupons` | ShopAllCoupouns |
| `/shop/settings` | ShopSettingsPage |
| `/shop/inbox` | ShopInboxPage |
| `/shop/withdraw` | ShopWithDrawMoneyPage |
| `/shop/shipping` | ShippingManagementPage |
| `/shop/gst` | SellerGSTSettingsPage |
| `/shop/video-calls` | ShopVideoCallsPage |
| `/shop/advertisements` | ShopAllAdvertisements |
| `/shop/create-advertisement` | ShopCreateAdvertisement |
| `/shop/ad-pricing` | ShopAdvertisementPricing |
| `/shop/ad-payment` | ShopAdvertisementPayment |
| `/shop/subscriptions` | SubscriptionPlansPage |

### Admin Routes (Require Admin Auth)

| Path | Page Component |
|------|---------------|
| `/admin/dashboard` | AdminDashboardPage |
| `/admin/users` | AdminDashboardUsers |
| `/admin/sellers` | AdminDashboardSellers |
| `/admin/pending-sellers` | AdminDashboardPendingSellers |
| `/admin/orders` | AdminDashboardOrders |
| `/admin/order/:id` | AdminOrderDetailsPage |
| `/admin/products` | AdminDashboardProducts |
| `/admin/pending-products` | AdminDashboardPendingProducts |
| `/admin/events` | AdminDashboardEvents |
| `/admin/withdraw` | AdminDashboardWithdraw |
| `/admin/banners` | AdminDashboardBanner |
| `/admin/categories` | AdminDashboardCategories |
| `/admin/analytics` | AdminAnalyticsPage |
| `/admin/reviews` | AdminReviewsPage |
| `/admin/settings` | AdminSiteSettingsPage |
| `/admin/email-templates` | AdminDashboardEmailTemplates |
| `/admin/legal` | AdminDashboardLegalPages |
| `/admin/faq` | AdminFAQPage |
| `/admin/blog` | AdminBlogPage |
| `/admin/real-estate` | AdminRealEstatePage |
| `/admin/leads` | AdminLeadsPage |
| `/admin/in-house-stores` | AdminInHouseStoresPage |
| `/admin/currency` | AdminCurrencySettingsPage |
| `/admin/districts` | AdminDistrictManagementPage |
| `/admin/ads` | AdminAdvertisementsPage |
| `/admin/ad-plans` | AdminAdPlanManagementPage |
| `/admin/subscriptions` | AdminSubscriptionsPage |
| `/admin/plans` | AdminPlanManagementPage |
| `/admin/video-banners` | AdminVideoBannersPage |
| `/admin/staff` | AdminDashboardStaff |
| `/admin/store-manager` | AdminStoreManagerPage |

### Store Manager Routes

| Path | Page Component |
|------|---------------|
| `/store-manager/dashboard` | StoreManagerDashboardPage |
| `/store-manager/products` | SMProductsPage |
| `/store-manager/create-product` | SMCreateProductPage |
| `/store-manager/edit-product/:id` | SMEditProductPage |
| `/store-manager/orders` | SMOrdersPage |
| `/store-manager/order/:id` | SMOrderDetailsPage |
| `/store-manager/inventory` | SMInventoryPage |
| `/store-manager/advertisements` | SMAdvertisementsPage |
| `/store-manager/create-advertisement` | SMCreateAdvertisementPage |
| `/store-manager/edit-advertisement/:id` | SMEditAdvertisementPage |
| `/store-manager/homepage-ads` | SMHomepageAdsPage |
| `/store-manager/create-homepage-ad` | SMCreateHomepageAdPage |
| `/store-manager/homepage-ad-payment` | SMHomepageAdPaymentPage |
| `/store-manager/homepage-ad-analytics` | SMHomepageAdAnalyticsPage |
| `/store-manager/ad-plans` | SMAdPlanManagementPage |

---

## 13. Real-Time Features (Socket.io)

### Socket Server Architecture (`socket/index.js`)

The socket server runs independently on port 4000 and manages:
- **User Presence** — Tracks online users with `{userId, socketId}` pairs
- **Real-Time Messaging** — Direct messaging between customers and sellers
- **Order Tracking** — Live order status updates and delivery tracking
- **Video Calls** — WebRTC signaling for video call setup
- **Periodic Cleanup** — Hourly cleanup of stale data (messages > 24h, orders > 7d, calls > 2h)

### Socket Events

#### User Presence
| Event | Direction | Payload |
|-------|-----------|---------|
| `addUser` | Client → Server | `userId` |
| `getUsers` | Server → All | `users[]` |
| `userOnlineStatusChanged` | Server → All | `{userId, isOnline, timestamp}` |

#### Messaging
| Event | Direction | Payload |
|-------|-----------|---------|
| `sendMessage` | Client → Server | `{senderId, receiverId, text, images}` |
| `getMessage` | Server → Client | Message object with `seen: false` |
| `messageSeen` | Bidirectional | `{senderId, receiverId, messageId}` |
| `updateLastMessage` | Client → Server | `{lastMessage, lastMessagesId}` |
| `getLastMessage` | Server → All | Last message update |

#### Order Tracking
| Event | Direction | Payload |
|-------|-----------|---------|
| `orderStatusChanged` | Client → Server | `{orderId, status, shopId, timestamp}` |
| `orderStatusUpdate` | Server → All | Status update broadcast |
| `joinOrderTracking` | Client → Server | `{orderId, userId, userType}` |
| `deliveryLocationBroadcast` | Client → Server | `{orderId, location, speed, estimatedArrival}` |
| `deliveryLocationUpdate` | Server → Room | Location data |
| `deliveryPathUpdate` | Server → Room | Path waypoints |

#### Video Calls (WebRTC Signaling)
| Event | Direction | Payload |
|-------|-----------|---------|
| `incomingVideoCall` | Client → Server → Client | Call data with routing |
| `joinVideoCall` | Client → Server | `{callId, userId, userType}` |
| `leaveVideoCall` | Client → Server | `{callId, userId}` |
| `offer` | Client → Server → Client | WebRTC SDP offer |
| `answer` | Client → Server → Client | WebRTC SDP answer |
| `ice-candidate` | Client → Server → Room | ICE candidate |
| `callStatusUpdate` | Bidirectional | `{callId, status, userId}` |
| `endVideoCall` | Client → Server → Room | `{callId, userId, reason}` |
| `toggleAudio` / `toggleVideo` | Bidirectional | Media control |
| `startScreenShare` / `stopScreenShare` | Bidirectional | Screen sharing |
| `callTargetOffline` | Server → Client | Target user not available |
| `callQualityReport` | Client → Server | Quality metrics |

### In-Memory Data Stores

| Store | Purpose | Cleanup |
|-------|---------|---------|
| `users[]` | Online user tracking | On disconnect |
| `messages{}` | Recent messages by recipient | 24-hour TTL |
| `orderTracking{}` | Order status cache | 7-day TTL |
| `videoCalls{}` | Active video call sessions | 2-hour TTL or on empty |

---

## 14. Payment Systems

### Supported Payment Gateways

| Gateway | Usage | Integration |
|---------|-------|-------------|
| **Stripe** | Card payments, checkout sessions | Server-side PaymentIntent + React Elements |
| **PayPal** | Checkout payments + seller payouts | Client SDK + Server Payout API |
| **PhonePe** | India market payments | Server-side redirect flow |
| **COD** | Cash on Delivery | Admin toggle via SiteSettings |

### Stripe Integration

- **Server:** Creates PaymentIntent via `stripe.paymentIntents.create()`
- **Webhook:** `/api/v2/payment/stripe/webhook` handles `checkout.session.completed` and `payment_intent.payment_failed`
- **Frontend:** Uses `@stripe/react-stripe-js` Elements for card collection
- **Subscription Payments:** Stripe Checkout Sessions for seller subscriptions

### PayPal Integration

- **Customer Payments:** `@paypal/react-paypal-js` for checkout
- **Seller Payouts:** Server-side PayPal Payouts API via `utils/paypalPayout.js`
- **Seller Registration:** PayPal email required for payout configuration

### Payment Flow

```
Customer → Checkout → Select Payment Method
  ├── Stripe → PaymentIntent → Card Element → Confirm → Order Created
  ├── PayPal → PayPal SDK → Approve → Capture → Order Created
  ├── PhonePe → Redirect → Payment → Callback → Order Created
  └── COD → Direct Order → Admin processes payment manually
```

---

## 15. Order Lifecycle & Delivery

### Order Status Flow

```
Processing → Transferred to delivery partner → Shipping → Delivered
                                                    └──→ Processing refund → Refund Success
```

### Delivery Methods

| Method | Description |
|--------|-------------|
| **COLLECT** | In-store pickup at seller's location |
| **DELIVERY** | District-based delivery to customer address |

### Delivery Provider Types

| Type | Description |
|------|-------------|
| **VENDOR** | Seller arranges own delivery |
| **MALL** | Mall-managed delivery service |

### Order Number Format

Auto-generated: `mallofcayman-XXXXX` (5-digit random number appended)

### Status History

Every status change is recorded in `statusHistory[]` with timestamp and optional notes.

---

## 16. Subscription & Commission System

### Subscription Plans

| Plan | Description |
|------|-------------|
| free | Basic listing with limited features |
| bronze | Entry-level paid plan |
| silver | Mid-tier with more product slots |
| gold | Premium with all features |
| revenue-share | Commission-based model |

### Plan Features

Each plan controls:
- `maxProducts` — Product listing limit
- `businessProfile` — Enhanced shop page
- `logo` — Custom shop logo
- `pdfUpload` — Trade license upload
- `imagesPerProduct` — Image slots per product
- `videoOption` — Video upload capability
- `contactSeller` — Customer video call feature
- `htmlCssEditor` — Custom shop page HTML/CSS
- `adPreApproval` — Advertisements auto-approved

### Billing Cycles

Monthly, 3-months, 6-months, 12-months with discount percentages.

### Commission System

- Default platform commission: **10%** per order
- Minimum monthly vendor payment: **$25**
- Commission tracked per order in the Commission model
- Vendor payouts via PayPal Payouts API

---

## 17. Advertisement System

### Ad Types & Pricing

| Type | Description | Placement |
|------|-------------|-----------|
| leaderboard | Wide banner | Top of homepage |
| top_sidebar | Sidebar banner | Homepage sidebar top |
| right_sidebar_top/middle/bottom | Sidebar positions | Homepage sidebar |
| featured_store | Store highlight | Homepage featured section |
| featured_product | Product highlight | Homepage featured section |
| newsletter_inclusion | Newsletter ad | Email newsletter |
| editorial_writeup | Sponsored content | Blog/editorial section |

### Ad Lifecycle

```
Create Ad → Awaiting Payment → Payment Completed → Pending Review
  → Approved → Active (tracking views/clicks) → Expired
  → Auto-Renew → Active (new cycle)
```

### Cron Jobs

- **Daily at midnight:** Check for expiring ads, send warning emails, mark expired
- **Daily at 1 AM:** Process auto-renewals for eligible ads

### Store Manager Advertisements

Store managers can create shop-specific ads:
- store_banner, store_sidebar, product_highlight
- store_announcement, seasonal_promo, clearance_sale
- new_arrival, flash_deal

---

## 18. Seller Approval Workflow

### Registration Flow

```
1. Seller fills registration form (name, email, password, address, avatar)
   - Trade License upload: OPTIONAL
2. Activation email sent with JWT token
3. Seller clicks activation link → Account created with approvalStatus: "pending"
4. Admin sees seller in Pending Sellers dashboard
5. Admin reviews and:
   a. Approves → approvalStatus: "approved", email notification sent
   b. Rejects → approvalStatus: "rejected" with reason, email notification sent
6. Approved seller can access full dashboard functionality
```

### Approval Status States

| Status | Can Login | Can Operate |
|--------|-----------|-------------|
| pending | ✅ (limited) | ❌ |
| approved | ✅ | ✅ |
| rejected | ✅ (see reason) | ❌ |

### Avatar Sanitization

Before saving seller data, the controller sanitizes the `avatar` field:
- If avatar is not an object (e.g., empty string from form), it's set to `undefined`
- This prevents Mongoose validation errors: "Tried to set nested object field `avatar` to primitive value"

---

## 19. Store Manager System

### Service Model

The Store Manager is a paid service ($100) that sellers can purchase:
1. Seller purchases Store Manager Service via PayPal
2. Admin or seller assigns a `store_manager` user
3. Store manager gets limited access to manage the shop

### Capabilities

| Feature | Store Manager Can |
|---------|------------------|
| Products | Create, edit, view |
| Orders | View, update status |
| Inventory | Monitor alerts |
| Advertisements | Create shop-level ads |
| Settings | ❌ No access |
| Financials | ❌ No access |

### Assignment Flow

```
Seller purchases service → StoreManagerService record created
  → User with role "store_manager" assigned
  → User.managedShop set to Shop ID
  → Store manager accesses /store-manager/* routes
```

---

## 20. Shipping & Delivery Configuration

### Three Shipping Systems

#### 1. Simple Shipping (Per Shop)
Stored directly on Shop model:
- `baseShippingRate` — Flat rate
- `freeShippingThreshold` — Free above this amount
- `isShippingEnabled` — Toggle

#### 2. Advanced Shipping Config (ShippingConfig model)
Per-vendor detailed configuration:
- Distance-based pricing with `perKmRate`
- Weight-based pricing tiers
- Peak hour multipliers
- Express delivery options
- Service area restrictions by pincode

#### 3. District-Based Delivery (VendorDeliveryConfig model)
Cayman Islands specific:
- Delivery fees per district
- VENDOR vs MALL delivery provider
- Free delivery thresholds
- Pickup options with address and instructions

### Shipping Utilities

| Utility | Purpose |
|---------|---------|
| `GoogleMapsService` | Calculate distances using Google Maps API |
| `DistanceCalculationService` | Distance-based rate calculation |
| `DynamicShippingService` | Complex rate calculation with multiple factors |
| `EnhancedShippingService` | Full-featured shipping with peak hours, weight, express |

---

## 21. Video Call System

### Architecture

- **Signaling:** Socket.io for WebRTC signaling (offer/answer/ICE)
- **Media:** Browser-to-browser WebRTC for audio/video
- **Records:** VideoCall model stores call logs
- **Blocking:** BlockedCustomer model prevents abusive calls

### Call Flow

```
1. Customer/Seller initiates call → Socket "incomingVideoCall"
2. Server routes to target user's socket
3. Target receives notification → Accept/Decline
4. On accept: Both join call room → Exchange WebRTC SDP offer/answer
5. ICE candidates exchanged for NAT traversal
6. Media streams established
7. Features during call: Audio/Video toggle, Screen sharing, Quality reporting
8. Call ends → Duration calculated, VideoCall record saved
```

### Call Types

| Type | Context |
|------|---------|
| order_support | Help with existing order |
| product_inquiry | Questions about product |
| general_support | General customer service |
| sales | Sales/promotional calls |

---

## 22. Content Management

### Blog System

- Rich text editor (React Quill) for content creation
- Auto-generated slugs and read time calculation
- Category-based organization (news, tips, guide, etc.)
- Draft/Published workflow
- SEO with text indexes on title/content/tags

### Legal Pages

6 configurable legal pages:
1. Buyer Terms of Service
2. Seller Terms of Service
3. Privacy Policy
4. Return & Refund Policy
5. Shipping Policy
6. About Us

Each supports HTML/Markdown/Plain-text with version tracking and optional PDF upload.

### FAQ System

- Categorized FAQ entries (general, ordering, shipping, payment, etc.)
- User voting system (helpful/not helpful) with deduplication
- Admin management with ordering and active/published toggles
- View counting and helpfulness score calculation

### Real Estate Module

- Property listings with full specs (beds, baths, sqft, etc.)
- Cayman Islands focused (default country)
- Property types: house, apartment, land, villa, commercial, etc.
- Lead management system with status tracking (new → contacted → qualified → closed)

---

## 23. Notification System

### Backend Service (`utils/NotificationService.js`)

Creates notifications for various system events:
- New order placed/updated
- Seller approval/rejection
- Withdrawal status changes
- Product approval/rejection
- System announcements

### Notification Model

| Field | Purpose |
|-------|---------|
| recipient | Target user ObjectId |
| recipientType | admin, user, or seller |
| type | info, success, warning, error |
| title + message | Notification content |
| actionUrl | Deep link to relevant page |
| isRead | Read status tracking |

### Frontend Integration

The notification reducer manages:
- Real-time notification fetching
- Unread count badge
- Mark as read (single/all)
- Delete (single/all)
- Pagination support

---

## 24. File Uploads & Media

### Cloudinary Integration

Primary media storage via Cloudinary (`config/cloudinary.js`):
- Product images and videos
- Shop avatars and trade licenses
- Banner images
- Advertisement images and videos
- Blog cover images
- Property images
- Video banner thumbnails

### Multer Configuration

Local file upload middleware (`backend/multer.js`):
- Temporary storage in `uploads/` directory
- Used as intermediate step before Cloudinary upload
- Files cleaned up after successful cloud upload

### Media Types Supported

| Type | Max Size | Used For |
|------|----------|----------|
| Images | 50MB (express.json limit) | Products, avatars, banners, ads |
| Videos | 50MB | Products, video banners, ads |
| PDFs | — | Trade licenses, legal documents, invoices |

---

## 25. Email Template System

### Template Management

Admins can customize transactional email templates via the admin panel:
- HTML templates with `{{variable}}` interpolation
- Configurable styling (colors, fonts, logo, footer)
- Default templates provided, admin can override
- Templates identified by unique slugs

### Template Variables

Each template defines available variables (e.g., `{{shopName}}`, `{{orderNumber}}`, `{{amount}}`).

The `render(variables)` instance method:
1. Replaces all `{{variable}}` placeholders
2. Applies configured styling (primary color, logo, font)
3. Returns final HTML string

### Email Delivery

Uses Nodemailer (`utils/sendMail.js`) with SMTP configuration from environment variables.

---

## 26. Cron Jobs & Scheduled Tasks

| Schedule | Task | Description |
|----------|------|-------------|
| Daily at midnight | `checkExpiringAdvertisements()` | Sends warning emails for soon-to-expire ads |
| Daily at midnight | `markExpiredAdvertisements()` | Updates status of expired ads |
| Daily at 1 AM | `autoRenewAdvertisements()` | Processes auto-renewal for eligible ads |
| Hourly (socket) | Memory cleanup | Cleans stale messages (>24h), orders (>7d), calls (>2h) |

---

## 27. Backend Utilities

| Utility | File | Purpose |
|---------|------|---------|
| ErrorHandler | `utils/ErrorHandler.js` | Custom error class with statusCode |
| sendMail | `utils/sendMail.js` | Nodemailer email sender |
| jwtToken | `utils/jwtToken.js` | JWT token generation for users |
| shopToken | `utils/shopToken.js` | JWT token generation for sellers |
| rolePermissions | `utils/rolePermissions.js` | RBAC permission checks |
| NotificationService | `utils/NotificationService.js` | In-app notification creation |
| pdfGenerator | `utils/pdfGenerator.js` | Invoice PDF generation via Puppeteer |
| currencyFormatter | `utils/currencyFormatter.js` | Multi-currency price formatting |
| GoogleMapsService | `utils/GoogleMapsService.js` | Google Maps distance/geocoding API |
| DistanceCalculationService | `utils/DistanceCalculationService.js` | Distance-based shipping rates |
| DynamicShippingService | `utils/DynamicShippingService.js` | Dynamic shipping rate calculation |
| EnhancedShippingService | `utils/EnhancedShippingService.js` | Full-featured shipping calculator |
| paypalPayout | `utils/paypalPayout.js` | PayPal seller payout processing |
| emailTemplates | `utils/emailTemplates.js` | Default email template HTML |
| socialMediaPost | `utils/socialMediaPost.js` | Social media sharing |
| seedNotifications | `utils/seedNotifications.js` | Seed default notifications |
| migrate-avatars | `utils/migrate-avatars.js` | Avatar migration utility |
| migrate-products | `utils/migrate-products.js` | Product data migration |
| migrateOrderCoordinates | `utils/migrateOrderCoordinates.js` | Order coordinates migration |

---

## 28. Frontend Custom Hooks & Services

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth()` | Current user authentication state and loading |
| `useGoogleTranslate()` | Google Translate widget integration |
| `usePincodeService()` | Pincode validation and delivery check |
| `useShippingService()` | Shipping rate calculation |
| `useSimpleShipping()` | Simple flat-rate shipping logic |
| `useBlog()` | Blog data fetching |
| `useFAQ()` | FAQ data fetching |
| `useLegalPage()` | Legal page content fetching |
| `useSiteSettings()` | Global site settings access |

### Context Providers

| Context | Purpose |
|---------|---------|
| `CurrencyContext` | Multi-currency support (USD, EUR, GBP, INR, KYD, etc.) |
| `SocketProvider` | WebSocket connection management |

### Services

| Service | Purpose |
|---------|---------|
| `geminiService.js` | Gemini AI chatbot integration |
| `videoBannerService.js` | Video banner API wrapper |

### Frontend Utilities

| Utility | Purpose |
|---------|---------|
| `csvExporter.js` | Export data to CSV files |
| `invoiceGenerator.js` | Generate PDF invoices (jspdf) |
| `mediaUtils.js` | Image/video handling |
| `orderUtils.js` | Order processing helpers |

---

## 29. Environment Variables

### Backend Configuration (`backend/config/.env`)

| Variable | Purpose |
|----------|---------|
| PORT | Backend server port (default: 8000) |
| NODE_ENV | Environment (PRODUCTION/development) |
| DB_URL | MongoDB connection string |
| JWT_SECRET_KEY | JWT signing secret |
| JWT_EXPIRES | JWT expiration period |
| CORS_ORIGINS | Comma-separated allowed origins |
| SMTP_HOST | Email SMTP host |
| SMTP_PORT | SMTP port |
| SMTP_MAIL | SMTP email address |
| SMTP_PASSWORD | SMTP password |
| CLOUDINARY_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| STRIPE_SECRET_KEY | Stripe secret key |
| STRIPE_API_KEY | Stripe publishable key |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret |
| PAYPAL_CLIENT_ID | PayPal client ID |
| PAYPAL_SECRET | PayPal secret |
| PAYPAL_MODE | sandbox or live |
| GOOGLE_MAPS_API_KEY | Google Maps API key |
| ACTIVATION_SECRET | Email activation JWT secret |

### Socket Server Configuration (`socket/.env`)

| Variable | Purpose |
|----------|---------|
| PORT | Socket server port (default: 4000) |
| CORS_ORIGINS | Allowed WebSocket origins |

### Frontend Configuration

Server URLs configured in `frontend/src/server.js`:

```javascript
// Development
server = "http://localhost:8000/api/v2"
backend_url = "http://localhost:8000/"
socket_url = "http://localhost:4000"

// Production
server = "https://cloudtesting.cloud/api/v2"
backend_url = "https://cloudtesting.cloud/"
socket_url = "https://cloudtesting.cloud"
```

---

## 30. Deployment

### Production Setup

**Server:** Deployed behind Nginx reverse proxy at `cloudtesting.cloud`

### PM2 Configuration (`ecosystem.config.js`)

The application runs as 3 PM2 processes:
1. **Backend** — Express API server
2. **Frontend** — React build served statically
3. **Socket** — Socket.io server

### Nginx Configuration (`nginx/cloudtesting.cloud.conf`)

Routes:
- `/` → Frontend (React build)
- `/api/v2/*` → Backend Express server
- `/socket.io/*` → Socket server (WebSocket upgrade)

### Deployment Script (`deploy.sh`)

Automated deployment steps:
1. Pull latest code
2. Install dependencies (backend, frontend, socket)
3. Build frontend
4. Restart PM2 processes

### Development Setup

```bash
# Backend (port 8000)
cd backend
npm install
npm start

# Frontend (port 3000)
cd frontend
npm install
npm start

# Socket (port 4000)
cd socket
npm install
npm start
```

### Required External Services

1. **MongoDB** — Database (Atlas recommended for production)
2. **Cloudinary** — Media CDN (free tier available)
3. **Stripe** — Payment processing (requires business account)
4. **PayPal** — Payment processing + payouts (business account)
5. **Google Maps** — Distance/geocoding API (requires billing)
6. **SMTP** — Email delivery (Gmail, SendGrid, etc.)

---

## Key Model Relationships

```
User ──────────┬── Orders (as customer)
               ├── Notifications
               ├── Addresses
               └── [Admin roles: manages platform]

Shop ──────────┬── Products
               ├── Events
               ├── Orders (as seller)
               ├── Coupons
               ├── Advertisements
               ├── StoreManagerAdvertisements
               ├── Commission records
               ├── Withdrawals
               ├── ShippingConfig
               ├── VendorDeliveryConfig
               ├── Subscription
               ├── StoreManagerService → User (store_manager)
               ├── VideoBanners
               ├── VideoCall sessions
               └── BlockedCustomers

Category ──────── Self-referencing tree → Products
                                       → Departments

District ──────── VendorDeliveryConfig.districtFees

Order ─────────┬── Commission
               ├── ShippingCalculation
               └── VideoCall (support)

Property ──────── PropertyLeads
```

---

*This documentation was generated from actual codebase analysis of all source files, models, controllers, routes, middleware, utilities, frontend components, Redux store, and socket server code.*
