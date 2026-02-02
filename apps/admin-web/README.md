# Admin Web Portal - Country Natural Foods

Admin portal for managing Country Natural Foods products, variants, images, categories, and more.

## Features

- 🔐 Admin authentication (JWT)
- 📦 Product management (CRUD)
- 🖼️ Image upload with drag-and-drop
- 🎁 Variant management
- 📊 Inventory dashboard
- 📈 Analytics
- ⚙️ Site settings
- 👥 User management

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **API**: Axios (via shared admin-api-client)
- **State**: React Context
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# From workspace root
pnpm install

# Start dev server (runs on port 3002)
pnpm -F @countrynatural/admin-web dev
```

### Build

```bash
pnpm -F @countrynatural/admin-web build
pnpm -F @countrynatural/admin-web start
```

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Dashboard
│   │   ├── layout.tsx            # Admin layout
│   │   ├── products/             # Product management
│   │   ├── categories/           # Category management
│   │   ├── inventory/            # Stock dashboard
│   │   ├── analytics/            # Analytics
│   │   ├── settings/             # Site settings
│   │   └── users/                # Admin accounts
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect to admin/login
│   └── globals.css               # Global styles
├── components/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── ProductForm.tsx
│   ├── ImageUploader.tsx
│   └── ...
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAdminAuth.ts
│   ├── useProducts.ts
│   └── ...
└── lib/
    ├── api.ts                    # API client instance
    └── utils.ts                  # Utility functions
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Integration

Uses shared `@countrynatural/admin-api-client` package for all API calls.

## Shared Packages

- `@countrynatural/admin-types` - TypeScript types and interfaces
- `@countrynatural/admin-api-client` - HTTP client for API calls
- `@countrynatural/admin-services` - Validation and business logic

## Contributing

Follow the project's TypeScript and styling conventions.

## License

Private - Country Natural Foods
