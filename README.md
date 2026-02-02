# CNF Website

Country Natural Foods e-commerce platform - Website repository containing web applications, admin panel, API backend, and shared packages for Hostinger deployment.

##  Repository Structure

This is a Turborepo monorepo optimized for web deployment with the following applications:

### Applications

- **apps/web** - Customer-facing Next.js storefront (main website)
- **apps/admin-web** - Admin panel for managing products, orders, and settings
- **apps/api** - NestJS backend API serving both web and admin applications

### Shared Packages

- **packages/ui** - Shared UI components
- **packages/types** - Shared TypeScript type definitions
- **packages/admin-types** - Admin-specific type definitions
- **packages/admin-api-client** - Admin API client library
- **packages/admin-services** - Admin service layer
- **packages/config** - Shared configuration
- **packages/api-client** - API client utilities

##  Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL 15+
- MinIO or S3-compatible object storage

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables for API
cp apps/api/.env.example apps/api/.env

# Configure database and MinIO credentials in apps/api/.env
# JWT_SECRET, DATABASE_URL, MINIO_* variables

# Run database migrations
cd apps/api
pnpm run migration:run

# Seed initial data (optional)
pnpm run seed
```

### Development

```bash
# Run all applications
pnpm dev

# Run specific application
pnpm dev --filter=web        # Customer website
pnpm dev --filter=admin-web  # Admin panel
pnpm dev --filter=api        # Backend API
```

### Build for Production

```bash
# Build all applications
pnpm build

# Build specific application
pnpm build --filter=web
pnpm build --filter=admin-web
pnpm build --filter=api
```

##  Deployment (Hostinger)

This repository is configured for Hostinger deployment:

1. **API Backend**: Deploy to Node.js hosting (Port 3000)
2. **Web Frontend**: Deploy Next.js app (Port 3001)
3. **Admin Panel**: Deploy Next.js app (Port 3002)

### Environment Setup

Ensure all environment variables are configured in Hostinger:
- Database credentials (PostgreSQL)
- MinIO/S3 storage credentials
- JWT secrets
- API URLs for web and admin apps

##  Documentation

Comprehensive documentation is available in the /docs directory:

- [STARTUP_GUIDE.md](docs/STARTUP_GUIDE.md) - Complete setup guide
- [ADMIN_BACKEND_START_HERE.md](docs/ADMIN_BACKEND_START_HERE.md) - Admin backend reference
- [AUTH_ARCHITECTURE.md](docs/AUTH_ARCHITECTURE.md) - Authentication system
- [IMAGE_SYSTEM_COMPLETE.md](docs/IMAGE_SYSTEM_COMPLETE.md) - Image management

##  Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Storage**: MinIO (S3-compatible)
- **Monorepo**: Turborepo
- **Package Manager**: pnpm

##  Related Repositories

- Main repository (including mobile): [CountryNaturalFoods](https://github.com/hemanth2731441/CountryNatural)
- Website repository (this repo): [CNF-Website](https://github.com/hemanth2731441/CNF-Website)

##  Notes

- This repository contains only website-related code (no mobile app)
- All shared packages are included for proper monorepo functionality
- Mobile-specific code and documentation have been excluded
- Optimized for Hostinger deployment

##  License

Private - All rights reserved
