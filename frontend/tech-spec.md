# ZaiNoor - Technical Specification

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3 | UI framework |
| react-dom | ^18.3 | DOM rendering |
| react-router-dom | ^6.26 | Client-side routing for all pages |
| ogl | ^1.0.0 | WebGL library for Cyclone Typography MSDF effect |
| normalize-wheel | ^1.0.0 | Cross-browser wheel event normalization |
| gsap | ^3.12 | Core animation engine + ScrollTrigger plugin |
| lenis | ^1.1 | Smooth scroll with inertia |
| imagesloaded | ^5.0 | Image load detection for scroll effects |
| zustand | ^4.5 | Lightweight global state management (auth, cart) |
| tailwindcss | ^3.4 | Utility-first CSS |
| @fontsource/playfair-display | ^5.0 | Display font |
| @fontsource/inter | ^5.0 | Body/UI font |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.6 | Type safety |
| vite | ^5.4 | Build tool |
| @vitejs/plugin-react | ^4.3 | React support for Vite |
| @types/react | ^18.3 | React type definitions |
| @types/react-dom | ^18.3 | ReactDOM type definitions |
| postcss | ^8.4 | CSS processing |
| autoprefixer | ^10.4 | Vendor prefix automation |

## Component Inventory

### Layout Components (shared across pages)

| Component | Source | Usage |
|-----------|--------|-------|
| Navbar | Custom | Sticky nav with transparent→blur transition, cart badge, conditional auth display |
| Footer | Custom | 4-column footer with newsletter, payment icons, copyright |
| MobileNav | Custom | Full-screen black overlay with slide-in animation |
| CartDrawer | Custom | Slide-in right panel (420px) with item list, quantity steppers, checkout CTA |
| PageTransitionOverlay | Custom | Full-screen black slide-up overlay for route changes |
| ToastNotification | Custom | Fixed top-right toast system with auto-dismiss |
| ScrollToTop | Custom | Scrolls window to top on route change |

### Section Components (page-specific)

**Home Page Sections:**

| Component | Notes |
|-----------|-------|
| HeroSection | Contains CycloneTypography canvas + foreground headline/CTA |
| TrustedIndicators | 5-stat grid with scroll-triggered entrance |
| FeaturedCollectionBanner | Uses GeometricTransition for panel reveal |
| CollectionShowcase | Uses SqueezeGrid for 3-column product layout |
| AboutTeaser | Uses ScrollFillHeadline for text fill effect |

**Product Page Sections:**

| Component | Notes |
|-----------|-------|
| ProductHeader | Black hero with title |
| FilterBar | Sticky filter with category dropdown, sort, price slider |
| ProductGrid | 3-col grid with hover effects, pagination |

**Other Pages:**

| Page | Key Custom Components |
|------|----------------------|
| About | StorySection (2-col), ValuesSection (3-col grid) |
| FAQs | FAQAccordion with search, grouped categories |
| Contact | ContactGrid (info + form) |
| Affiliate | Hero with badge, Steps row, Rules list, Registration form |
| CartDrawer | Already listed as layout |
| Checkout | CheckoutForm (3-step), OrderSummary (sticky sidebar) |
| UserDashboard | DashboardLayout (sidebar + main), OrdersTab, etc. |
| AdminDashboard | AdminLayout (sidebar + main), StatsCards, DataTable |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| ProductCard | Custom | CollectionShowcase, ProductGrid |
| QuickViewModal | Custom | ProductCard (click handler) |
| QuantityStepper | Custom | CartDrawer, QuickViewModal |
| PillButton | Custom | Throughout (primary/secondary/outline variants) |
| Icon | Custom (SVG wrapper) | Navbar, Footer, Contact, etc. |
| SkeletonLoader | Custom | ProductGrid, Admin tables |
| StatusBadge | Custom | Orders (Processing/Shipped/Delivered/Cancelled) |
| AuthModal | Custom | Navbar (login/signup toggle) |
| PaymentMethodSelector | Custom | Checkout page |

### Core Effect Components

| Component | Library | Complexity |
|-----------|---------|------------|
| CycloneTypography | ogl (custom WebGL) | High |
| SqueezeGrid | gsap (ScrollTrigger) | High |
| GeometricTransition | gsap (ScrollTrigger + clip-path) | High |
| ScrollFillHeadline | gsap (ScrollTrigger) | Medium |

## Animation Implementation Table

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Cyclone Typography (3D text helix) | ogl + custom MSDText class | Full WebGL pipeline with MSDF font rendering, custom vertex/fragment shaders, drag/wheel interaction | **High** 🔒 |
| Magnetic Squeeze Column Grid | gsap + ScrollTrigger | Dual timeline system (left/right columns) driven by scroll velocity via `getVelocity()`. Mirrored transforms with opposite signs. | **High** 🔒 |
| Geometric Clip-Path Panel Transition | gsap + ScrollTrigger | 6-panel timeline with 3-step clip-path polygon morphing (half-star → rectangle). Character-split headline reveal. | **High** 🔒 |
| Scroll Fill Text Animation | gsap + ScrollTrigger | Per-word scrubbed width animation of fill layer over stroke layer. Dynamic `--word-width` CSS property. | Medium |
| Page Transition Overlay | gsap | Black overlay slide-up (0.4s power3.inOut), content swap, slide-away | Medium |
| Navbar scroll transition | gsap / CSS | Background opacity + backdrop-filter blur on scroll past hero threshold | Low |
| Hero content entrance | gsap | Fade-up stagger of headline words + CTA on page load | Low |
| Trusted Indicators entrance | gsap + ScrollTrigger | Fade-up stagger of 5 stat items, trigger at 85% viewport | Low |
| Product card hover | CSS | translateY(-4px) + box-shadow + quick-add button opacity | Low |
| Mobile nav slide-in | gsap | Full-screen overlay slide from right (0.4s power3.inOut) | Low |
| Cart drawer slide-in | gsap | Right panel translateX(100% → 0), backdrop fade | Low |
| FAQ accordion | CSS / gsap | max-height transition + chevron rotation | Low |
| Toast notification | gsap | Slide in from right (0.3s), auto-dismiss after 4s | Low |
| Image hover zoom | CSS | scale(1.05) on image container, 0.4s ease | Low |
| Button hover states | CSS | Background color transition + scale(1.02), 0.2s | Low |
| Scroll indicator bounce | CSS | @keyframes bounce animation on chevron | Low |
| Skeleton pulse | CSS | @keyframes opacity pulse between #EFEFEF and #C1C1C1 | Low |

## State & Logic Plan

### Global State (Zustand Store)

**Auth Store:**
- `user: User | null` — current authenticated user
- `isAdmin: boolean` — role flag
- `login(email, password)`, `register(data)`, `logout()`
- Persist to localStorage for session continuity

**Cart Store:**
- `items: CartItem[]` — product, quantity, size, color
- `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`
- `totalItems: number` (derived), `subtotal: number` (derived)
- Persist to localStorage

**UI Store:**
- `isCartOpen: boolean`
- `isMobileNavOpen: boolean`
- `isAuthModalOpen: boolean`
- `authModalMode: 'login' | 'signup'`
- `toastQueue: Toast[]` — enqueue/dequeue notifications

### Data Flow

- **Products:** Static mock data array (no backend). Products data defined in `src/data/products.ts` with full type definitions
- **Orders:** Mock data tied to auth user. Generated on checkout submission
- **Admin Operations:** CRUD on in-memory product array (no persistence beyond session)

### Routing Architecture

```
/                  → Home
/products          → Products
/about             → About
/faqs              → FAQs
/contact           → Contact
/affiliate         → Affiliate
/checkout          → Checkout (protected)
/dashboard/*       → User Dashboard (protected)
/admin/*           → Admin Dashboard (protected, admin-only)
```

**Route Guards:** Wrap protected routes in `<ProtectedRoute>` component that checks auth store. Redirect unauthenticated users to home with auth modal open. Redirect non-admin users from /admin to home.

### WebGL Lifecycle Management

The CycloneTypography effect creates a WebGL context that must be carefully managed:
1. Single WebGL context per page — never multiple
2. Cleanup on unmount: set effect ref to null, trigger context loss
3. Use `glInitialized` boolean ref to prevent React Strict Mode double-mount issues
4. On route change away from home, destroy the canvas and overlay

## Project Structure

```
├── public/
│   ├── fonts/
│   │   └── msdf/               # MSDF font atlas (png + json)
│   └── images/
│       ├── products/           # Product photography
│       └── lifestyle/          # Editorial/lifestyle images
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── PageTransitionOverlay.tsx
│   │   ├── ui/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── QuickViewModal.tsx
│   │   │   ├── QuantityStepper.tsx
│   │   │   ├── PillButton.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── ToastNotification.tsx
│   │   │   └── PaymentMethodSelector.tsx
│   │   └── effects/
│   │       ├── CycloneTypography.tsx      # React wrapper for WebGL
│   │       ├── SqueezeGrid.tsx            # Scroll-driven column effect
│   │       ├── GeometricTransition.tsx    # Clip-path panel reveal
│   │       └── ScrollFillHeadline.tsx     # Scroll text fill
│   ├── sections/
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── TrustedIndicators.tsx
│   │   │   ├── FeaturedCollectionBanner.tsx
│   │   │   ├── CollectionShowcase.tsx
│   │   │   └── AboutTeaser.tsx
│   │   ├── products/
│   │   │   ├── ProductHeader.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── ProductGrid.tsx
│   │   ├── about/
│   │   │   ├── StorySection.tsx
│   │   │   └── ValuesSection.tsx
│   │   ├── faqs/
│   │   │   └── FAQAccordion.tsx
│   │   ├── contact/
│   │   │   └── ContactGrid.tsx
│   │   ├── affiliate/
│   │   │   ├── AffiliateHero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── AffiliateRules.tsx
│   │   │   └── AffiliateForm.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── OrdersTab.tsx
│   │   │   ├── AddressesTab.tsx
│   │   │   ├── WishlistTab.tsx
│   │   │   ├── AffiliateTab.tsx
│   │   │   └── SettingsTab.tsx
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       ├── AdminOverview.tsx
│   │       ├── AdminOrders.tsx
│   │       ├── AdminProducts.tsx
│   │       ├── AdminCustomers.tsx
│   │       └── AdminAffiliates.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── About.tsx
│   │   ├── FAQs.tsx
│   │   ├── Contact.tsx
│   │   ├── Affiliate.tsx
│   │   ├── Checkout.tsx
│   │   ├── UserDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── hooks/
│   │   ├── useLenis.ts              # Lenis smooth scroll init
│   │   ├── useScrollTrigger.ts      # GSAP ScrollTrigger setup
│   │   ├── useAuth.ts               # Auth state & operations
│   │   ├── useCart.ts               # Cart state & operations
│   │   └── useToast.ts              # Toast notification queue
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   └── uiStore.ts
│   ├── data/
│   │   ├── products.ts              # Mock product catalog
│   │   ├── orders.ts                # Mock order data
│   │   ├── faqs.ts                  # FAQ questions & answers
│   │   └── affiliates.ts            # Affiliate rules & data
│   ├── types/
│   │   └── index.ts                 # All TypeScript interfaces
│   ├── lib/
│   │   ├── cyclone-text.ts          # OGL CycloneText class
│   │   ├── msdf-text.ts             # MSDFText rendering class
│   │   ├── squeeze-grid.ts          # Squeeze grid animation logic
│   │   ├── panel-transition.ts      # Geometric clip-path logic
│   │   ├── scroll-fill.ts           # Scroll fill text logic
│   │   └── utils.ts                 # General utilities
│   ├── App.tsx                      # Router + layout wrapper
│   ├── main.tsx                     # Entry point + Lenis init
│   └── index.css                    # Global styles + Tailwind
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Key Technical Decisions

1. **No shadcn/ui components** — The design is entirely bespoke with custom styling. Standard UI primitives (buttons, inputs, modals) are simple enough to build custom and maintain the exact monochrome aesthetic.

2. **OGL over Three.js/R3F** — The design spec explicitly uses OGL for the Cyclone Typography effect (MSDF text rendering). OGL is lighter and the shader code is tailored to it. No other 3D scenes exist, so Three.js would be unnecessary overhead.

3. **MSDF Font Atlas** — Must generate MSDF atlas (PNG + JSON) from a font file using `msdf-atlas-gen` or similar tool before development. The atlas goes in `public/fonts/msdf/`.

4. **Static Mock Data** — No backend API. All data (products, orders, FAQs) lives in `src/data/` as typed TypeScript arrays. This simplifies deployment while providing full functionality.

5. **Zustand over Context** — Zustand provides simpler API, better performance for frequent updates (cart quantities), and persists to localStorage easily.

6. **React Router v6** — Declarative routing with nested routes for dashboard tabs (`/dashboard/orders`, `/dashboard/wishlist`, etc.).

7. **GSAP for All Animations** — Consistent animation library across the project. ScrollTrigger handles all scroll-driven effects. No Framer Motion needed since GSAP covers everything.

8. **Lenis for Smooth Scroll** — Required for the squeeze grid velocity effect. Must sync with ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`.
