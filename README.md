# AURA E-Commerce — Frontend-Only Capstone Application

AURA is a modern, responsive, high-performance e-commerce web application engineered strictly using **HTML5**, **CSS3**, and **Vanilla ES6+ JavaScript**. It features a comprehensive, client-side e-commerce architecture complete with product filtering, dynamic detail view, responsive cart, saved wishlist, client-side authentication, multi-step checkout, order history, and live shipment tracking.

---

## 🌟 Key Features

1. **Design System & Custom Elements** (`Module 1 & 2`):
   - Custom `<app-navbar>` and `<app-footer>` Web Components with auto-active navigation links, real-time cart/wishlist badges, and user session status.
   - Design tokens built on a sleek color palette: Deep Black (`#121212`), Champagne Gold (`#c5a880`), and Alabaster (`#faf9f6`).

2. **Product Catalog + Search + Filter + Sort** (`Module 3`):
   - Dynamic 24-item product catalog with instant text search, category filters, price range slider, star rating filter, and sorting (price low-to-high, high-to-low, top rated).
   - Switchable Grid vs List view modes.

3. **Dynamic Product Details Page** (`Module 4`):
   - Interactive thumbnail image switcher, dynamic breadcrumbs, rating breakdown, stock status, discount savings badge, and color/size variant selection.

4. **Shopping Cart Engine** (`Module 5`):
   - `localStorage` cart engine (`aura_cart`) with quantity increment/decrement, free shipping progress bar, stock limit checks, item removal, and subtotal calculation.

5. **Wishlist & Client-Side Authentication** (`Module 6`):
   - Deduplicated wishlist persistence (`aura_wishlist`).
   - Account registration (`aura_users`) with duplicate email validation and client-side password checks.
   - Authentication session state (`aura_current_user`) supporting "Remember Me" sessions.

6. **Multi-Step Checkout & Order Placement** (`Module 7`):
   - Authentication guard protecting checkout access.
   - 4-step progress indicator, customer contact & 6-digit Indian PIN code shipping address validation, delivery options, and payment toggles (COD, UPI, Credit/Debit Card).
   - Order generation (`aura_orders`), cart clearing, and immediate order confirmation.

7. **Orders & Order Tracking** (`Module 8`):
   - User-specific order history filtering.
   - 4-stage tracking timeline (*Order Placed* $\rightarrow$ *Processing* $\rightarrow$ *Shipped* $\rightarrow$ *Delivered*).
   - Direct link support (`orders.html?id=AURA-...`) and "Buy Again" quick re-addition.

8. **System Integration & Testing** (`Module 9 & 10`):
   - Full end-to-end user journey validation, multi-user data isolation, cross-browser compatibility, storage corruption auto-recovery, and zero console errors.

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5 with accessibility ARIA landmark attributes.
- **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid, Media Queries).
- **Logic**: ES6+ JavaScript (Custom Elements, DOM API, `localStorage`, `sessionStorage`).
- **Dependencies**: **0 External Libraries / Frameworks** (No React, Vue, Angular, jQuery, Bootstrap, or Tailwind).

---

## 📁 Directory Structure

```text
ecommerce/
├── index.html                  # Home Page
├── README.md                   # Quick Start & Capstone Documentation
├── PROJECT_OVERVIEW.md         # Full Technical Architecture Specification
├── pages/
│   ├── products.html           # Product Catalog Page
│   ├── product.html            # Dynamic Product Details Page
│   ├── cart.html               # Shopping Cart Page
│   ├── wishlist.html           # Saved Wishlist Page
│   ├── login.html              # Authentication Sign In Page
│   ├── register.html           # Account Registration Page
│   ├── checkout.html           # Secure Checkout Page
│   └── orders.html             # Order History & Tracking Page
├── css/
│   ├── variables.css           # CSS Variables & Design Tokens
│   ├── reset.css               # Modern CSS Reset
│   ├── global.css              # Typography & Base Layout
│   ├── components.css          # Cards, Buttons, Inputs, Badges, Modals, Timelines
│   └── responsive.css          # Mobile & Tablet Breakpoint Queries
└── js/
    ├── app.js                  # Global Application Initializer & Utilities
    ├── data/
    │   └── products.js         # Central Product Dataset (24 items)
    ├── cart/
    │   └── cart-service.js     # Cart State Engine ("aura_cart")
    ├── wishlist/
    │   └── wishlist-service.js # Wishlist Engine ("aura_wishlist")
    ├── auth/
    │   └── auth-service.js     # Authentication Engine ("aura_users", "aura_current_user")
    ├── pages/
    │   ├── home.js             # Home Page Controller
    │   ├── products-page.js    # Catalog Controller
    │   ├── product-page.js     # Product Details Controller
    │   ├── cart-page.js        # Cart Page Controller
    │   ├── wishlist-page.js    # Wishlist Page Controller
    │   ├── register-page.js    # Registration Page Controller
    │   ├── login-page.js       # Login Controller
    │   ├── checkout-page.js    # Checkout Page Controller
    │   └── orders-page.js      # Orders & Tracking Controller
    └── components/
        ├── navbar.js           # Header Custom Element (<app-navbar>)
        └── footer.js           # Footer Custom Element (<app-footer>)
```

---

## 🚀 How to Run Locally

Because AURA is a frontend-only application, **no Node.js server, database, or backend installation is required**.

### Option 1: Direct Web Browser
1. Navigate to the `ecommerce/` project directory in your File Explorer.
2. Double-click `index.html` to open the website in your default browser.

### Option 2: Local HTTP Server (Recommended)
1. Open a terminal / command prompt in the `ecommerce/` folder.
2. Run Python's built-in HTTP server:
   ```bash
   python -m http.server 8082
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:8082/index.html
   ```

---

## 🔒 Security & Academic Disclaimer

This project is built as a **frontend-only demonstration application**:
- All user registrations, sessions, wishlist items, cart states, and orders are persisted exclusively in browser `localStorage` / `sessionStorage`.
- **Payment processing is simulated**. Card numbers and CVVs entered in the checkout form exist only in temporary DOM memory and are never persisted to storage or transmitted over the network.
- Passwords stored in `localStorage` are for demo user account switching only.

---

## 📝 Demo Account Setup

To test authenticated features:
1. Click **Account / Login** in the top navigation bar.
2. Select **Create Account** to register a new account (e.g., `user@example.com` / `Password123`).
3. Alternatively, login immediately using any newly registered credentials.
