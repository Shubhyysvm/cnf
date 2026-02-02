# Admin Portal Implementation Plan
## Country Natural Foods E-Commerce Platform

**Date**: December 6, 2025  
**Status**: Planning Phase  
**Priority**: HIGH - Enables rapid product updates and image management

---

## EXECUTIVE SUMMARY

You're asking for a complete admin portal to manage:
- Products (CRUD, bulk operations)
- Variants (pricing, discounts, stock, shelf-life)
- Images (multi-upload, reordering, default selection)
- Categories (management, homepage ordering)
- Inventory (stock levels, low-stock alerts)
- Analytics (sales, products, customer metrics)
- Site settings (shipping, notifications, display)
- User management (admin accounts, roles)

**Key Decision**: BUILD WEB ADMIN FIRST, then mobile if needed.

---

## ARCHITECTURE: Shared Code Strategy

### The Problem
- Web admin (Next.js) and mobile admin (React Native) need same API client
- 100% code duplication if built separately
- Harder to maintain two versions

### The Solution: Monorepo with Shared Logic

```
/apps/admin-web              ← DESKTOP WEB (Your Priority - 4 weeks)
/apps/admin-mobile           ← MOBILE APP (Future - 3 weeks, optional)
/packages/admin-types        ← Shared TypeScript interfaces (1 week)
/packages/admin-api-client   ← Shared HTTP client (1 week)
/packages/admin-services     ← Shared validation & logic (1 week)
/packages/ui-web             ← Web components (Tailwind + Shadcn/ui)
/packages/ui-mobile          ← Mobile components (React Native)
```

### What Gets SHARED ✅
1. **API Client** (`/packages/admin-api-client`):
   - HTTP methods for all endpoints
   - Token management
   - Error handling & retry logic
   - Works in both web and mobile

2. **TypeScript Types** (`/packages/admin-types`):
   - Product, Variant, Category, Order, AdminUser interfaces
   - API request/response shapes
   - Enums for roles, statuses

3. **Business Logic** (`/packages/admin-services`):
   - Form validation (Zod schemas)
   - Price calculations
   - Image ordering logic
   - Stock status determination

### What Stays SEPARATE ❌
1. **UI Components** (platform-specific):
   - Web: Next.js pages, Tailwind, Shadcn/ui
   - Mobile: React Native screens, native components

2. **Navigation**:
   - Web: Next.js file-based routing
   - Mobile: React Navigation stack

3. **Styling**:
   - Web: Tailwind CSS
   - Mobile: React Native StyleSheet

---

## PROS & CONS

### PROS of Shared Code ✅
- **Single source of truth** for business logic
- **Faster mobile development** (reuse 60% of code)
- **Consistent UX** across platforms
- **Easier maintenance** (one set of features, not two)
- **Type safety** via shared TypeScript

### CONS of Shared Code ❌
- Different component libraries (React Web ≠ React Native)
- Different navigation paradigms
- Touch vs. mouse interactions differ
- Screen sizes vary (desktop vs. mobile)
- Requires careful architecture (but worth it)

### WHY THIS APPROACH WINS
- Web admin: Desktop browser, mouse, large screen, complex forms ✓
- Mobile admin: Quick actions only, simple forms, touch-optimized ✓
- Shared: API client, types, validation (60% of work) ✓

**Verdict**: Share code for backend integration, keep UI/navigation separate.

---

## RECOMMENDED PROGRESSION

### Phase 1: Admin Web Portal (4 WEEKS) - **YOUR PRIORITY**
**Why first**: You have laptop with images, easier to upload via web interface

**Deliverable**: Fully functional admin dashboard at `/admin`

**Tech Stack**:
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS + Shadcn/ui components
- Forms: React Hook Form + Zod validation
- Upload: React-Dropzone (drag-and-drop)
- Rich Text: TipTap for product descriptions
- Charts: Recharts for analytics
- Tables: TanStack React Table
- HTTP: Axios with token refresh
- State: Zustand or React Context
- Notifications: Sonner (toast)
- Icons: Lucide React

**Week 1: Foundation**
- [ ] Create `/apps/admin-web` directory with Next.js scaffolding
- [ ] Setup Tailwind CSS + Shadcn/ui component library
- [ ] Create `/packages/admin-types` with TypeScript interfaces
- [ ] Implement admin login page (/admin/login)
- [ ] Create backend auth endpoints: POST /api/admin/auth/login, POST /api/admin/auth/register
- [ ] JWT token handling & refresh mechanism

**Week 2: Product Management Core**
- [ ] Create `/packages/admin-api-client` with HTTP client
- [ ] Build admin dashboard (/admin) with KPI cards
- [ ] Create product list page (/admin/products) with filtering, sorting, pagination
- [ ] Implement product create form (/admin/products/create)
- [ ] Create backend endpoints: GET /api/admin/products, POST /api/admin/products

**Week 3: Images & Variants (Your Priority Tasks)**
- [ ] Implement product edit page (/admin/products/:id/edit)
- [ ] Add image upload with drag-and-drop (/admin/products/:id/edit → Images tab)
- [ ] Reorder images via drag-drop
- [ ] Set image as default (star icon)
- [ ] Edit alt text per image
- [ ] Create backend endpoints: POST /api/admin/products/:id/images, PATCH /api/admin/products/:id/images/:imgId
- [ ] Add variant management UI (add, edit, delete, reorder)
- [ ] Create variant endpoints: POST /api/admin/products/:id/variants, PATCH /api/admin/products/:id/variants/:vid

**Week 4: Complete Features & Polish**
- [ ] Add category management (/admin/categories)
- [ ] Add inventory/stock dashboard (/admin/inventory)
- [ ] Add analytics dashboard (/admin/analytics)
- [ ] Add site settings page (/admin/settings)
- [ ] Add user management (/admin/users)
- [ ] Bug fixes, error handling, loading states
- [ ] Deploy to staging environment
- [ ] User acceptance testing

---

### Phase 2: Shared Packages Setup (1 WEEK - Parallel with Phase 1)
**Timing**: Can start Week 2 while web admin is in progress

- [ ] Extract admin API client to `/packages/admin-api-client`
- [ ] Extract types to `/packages/admin-types`
- [ ] Create validation schemas in `/packages/admin-services`
- [ ] Update admin-web to import from shared packages
- [ ] Test that shared packages work in both contexts

**Deliverable**: Reusable foundation for mobile admin app

---

### Phase 3: Admin Mobile App (3 WEEKS - IF WANTED)
**Timing**: After web admin MVP is complete

**Note**: Only proceed if you need mobile admin functionality. Web is sufficient for most tasks.

**Features**:
- Dashboard (read-only overview)
- Product list (search, quick view)
- Quick price/stock edit (quick actions)
- Single image upload (simpler than web batch)
- Notifications push (new orders, low stock)

**Tech**: React Native + Expo, reuse shared packages

**Deliverable**: Mobile admin app on App Store / Play Store

---

## FEATURE BREAKDOWN

### 1. LOGIN PAGE (`/admin/login`)
- Email + password form
- Remember me checkbox (optional)
- JWT token in httpOnly cookie
- Redirect to dashboard on success
- Error handling with toast notifications

**API**: `POST /api/admin/auth/login`

---

### 2. DASHBOARD (`/admin`)
- **KPI Cards** (4):
  - Total Products count
  - Low Stock Items count
  - Orders Today count
  - Revenue Today (sum of order totals)

- **Activity Feed**:
  - Recently added products (last 5)
  - Stock updates
  - Recent orders (live)
  - Trending products by views

- **Charts** (Recharts):
  - Revenue trend (last 7 days)
  - Top selling categories (pie chart)
  - Best sellers by sales (bar chart)
  - Stock health distribution (donut chart)

**APIs**:
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/recent-activity`
- `GET /api/admin/analytics/revenue`
- `GET /api/admin/analytics/top-products`

---

### 3. PRODUCT LIST (`/admin/products`)
- **Searchable Table** with columns:
  - Thumbnail (product image)
  - Name (clickable, links to edit)
  - Category
  - Price Range (min-max of variants)
  - Stock Status (in-stock/low/out, color-coded)
  - Variant Count
  - Actions (edit, view, duplicate, delete)

- **Filters**:
  - By Category (dropdown)
  - By Stock Status (In Stock / Low Stock / Out of Stock)
  - By Badge (Organic, Vegan, Sale, New, etc.)
  - By Rating range

- **Sort Options**:
  - Name (A-Z)
  - Price (low-to-high)
  - Stock level
  - Created date
  - Popularity (sales count)

- **Pagination**: 20/50/100 items per page

- **Bulk Actions**:
  - Delete multiple
  - Add badge to all selected
  - Change category
  - Set discount for all variants

**APIs**:
- `GET /api/admin/products` (with filters, sort, pagination)
- `DELETE /api/admin/products/:id`
- `POST /api/admin/products/bulk-delete`
- `PATCH /api/admin/products/bulk-update`

---

### 4. PRODUCT CREATE/EDIT (`/admin/products/create`, `/admin/products/:id/edit`)

Tabbed interface:

#### TAB 1: BASIC INFO
- **Name** (text input, required, max 120 chars, live char count)
- **Slug** (text input, auto-generated from name, editable, unique validation)
- **Category** (dropdown, required)
- **Short Description** (textarea, max 100 chars, live char count)
- **Description** (rich text editor, required, support bold/italic/lists/links)
- **Ingredients** (textarea, optional, for food/supplement products)
- **Base Price** (decimal input, required, shows currency symbol ₹)
- **Flags**:
  - isFeatured (checkbox)
  - isBestSeller (checkbox)
  - isLatestArrival (checkbox)
  - isActive (toggle, default on)

#### TAB 2: VARIANTS (Add/Edit/Delete/Reorder)
- **Existing Variants Table**:
  - Columns: Name | Price | Discount Price | Discount % | Offer | SKU | Stock | Actions
  - Inline edit or modal edit per variant
  - Drag-to-reorder (updates order)
  - Delete button with confirmation

- **"Add Variant" Button** → Modal Form:
  - Name (e.g., "500ml", "1kg") - required
  - Price - required
  - Discount Price (optional) - shows calculated % if filled
  - Discount % (0-100, optional)
  - Offer Text (optional, e.g., "Save ₹40!")
  - SKU (auto-generate or manual)
  - Stock Quantity (default 0)
  - Low Stock Threshold (default 10)
  - Shelf Life (dropdown: 30 DAYS, 90 DAYS, 180 DAYS, 365 DAYS, Never)
  - Rating (display-only, seeded from reviews)
  - Review Count (display-only)
  - Save button

#### TAB 3: IMAGES (YOUR PRIORITY - Drag-and-Drop Upload)
- **Upload Zone**:
  - Large drag-and-drop area ("Drag images here or click to browse")
  - Accepts multiple files (JPG, PNG, WebP)
  - Upload progress bar with file names
  - Error handling (file size, format)

- **Existing Images Gallery**:
  - Grid layout (4 columns on desktop, responsive on mobile)
  - Each image card shows:
    - Thumbnail preview
    - File name
    - Upload date
    - **Gold star** if isDefault (visual indicator)
    - Alt text field (inline edit)
    - Display order number
    - "Set as Default" button (star outline)
    - Delete button (X, with confirmation)

- **Drag-to-Reorder**:
  - Drag image cards to reorder
  - Updates displayOrder field
  - Visual feedback (outline when dragging)

- **Image Preview Modal**:
  - Click thumbnail to see full-size preview
  - Confirm alt text is good
  - Close to return to grid

#### TAB 4: SEO (Optional, for Web)
- URL Slug (editable, validated)
- Meta Title (text, max 60 chars, for Google)
- Meta Description (textarea, max 160 chars, for Google)
- Keywords (comma-separated, optional)
- OG Image (auto-select from product images)

#### TAB 5: SETTINGS
- isActive toggle
- Created timestamp (display-only)
- Updated timestamp (display-only)
- Audit trail (future: who changed what and when)

**Buttons**:
- SAVE button → `PATCH /api/admin/products/:id` (or POST for create)
- CANCEL → Return to product list
- DELETE button → Confirmation modal → `DELETE /api/admin/products/:id`

**APIs**:
- `POST /api/admin/products` (create)
- `PATCH /api/admin/products/:id` (update)
- `DELETE /api/admin/products/:id` (delete)
- `POST /api/admin/products/:id/images` (upload images, handles FormData)
- `PATCH /api/admin/products/:id/images/:imgId` (update alt text)
- `PATCH /api/admin/products/:id/images/:imgId/set-default` (set as default)
- `DELETE /api/admin/products/:id/images/:imgId` (delete image)
- `POST /api/admin/products/:id/variants` (create variant)
- `PATCH /api/admin/products/:id/variants/:vid` (update variant)
- `DELETE /api/admin/products/:id/variants/:vid` (delete variant)

---

### 5. CATEGORY MANAGEMENT (`/admin/categories`)
- CRUD operations for categories
- Drag-to-reorder for homepage display
- Product count per category
- Simple form (name, slug, description)

**APIs**:
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `PATCH /api/admin/categories/:id/reorder` (updates sortOrder)

---

### 6. INVENTORY/STOCK DASHBOARD (`/admin/inventory`)
- **Overview Cards**:
  - Total SKUs
  - In Stock count
  - Low Stock count
  - Out of Stock count
  - Total units in inventory

- **Stock Status Table**:
  - Columns: Product | Variant | Current Stock | Threshold | Status (color) | Last Updated
  - Filters: By Status, By Category
  - Inline edit for stock quantity and threshold
  - Sort by stock level

- **Low Stock Alerts**:
  - Highlighted section
  - Items below threshold
  - Quick action buttons

**APIs**:
- `GET /api/admin/inventory/overview`
- `GET /api/admin/inventory/stock-status`
- `PATCH /api/admin/products/:id/variants/:vid/stock`

---

### 7. ANALYTICS DASHBOARD (`/admin/analytics`)
- **Charts**:
  - Revenue trend (line chart, last 7/30 days)
  - Orders trend (bar chart)
  - Top selling products (table)
  - Top selling categories (pie chart)
  - Most viewed products (bar chart, last 24h/7d/30d)

- **Metrics**:
  - Total Revenue
  - Total Orders
  - Average Order Value
  - Conversion Rate
  - Repeat Customers

- **Filters**:
  - Date range picker
  - Category filter
  - Product filter

- **Export**:
  - Export as CSV (sales, inventory, products)

**APIs**:
- `GET /api/admin/analytics/revenue?days=7`
- `GET /api/admin/analytics/orders?days=7`
- `GET /api/admin/analytics/top-products`
- `GET /api/admin/analytics/top-categories`
- `GET /api/admin/analytics/viewed-products`

---

### 8. SITE SETTINGS (`/admin/settings`)
- **General**:
  - Site name
  - Logo upload
  - Support email
  - Business address

- **Shipping**:
  - Free shipping threshold (₹4000)
  - Shipping cost (₹500)
  - Tax percentage

- **Notifications**:
  - Email on low stock (toggle)
  - Email on new order (toggle)
  - Email on order shipped (toggle)

- **Display**:
  - Products per page
  - Trending window (hours for view tracking)
  - Featured products count

- **Payment**:
  - Razorpay API key (placeholder)

**APIs**:
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`

---

### 9. USER MANAGEMENT (`/admin/users`)
- List all admin users (table with name, email, role, status, last login)
- Create new admin account
- Edit admin (name, email, role, status)
- Delete admin
- Reset password (send email link)

**APIs**:
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/:id/reset-password`

---

## IMPLEMENTATION STEPS

### Step 1: Create Next.js Admin App
```bash
cd c:\xampp\htdocs\CountryNaturalFoods
pnpm create next-app@latest apps/admin-web --typescript --tailwind
cd apps/admin-web
```

### Step 2: Setup Shared Packages
```bash
mkdir -p packages/admin-types packages/admin-api-client packages/admin-services

# Install dependencies in each package (package.json with name: @countrynatural/admin-types, etc.)
```

### Step 3: Create Admin API Endpoints
In `/apps/api`:
- Create `AdminAuthController` in `src/auth/admin-auth.controller.ts`
- Create `AdminProductsController` in `src/products/admin-products.controller.ts`
- Create `AdminCategoriesController` in `src/categories/admin-categories.controller.ts`
- Create guards and decorators for role-based access

### Step 4: Build Frontend
In `/apps/admin-web`:
- Login page with form validation
- Dashboard with KPI cards
- Product list with table, filters, sorting
- Product create/edit form (tabbed)
- Image upload with drag-and-drop
- Other feature pages

### Step 5: Test & Deploy
- Unit tests for API endpoints
- Integration tests for admin workflows
- User acceptance testing
- Deploy to staging at `/admin`

---

## DECISION CHECKLIST

Before you start, confirm:

✅ **Do you want web admin first?** YES
✅ **Do you want shared code for mobile later?** YES (prepare now)
✅ **Are image upload and variant management priority?** YES
✅ **Do you need real-time analytics?** NO (daily refresh is fine)
✅ **Do you need password reset email?** NO (can add later)
✅ **What UI library do you prefer?** Tailwind + Shadcn/ui (modern, flexible)

---

## ESTIMATED TIMELINE

| Phase | Duration | Start | Deliverable |
|-------|----------|-------|-------------|
| Admin Web MVP | 4 weeks | Week 1 | Full CRUD, images, variants, analytics |
| Shared Packages | 1 week | Week 2 (overlap) | Reusable API client, types, services |
| Admin Mobile (optional) | 3 weeks | After web MVP | Mobile-optimized quick actions app |
| **Total (web only)** | **4 weeks** | **Now** | **Production-ready admin portal** |

---

## QUESTIONS FOR YOU

1. **Customization Level**: Do you want fancy animations/transitions, or keep it simple and functional?
   - Simple is fine, we can add polish later

2. **Mobile Urgency**: Do you need mobile admin app right away, or is web enough?
   - Web is sufficient initially, mobile can wait

3. **Real-time Updates**: Do you want live dashboard updates (WebSocket), or is page refresh OK?
   - Page refresh is fine, real-time can be Phase 2

4. **Payment Integration**: Should admin see payment details, or just orders?
   - Orders with totals is sufficient for now

5. **Image Optimization**: Should admin be able to crop/resize images, or upload as-is?
   - Upload as-is for now, can optimize on backend later

---

## NEXT STEP

**Ready to start?** I can begin with:
1. Creating `/apps/admin-web` with Next.js + Tailwind setup
2. Creating `/packages/admin-types` with TypeScript interfaces
3. Building the login page and authentication flow
4. Setting up backend admin auth endpoints

**Or would you like me to clarify anything first?**

Let me know and I'll start Phase 1 immediately!

