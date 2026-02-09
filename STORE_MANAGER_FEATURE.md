# Store Manager Feature - Implementation Guide

## Overview

The **Store Manager Option** is a $100 paid service that allows vendors to delegate store operations to a trusted user. This feature enables vendors to assign one user with limited dashboard access to manage products, inventory, and orders.

## Price

- **One-time fee:** $100 USD (paid via PayPal)
- Service is perpetual once purchased (no recurring charges)
- Admin can grant free service to selected vendors

## User Roles & Permissions

### Store Manager CAN:
- ✅ View and manage products (add, edit, delete)
- ✅ Manage inventory and stock levels
- ✅ View and process orders (update fulfillment status)
- ✅ Access limited dashboard statistics

### Store Manager CANNOT:
- ❌ Access payment settings (PayPal, Stripe configs)
- ❌ Modify store settings or configuration
- ❌ Issue refunds
- ❌ Access subscription/billing information
- ❌ View withdrawal/payout information
- ❌ Modify store owner details

## File Structure

### Backend

```
backend/
├── model/
│   └── storeManager.js       # Store Manager Service model
├── routes/
│   └── storeManager.js       # All store manager API endpoints
├── middleware/
│   └── auth.js               # Updated with store manager auth middlewares
└── server.js                 # Updated to include store-manager routes
```

### Frontend

```
frontend/src/
├── components/
│   ├── Shop/
│   │   └── VendorStoreManager.jsx       # Vendor UI for purchasing service
│   └── StoreManager/
│       └── StoreManagerDashboard.jsx    # Store Manager dashboard
├── pages/
│   ├── Shop/
│   │   └── ShopStoreManagerPage.jsx     # Vendor page wrapper
│   ├── StoreManager/
│   │   └── StoreManagerDashboardPage.jsx # Store Manager page wrapper
│   └── AdminStoreManagerPage.jsx         # Admin management page
├── routes/
│   └── StoreManagerProtectedRoute.jsx    # Protected route for store managers
└── App.js                                 # Updated with new routes
```

## API Endpoints

### Seller Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/store-manager/my-service` | Get vendor's service status |
| POST | `/api/v2/store-manager/create-purchase` | Create PayPal order for $100 |
| POST | `/api/v2/store-manager/activate-service` | Capture payment, activate service |
| GET | `/api/v2/store-manager/search-users?email=` | Search users by email |
| POST | `/api/v2/store-manager/assign-manager` | Assign user as store manager |
| POST | `/api/v2/store-manager/remove-manager` | Remove assigned manager |

### Store Manager Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/store-manager/my-managed-shop` | Get assigned shop info |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/store-manager/admin/all-services` | List all store manager services |
| POST | `/api/v2/store-manager/admin/toggle-suspension/:id` | Suspend/restore service |
| POST | `/api/v2/store-manager/admin/assign-free-service` | Grant free service to vendor |

## Frontend Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/dashboard-store-manager` | ShopStoreManagerPage | Vendors |
| `/store-manager` | StoreManagerDashboardPage | Store Managers |
| `/store-manager/dashboard` | StoreManagerDashboardPage | Store Managers |
| `/admin-store-managers` | AdminStoreManagerPage | Admins |

## Database Models

### StoreManagerService Schema

```javascript
{
  shop: ObjectId (ref: Shop),
  serviceStatus: 'active' | 'inactive' | 'suspended',
  purchaseInfo: {
    paypalOrderId: String,
    paymentMethod: String,
    amount: Number,
    currency: String,
    transactionDate: Date,
  },
  assignedManager: ObjectId (ref: User),
  assignedAt: Date,
  managerHistory: [{
    user: ObjectId,
    assignedAt: Date,
    removedAt: Date,
    removeReason: String,
  }],
  activatedAt: Date,
  suspendedByAdmin: Boolean,
  adminNotes: String,
}
```

### User Model Updates

Added fields:
- `role: 'store_manager'` (new enum value)
- `managedShop: ObjectId` (ref to Shop)

### Shop Model Updates

Added fields:
- `storeManagerService: ObjectId` (ref to StoreManagerService)
- `storeManagerEnabled: Boolean`

## Authentication Flow

1. **Store Manager Login**: Uses regular user login (`/login`)
2. **Role Check**: Frontend checks `user.role === 'store_manager'`
3. **Redirect**: Store managers are redirected to `/store-manager` dashboard
4. **Authorization**: Backend uses `isStoreManager` middleware to verify access

## Auth Middlewares

| Middleware | Purpose |
|------------|---------|
| `isStoreManager` | Authenticates store manager users |
| `storeManagerCan(operation)` | Checks if operation is allowed |
| `isSellerOrStoreManager` | Combined auth for both roles |

## How to Use

### For Vendors

1. Navigate to **Dashboard → Store Manager** (or `/dashboard-store-manager`)
2. Click "Get Store Manager Service" to purchase ($100 via PayPal)
3. After payment, search for user by email to assign as manager
4. The assigned user can now login and access limited dashboard

### For Store Managers

1. Login using regular customer login (`/login`)
2. You will be automatically redirected to Store Manager Dashboard
3. Access allowed features: Products, Inventory, Orders

### For Admins

1. Navigate to **Admin Panel → Store Managers** (or `/admin-store-managers`)
2. View all store manager services
3. Suspend/restore services as needed
4. Grant free services to vendors

## PayPal Integration

The Store Manager service uses the existing PayPal integration. Ensure these environment variables are set:

```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox|live
```

## Testing

1. Create a vendor account and activate subscription
2. Purchase Store Manager service ($100)
3. Create a regular user account (customer)
4. Assign the customer as Store Manager
5. Login with customer credentials
6. Verify redirect to Store Manager dashboard
7. Test product/inventory/order access
8. Verify restricted features are blocked

## Future Enhancements

- [ ] Store Manager Products page (view/edit products)
- [ ] Store Manager Orders page (process orders)
- [ ] Store Manager Inventory page (stock management)
- [ ] Activity logging for store manager actions
- [ ] Multiple store managers per shop (premium feature)
- [ ] Store Manager mobile app access
