# AURA E-Commerce — Project Overview & Architecture

## Executive Summary
**AURA** is a modern, responsive, frontend-only e-commerce website built for a college capstone project. It is engineered strictly using HTML5, CSS3, and vanilla JavaScript without external CSS/JS frameworks, backend services, or external libraries.

---

## 1. Technology Stack & Constraints

- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Custom properties, Flexbox, CSS Grid, `clamp()`, `min()`)
- **Logic**: Vanilla ES6+ JavaScript (Custom Elements, DOM API, Event Listeners, `localStorage`, `sessionStorage`)
- **Currency**: Indian Rupee pricing (₹)
- **Frameworks / External Dependencies**: None (No React, Vue, Tailwind, Bootstrap, jQuery, etc.)
- **Execution Environment**: Runs natively in any standard browser via local `file://` or HTTP server.

---

## 2. Module Completion Status

| Module | Feature | Status |
| :--- | :--- | :--- |
| Module 2 | Home Landing Page (`index.html`) | ✅ Complete |
| Module 3 | Product Catalog (`products.html`) | ✅ Complete |
| Module 4 | Product Details Page (`product.html`) | ✅ Complete |
| Module 5 | Shopping Cart (`cart.html`) | ✅ Complete |
| Module 6 | Wishlist, Login & Registration | ✅ Complete |
| Module 7 | Checkout Workflow & Payment | ✅ Complete |
| Module 8 | Order History & Live Tracking | ✅ Complete |
| Module 9 | Optimization & Cross-Browser Testing | 🔲 Planned |

---

## 3. Complete Directory Structure

```
ecommerce/
│
├── index.html                   # Home Landing Page (Module 2)
├── PROJECT_OVERVIEW.md          # Project Documentation & Architecture
│
├── pages/                       # Page Module Views
│   ├── products.html            # Dynamic Product Catalog (Module 3)
│   ├── product.html             # Dynamic Product Details (Module 4)
│   ├── cart.html                # Shopping Cart View (Module 5)
│   ├── wishlist.html            # Wishlist View (Module 6)
│   ├── login.html               # User Login Form (Module 6)
│   ├── register.html            # Registration Form (Module 6)
│   ├── checkout.html            # Multi-Step Checkout & Payment (Module 7)
│   └── orders.html              # Order History & Live Tracking (Module 8)
│
├── css/                         # Modular CSS System
│   ├── variables.css            # Palette Tokens, Font Stacks & Spacing
│   ├── reset.css                # Standard Baseline Normalizations
│   ├── global.css               # Base Layouts, Typography & Utilities
│   ├── components.css           # UI Component Styles (Cards, Cart, Auth, Checkout, Orders)
│   └── responsive.css           # Media Queries & Mobile Navigation Overrides
│
├── js/                          # Vanilla JavaScript Modules
│   ├── app.js                   # Main Script (Scroll Effects & Toast System)
│   ├── data/
│   │   └── products.js          # Centralized Dataset (24 Products, 6 Categories, Variants)
│   ├── cart/
│   │   └── cart-service.js      # Cart Engine (localStorage key: "aura_cart")
│   ├── wishlist/
│   │   └── wishlist-service.js  # Wishlist Engine (localStorage key: "aura_wishlist")
│   ├── auth/
│   │   └── auth-service.js      # Auth Engine (localStorage keys: "aura_users", "aura_current_user")
│   ├── pages/
│   │   ├── home.js              # Home Page (Newsletter Validation & Toasts)
│   │   ├── products-page.js     # Catalog (Search, Filter, Sort, Render)
│   │   ├── product-page.js      # Product Details (Gallery, Variants, Wishlist, Add to Cart)
│   │   ├── cart-page.js         # Cart (Render, Qty Controls, Totals, Clear Cart)
│   │   ├── wishlist-page.js     # Wishlist (Render Grid, Remove, Add to Cart, Empty Fallback)
│   │   ├── register-page.js     # Registration (Validation, Duplicate Check, Account Creation)
│   │   ├── login-page.js        # Login (Credential Matching, Remember Me, Session Persistence)
│   │   ├── checkout-page.js     # Checkout (Multi-Step Form, Payment, Order Persistence)
│   │   └── orders-page.js       # Orders (History List, Live Tracking Timeline, Buy Again)
│   └── components/
│       ├── navbar.js            # Custom `<app-navbar>` Element (Dynamic Badges & Auth State)
│       └── footer.js            # Custom `<app-footer>` Element
│
└── assets/                      # Media Assets
    ├── images/                  # Product & Graphic Images
    └── icons/                   # Custom SVG Vector Assets
```

---

## 4. Shopping Cart Architecture (`cart.html` — Module 5)

Cart state is persisted in client-side `localStorage` under the key: `"aura_cart"`.

### Data Model
```json
[
    { "id": 1, "quantity": 2 },
    { "id": 5, "quantity": 1 }
]
```
*Product details (prices, titles, images) are queried at render time from `js/data/products.js`.*

### Key Business Logic
1. **Cart Service (`js/cart/cart-service.js`)**:
   - `getCart()`, `saveCart()`, `addToCart(id, qty)`, `updateCartQuantity(id, qty)`, `removeFromCart(id)`, `clearCart()`, `getCartCalculations()`.
   - Dispatches `CustomEvent('aura-cart-updated')` for same-tab reactivity.
   - Recovers safely from corrupted JSON by resetting to `[]`.
2. **Pricing Calculations**:
   - $\text{Subtotal} = \sum (\text{price} \times \text{quantity})$
   - $\text{Total Savings} = \sum \left((\text{originalPrice} - \text{price}) \times \text{quantity}\right)$
   - $\text{Shipping Fee} = \begin{cases} 0 & \text{if Subtotal} \ge ₹5{,}000 \\ ₹100 & \text{if } 0 < \text{Subtotal} < ₹5{,}000 \end{cases}$
   - $\text{Estimated Total} = \text{Subtotal} + \text{Shipping Fee}$

---

## 5. Wishlist Architecture (`wishlist.html` — Module 6)

Wishlist state is persisted under `localStorage` key `"aura_wishlist"`.

### Data Model
```json
[ 1, 7, 15 ]
```
*Stores unique product IDs only.*

### Key Features
1. **Wishlist Service (`js/wishlist/wishlist-service.js`)**:
   - `getWishlist()`, `addToWishlist(id)`, `removeFromWishlist(id)`, `toggleWishlist(id)`, `isInWishlist(id)`, `getWishlistCount()`.
   - Dispatches `CustomEvent('aura-wishlist-updated')` on every change.
2. **Toggle State on Product Page**: Reads state on load — shows `♥ IN WISHLIST` (active) or `♡ ADD TO WISHLIST`.
3. **Wishlist View**: Inline "Add to Cart" and "Remove" without duplicating service logic. Renders an empty-state fallback card when the list is empty.

---

## 6. Client-Side Authentication (`login.html`, `register.html` — Module 6)

> **⚠️ DEVELOPER DISCLAIMER**: This authentication system is strictly for college capstone demonstration. Passwords are stored in plain-text `localStorage` and must **NEVER** be used in production.

### Storage Models
- **User Accounts** (`"aura_users"`):
  ```json
  [{ "id": 1740829100000, "name": "John Doe", "email": "john@example.com", "password": "password123" }]
  ```
- **Active Session** (`"aura_current_user"`):
  - If **Remember Me** checked → `localStorage`.
  - If **Remember Me** unchecked → `sessionStorage`.
  ```json
  { "id": 1740829100000, "name": "John Doe", "email": "john@example.com" }
  ```
  *(Password excluded from session objects.)*

### Features
- **Registration**: Full Name (min 2 chars), Email (valid format + case-insensitive duplicate check), Password (min 8 chars), Confirm Password match, Terms acceptance.
- **Login**: Case-insensitive email match + exact password. Generic error message prevents user enumeration. Forgot password shows demo toast.
- **Navbar Auth State**: Logged out → user icon to login. Logged in → `Hi, John` greeting + Logout button.
- **Checkout/Orders Access Guard**: Unauthenticated visitors are redirected to an auth-required card with `LOGIN TO CONTINUE` CTA.

---

## 7. Checkout Workflow (`checkout.html` — Module 7)

The checkout page is a single-page, dynamically-rendered controller (`js/pages/checkout-page.js`, 764 lines).

### Access Controls
1. **Authentication Guard**: Unauthenticated users see a lock icon with `LOGIN TO CONTINUE` CTA.
2. **Empty Cart Guard**: Users with an empty cart see a `YOUR CART IS EMPTY` card before reaching the form.

### Multi-Step Progress Indicator
Visual 4-step progress bar updates reactively as the user fills in each section:
- `Step 1` — Information
- `Step 2` — Shipping
- `Step 3` — Payment
- `Step 4` — Review / Confirmation

### Form Sections & Validation
| Section | Fields | Validation Rules |
| :--- | :--- | :--- |
| Customer Info | Full Name, Email, Phone | Name ≥ 2 chars; valid email regex; 10-digit Indian mobile (`/^[6-9]\d{9}$/`) |
| Shipping Address | Address Line 1 & 2, City, State, PIN Code, Country | Address ≥ 5 chars; City ≥ 2 chars; State required; PIN = 6 digits |
| Delivery Method | Standard (₹100) / Free (₹0 for orders ≥ ₹5,000) | Auto-selects based on cart subtotal; live total recalculation on toggle |
| Payment Method | COD / UPI / Credit-Debit Card | UPI: validates `username@upi` format; Card: validates 15+ digit number, MM/YY expiry, 3-4 digit CVV |

### Order Placement & Persistence
- On submit, builds a complete **Order Object** and appends it to `localStorage` key `"aura_orders"` (newest first).
- Clears the cart via `window.AuraCart.clearCart()` after saving.
- **Security note**: No card numbers, CVV, or raw payment credentials are stored.
- Renders an Order Confirmation screen with Order Reference ID, Total Paid, Payment Method, and Estimated Delivery.

### Order Data Model (`"aura_orders"`)
```json
{
  "id": "AURA-20260829-382",
  "userId": 1740829100000,
  "date": "2026-08-29T10:30:00.000Z",
  "status": "Order Placed",
  "customer": { "name": "John Doe", "email": "john@example.com", "phone": "9876543210" },
  "shipping": { "addressLine1": "123 MG Road", "addressLine2": "Near Park", "city": "Mumbai", "state": "Maharashtra", "pinCode": "400001", "country": "India" },
  "delivery": { "method": "Standard Delivery", "charge": 100 },
  "payment": { "method": "Cash on Delivery" },
  "items": [{ "productId": 1, "name": "Product Name", "category": "Bags", "price": 2999, "quantity": 2, "itemTotal": 5998 }],
  "subtotal": 5998,
  "discount": 200,
  "shippingFee": 0,
  "total": 5798
}
```

---

## 8. Order History & Tracking (`orders.html` — Module 8)

The orders page is a single-page dynamically-rendered controller (`js/pages/orders-page.js`, 511 lines).

### Access Control
- Requires authentication. Unauthenticated users see auth-required card.
- Filters `"aura_orders"` by `userId` to show only the current user's orders.
- Deep-link support via query param: `orders.html?id=AURA-20260829-382` opens the order detail view directly.

### Order History List View
- Displays all orders as cards, sorted newest first.
- Each card shows: Order Date, Total, Order ID, Status Badge, Items Preview, and `TRACK & VIEW DETAILS →` button.
- **Buy Again**: Adds a previously ordered product back to the cart with a single button click.

### Order Tracking Detail View
- Back navigation: `← Back to My Orders` returns to the history list without a page reload.
- **4-Stage Visual Timeline** with connector lines:
  ```
  ● Order Placed  ──  ○ Processing  ──  ○ Shipped  ──  ○ Delivered
  ```
  - Stages progress automatically based on time elapsed since the order date:
    - **< 1 hour** → Order Placed
    - **≥ 1 hour** → Processing
    - **≥ 24 hours** → Shipped
    - **≥ 72 hours** → Delivered
- **Delivery Info Card**: Recipient name, email, phone, full shipping address.
- **Payment Summary Card**: Payment method, subtotal, discount, shipping fee, grand total.
- **Ordered Products Table**: Item thumbnail, name, price per unit × quantity, line total, and per-item Buy Again button.

### Status Badge Mapping
| Status | Badge Style |
| :--- | :--- |
| Order Placed | `badge-outline` (neutral) |
| Processing | `badge-new` (blue) |
| Shipped | `badge-hot` (amber) |
| Delivered | `badge-sale` (green) |

---

## 9. Responsive Behavior Matrix

| Viewport | Cart / Checkout | Wishlist | Auth Cards (Login/Register) |
| :--- | :--- | :--- | :--- |
| **Desktop (> 1024px)** | 2-Column Split Layout | 4 Columns Grid | Centered 480px Floating Card |
| **Tablet (768px – 1024px)** | 1 Column Stacked | 2 Columns Grid | Centered 480px Floating Card |
| **Mobile (< 768px)** | 1 Column Stacked | 1 Column Stacked | Full Width 100% Form |

---

## 10. `localStorage` Key Reference

| Key | Type | Purpose | Managed By |
| :--- | :--- | :--- | :--- |
| `aura_cart` | `Array<{id, quantity}>` | Cart item storage | `cart-service.js` |
| `aura_wishlist` | `Array<number>` | Product IDs saved to wishlist | `wishlist-service.js` |
| `aura_users` | `Array<UserObject>` | All registered user accounts | `auth-service.js` |
| `aura_current_user` | `UserObject` | Active user session (remember me) | `auth-service.js` |
| `aura_orders` | `Array<OrderObject>` | All placed orders (newest first) | `checkout-page.js` |

*`aura_current_user` is stored in `sessionStorage` when "Remember Me" is unchecked.*

---

## 11. Roadmap — Remaining Modules

- **Module 9 — Accessibility & Optimization**: Full keyboard navigation audit (`aria-*` attributes, focus management), Lighthouse performance scoring, lazy-loading images, and cross-browser compatibility validation (Chrome, Firefox, Safari, Edge).

---

## 12. Instructions for Local Running

### Option A: Directly via Web Browser
1. Open the `ecommerce/` directory in your file explorer.
2. Double-click `index.html` or any page in `pages/` to open in any browser.

### Option B: Local Web Server (Recommended)
1. Open a terminal inside the `ecommerce/` directory.
2. Run:
   ```bash
   python -m http.server 8082
   ```
3. Visit in your browser:
   - Home: `http://localhost:8082/`
   - Products: `http://localhost:8082/pages/products.html`
   - Cart: `http://localhost:8082/pages/cart.html`
   - Checkout: `http://localhost:8082/pages/checkout.html`
   - Orders: `http://localhost:8082/pages/orders.html`
