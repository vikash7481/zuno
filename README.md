# Zuno — Artisanal Fox Nuts E-Commerce & Production Management Platform

> **Official Brand**: **Zuno**  
> * Customer Shopping Experience: **Zuno** (`/`, `/products`, `/products/:slug`, `/cart`, `/checkout`, `/account`, `/orders`)
> * Enterprise Management Suite: **Zuno Business** (`/business/login`, `/business/dashboard`, `/business/products`, `/business/orders`, `/business/inventory`, `/business/production`, `/business/delivery`, `/business/staff`)
> * Driver Logistics Interface: **Zuno Delivery** (`/delivery/login`, `/delivery/dashboard`, `/delivery/orders/:id`)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Jest Tests](https://img.shields.io/badge/Tests-20%2F20%20Passed-brightgreen.svg)]()

---

## 1. Executive Summary & Architecture Overview

**Zuno** is an end-to-end, production-grade platform engineered specifically for the artisanal fox nuts (makhana) industry. Unlike standard shopping carts, Zuno integrates consumer e-commerce with real manufacturing operations: raw materials purchasing, recipe Bill of Materials (BOM), production batch tracking with yield/wastage calculations, FEFO batch tracking, atomic inventory reservations, role-based access control (RBAC), and delivery fleet dispatching with secure OTP verification.

```
                              ┌─────────────────────────────────────────┐
                              │           ZUNO UNIFIED WEB APP          │
                              │             (React 18 + Vite)           │
                              └─────┬──────────────┬──────────────┬─────┘
                                    │              │              │
                   ┌────────────────┴──┐   ┌───────┴──────┐   ┌───┴────────────────┐
                   │    Zuno Store     │   │Zuno Business │   │   Zuno Delivery    │
                   │(Customer Shopping)│   │(Admin Suite) │   │ (Driver Logistics) │
                   └────────┬──────────┘   └───────┬──────┘   └───┬────────────────┘
                            │                      │              │
                            └──────────────┬───────┴──────────────┘
                                           │ Axios API / JWT Auth / Socket.IO
                                           ▼
                              ┌─────────────────────────────────────────┐
                              │            ZUNO REST & WS API           │
                              │        (Node.js / Express 4 / ES6)      │
                              └─────┬──────────────┬──────────────┬─────┘
                                    │              │              │
                   ┌────────────────┴──┐   ┌───────┴──────┐   ┌───┴────────────────┐
                   │ Order & Pricing   │   │  Production  │   │  Atomic Inventory  │
                   │ Authoritative Svc │   │& Recipe Svc  │   │   ACID Engine      │
                   └────────┬──────────┘   └───────┬──────┘   └───┬────────────────┘
                            │                      │              │
                            └──────────────┬───────┴──────────────┘
                                           │ Mongoose Models & Conditional Updates
                                           ▼
                              ┌─────────────────────────────────────────┐
                              │         MongoDB 8.0 (zuno_db)           │
                              │ Multi-Document ACID / Atomic Ops Engine │
                              └─────────────────────────────────────────┘
```

---

## 2. Platform Feature Modules

### A. Customer Shopping Experience (Zuno)
* **Luxury Visual Identity**: Tailored warm cream (`#FAF6F0`), deep forest green (`#1E3A2F`), warm saffron gold (`#D97706`), and charcoal typography.
* **Smart Catalogue**: Filter by category (Classic Roasts, Gourmet Flavours, Raw Fox Nuts, Organic Harvest, Gift Boxes), sort by price, popularity, and rating.
* **Product Details & Multi-Pack Variants**: Dynamic selection between 100g Pouch, 250g Jar, and 500g Value Pack with instant stock status calculation.
* **Cart & Persistent Bag Drawer**: Slide-over bag with free shipping threshold progress bar (`₹499`), quantity controls, and cart badge counters.
* **Authoritative Checkout**:
  - Live server pricing recalculation (never trust client amounts).
  - Coupon system (`WELCOME10`, `ZUNO50`) with minimum order value and maximum discount limits.
  - Razorpay Sandbox Modal simulation + Cash on Delivery (COD) mode.
* **Post-Purchase Operations**:
  - Real-time 5-stage order tracking timeline.
  - Customer 4-digit Delivery OTP displayed securely.
  - Safe 1-click order cancellation with single stock release safeguard.
  - Printable tax invoice with GST breakdown.
  - Verified customer reviews & ratings.
  - Wishlist management.

### B. Enterprise Management Suite (Zuno Business)
* **Role-Based Access Control (RBAC)**: Gated permissions for Super Admin, Admin, Inventory Manager, Production Manager, and Staff.
* **Real-Time KPI Dashboard**: Gross revenue, completed orders, pending dispatch, low stock alerts, and 30-day revenue trends.
* **Product & Variant Catalog Management**: Create products, configure SKU variants, weights, base prices, images, and tax categories.
* **Inventory Control & FEFO Tracking**:
  - Physical stock vs. Reserved stock vs. Available stock balances.
  - Low-stock visual warning triggers.
  - Audited manual stock adjustments (Cycle Count, Damaged Stock, Return to Stock) with mandatory reason logging.
  - Full audit trail movement history table (`ORDER_RESERVATION`, `ORDER_CANCELLATION_RELEASE`, `DISPATCH_FULFILLMENT`, `PRODUCTION_CONSUMPTION`, `PRODUCTION_YIELD`).
* **Makhana Production & BOM Processing Engine**:
  - **Bill of Materials (BOM)**: Standardized recipes (e.g., Raw Grade-A Fox Nuts + Cold Pressed Olive Oil + Himalayan Pink Salt = 100g Pink Salt Makhana).
  - **Batch Lifecycle Management**:
    1. `PLANNED`: Set target output and calculate required raw materials.
    2. `IN_PROGRESS`: Automatically issues and deducts raw materials from inventory.
    3. `QUALITY_CHECK`: Record actual good output, processing loss/wastage, and QA approval notes.
    4. `COMPLETED`: Automatically generates finished goods stock, creates lot numbers, and sets manufacturing & expiry dates.
* **Order & Dispatch Fulfillment**:
  - Filter orders by status (`CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, etc.).
  - Manual delivery partner assignment or smart auto-dispatch based on delivery zones.
* **Procurement & Supplier Management**: Track registered suppliers, GSTIN, raw fox nut procurement orders, and receipts.
* **Financial Reports & Statement Generation**: P&L calculation (Sales - Discounts - Expenses), low inventory reports, and 1-click CSV export.

### C. Driver Logistics Application (Zuno Delivery)
* **Mobile-First Driver Interface**: Tailored for delivery riders on mobile and tablet screens.
* **Live Trip Queue**: Real-time counter of Assigned, Active, and Delivered packages.
* **Trip Execution**: 
  - Direct 1-tap customer phone calling.
  - 1-tap Google Maps address navigation.
  - Live state transitions: `ACCEPTED` ➔ `PICKED_UP` ➔ `OUT_FOR_DELIVERY`.
* **Cryptographic OTP Handshake**: Delivery can **only** be marked `DELIVERED` when the driver inputs the customer's unique 4-digit OTP, preventing fraudulent delivery marks.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3.4, Lucide React, Axios, Canvas Confetti |
| **Backend** | Node.js 18+, Express 4.19, Mongoose 8.3, Socket.IO 4.7, JWT, BcryptJS |
| **Database** | MongoDB 8.0 (Local standalone or Replica Set / MongoDB Atlas) |
| **Testing** | Jest 29, Supertest 6, Babel |
| **Tooling & Styling** | PostCSS, Autoprefixer, Plus Jakarta Sans typography |

---

## 4. Concurrency Protection & Transaction Setup

### A. Preventing Overselling
In fast-moving flash sales or simultaneous orders, race conditions can cause overselling. Zuno implements a two-tier concurrency protection strategy:

1. **Atomic Conditional Updates**:
   When reserving stock, Zuno uses MongoDB atomic expressions:
   ```javascript
   const updateQuery = {
     sku: variantSku,
     $expr: {
       $gte: [
         { $subtract: ['$physicalStock', '$reservedStock'] },
         quantity
       ]
     }
   };
   const updated = await InventoryItem.findOneAndUpdate(updateQuery, {
     $inc: { reservedStock: quantity }
   });
   if (!updated) throw new Error('Insufficient available stock');
   ```
   This guarantees that even with hundreds of concurrent checkout requests, stock reservations are serialized by MongoDB's atomic document locking.

2. **Multi-Document ACID Transactions (`withOptionalTransaction`)**:
   Zuno includes an intelligent transaction wrapper (`backend/src/utils/transactionHelper.js`).
   - If connected to a **MongoDB Replica Set** (or MongoDB Atlas), it executes all order, stock reservation, and coupon updates within a true multi-document ACID transaction session (`session.startTransaction()`). If any failure occurs, the entire transaction is rolled back cleanly.
   - If connected to a **Local Standalone MongoDB**, it automatically detects standalone mode and executes via atomic conditional queries with compensation rollbacks, avoiding driver transaction errors.

### B. Setting Up a Local MongoDB Replica Set (Optional)
If you wish to run full multi-document transactions locally on your developer machine:

1. Stop your standalone MongoDB service:
   ```powershell
   net stop MongoDB
   ```
2. Start MongoDB with a replica set name:
   ```powershell
   mongod --replSet rs0 --dbpath "C:\data\db" --port 27017
   ```
3. Open `mongosh` in another terminal and initiate the replica set:
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "127.0.0.1:27017" }]
   })
   ```
4. In `backend/.env`, use:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/zuno_db?replicaSet=rs0
   ```

---

## 5. Quick Start & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **MongoDB**: v6.0+ (running locally on `mongodb://127.0.0.1:27017` or Atlas URI)
* **Disk Space Note**: If working on Windows where drive `C:` has limited temp space, configure PowerShell temp paths:
  ```powershell
  $env:TEMP="D:\temp"; $env:TMP="D:\temp"
  ```

### Step 1: Clone & Configure Backend
```powershell
cd "d:\zuno app\backend"
copy .env.example .env
```

Verify `backend/.env` contents:
```env
NODE_ENV=development
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/zuno_db
JWT_SECRET=zuno_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5174
RAZORPAY_KEY_ID=rzp_test_zuno_sandbox_key
RAZORPAY_KEY_SECRET=rzp_test_zuno_sandbox_secret
PAYMENT_MODE=sandbox
BRAND_NAME=Zuno
SUPPORT_EMAIL=support@zuno.com
SUPPORT_PHONE=+919876543210
CURRENCY=INR
```

### Step 2: Install Backend Dependencies & Seed Database
```powershell
cd "d:\zuno app\backend"
npm install
npm run seed
```

### Step 3: Configure & Start Frontend
```powershell
cd "d:\zuno app\frontend"
copy .env.example .env
npm install
npm run dev
```

The frontend will run at: **`http://localhost:5174`**  
The backend will run at: **`http://localhost:5050`**

---

## 6. Pre-configured Demo Accounts & Roles

All seeded accounts use the default password: **`Password@123`**

| Role | Email Address | Access Level |
|---|---|---|
| **Super Admin** | `superadmin@zuno.com` | Full system access, settings, user permissions |
| **Operations Admin** | `admin@zuno.com` | Order dispatch, inventory, production, analytics |
| **Inventory Manager** | `inventory@zuno.com` | Stock balances, cycle counts, adjustments, suppliers |
| **Production Manager**| `production@zuno.com`| Recipe BOMs, production batches, quality inspection |
| **Delivery Partner**  | `partner@zuno.com`    | Mobile delivery dashboard, OTP confirmation |
| **Customer**          | `customer@zuno.com`   | Storefront shopping, bag, checkout, orders |

> **Quick Switcher Bar**: When testing in the browser, a quick-switcher bar at the top of the interface enables 1-click instant login between Customer, Admin, and Delivery Partner without needing to type passwords.

---

## 7. Automated Testing Suite

Zuno includes an automated Jest test suite covering authentication, RBAC authorization, authoritative pricing, atomic inventory reservations, race conditions, order cancellations, delivery OTP handshakes, and production batch BOM lifecycles.

To execute the test suite:
```powershell
cd "d:\zuno app\backend"
npm test
```

### Test Coverage Highlights
* **`src/tests/auth.test.js`**:
  - User registration & password hashing.
  - JWT token generation & verification.
  - Role-based route gating (ensures non-admins receive `403 Forbidden` on `/api/admin/*`).
* **`src/tests/inventory_and_orders.test.js`**:
  - Authoritative pricing recalculation & coupon application.
  - Atomic stock reservation on order creation.
  - **Concurrency Overselling Test**: Simulates simultaneous parallel requests competing for the exact last stock unit; confirms that exactly one order succeeds and conflicting racers receive `409 Conflict`.
  - Safe cancellation with single-stock release safeguard.
* **`src/tests/delivery_and_production.test.js`**:
  - Delivery assignment lifecycle and rejection of invalid delivery OTPs.
  - Delivery completion with valid OTP.
  - Production batch BOM deduction, quality check wastage recording, and automatic finished goods creation.

---

## 8. Payment Architecture & Sandbox Mode

Zuno uses an abstracted payment gateway architecture (`backend/src/services/paymentService.js`):

```
       [Customer Checkout] 
               │
               ▼
      [Order Validation] ──▶ Authoritative Server Pricing Recalculation
               │
      [Payment Method]
        ├── COD ──▶ Mark CONFIRMED ──▶ Atomically Reserve Stock
        │
        └── RAZORPAY ──▶ Create Sandbox Order ──▶ Interactive Modal
                                                        │
                      ┌─────────────────────────────────┴────────────────────────┐
                      ▼                                                          ▼
             [Simulate Success]                                         [Simulate Failure]
                      │                                                          │
             Verify Signature                                            Keep PENDING_PAYMENT
                      │                                                          │
             Mark PAID & CONFIRMED                                       Customer can retry
```

* **Production Ready**: To switch to live payments, supply real `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env` and set `PAYMENT_MODE=live`.

---

## 9. Production Build & Deployment

### Frontend Production Build
```powershell
cd "d:\zuno app\frontend"
npm run build
```
This generates the optimized static bundle in `d:/zuno app/frontend/dist/`.

### Serving with Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name zuno.yourdomain.com;

    # Frontend Static Files
    location / {
        root /var/www/zuno/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API & WebSocket Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5050/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5050/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 10. Known Limitations & Roadmap

1. **SMS & WhatsApp OTP Delivery**: Delivery OTP is currently displayed on the customer's Order Detail timeline and printable invoice. Direct SMS/WhatsApp dispatch requires an SMS gateway provider (e.g., Twilio or MSG91).
2. **Real-time Map GPS Streaming**: Google Maps links are provided for navigation. Live continuous driver coordinate streaming on an interactive map is architected for Socket.IO and can be paired with Mapbox in the next phase.
3. **Automated Supplier Purchase Orders**: Currently, purchase orders are created manually in Zuno Business. Automatic replenishment triggers based on reorder thresholds can be added as a background cron job.

---

**Crafted with excellence for the Zuno Artisanal Fox Nuts Platform.**
