# Ignored Files Reference for Development

This document lists files that are excluded from version control (git) but required for local development and testing.

## Environment Configuration Files

### Required for API (apps/api)
- `.env` - Contains database credentials, API keys, and secrets
  ```
  DATABASE_URL=postgresql://user:pass@localhost:5432/countrynatural
  JWT_SECRET=your-secret-key
  REDIS_URL=redis://localhost:6379
  MINIO_ENDPOINT=localhost
  MINIO_PORT=9000
  MINIO_ACCESS_KEY=minioadmin
  MINIO_SECRET_KEY=minioadmin
  ```

### Required for Mobile (apps/mobile)
- `.env` - Expo and API configuration
  ```
  EXPO_PUBLIC_API_BASE=http://192.168.x.x:3001
  ```

### Required for Web (apps/web)
- `.env.local` - Next.js environment variables
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```

## Build Artifacts (Auto-generated during development)

### Node modules
- `node_modules/` in root and all apps/packages - Install with `pnpm install`

### Build outputs
- `apps/api/dist/` - NestJS compiled output
- `apps/web/.next/` - Next.js build cache
- `apps/mobile/.expo/` - Expo development files

## IDE Configuration
- `.vscode/settings.json` - VS Code workspace settings
- `.idea/` - JetBrains IDE configuration

## Certificates & Keys (Mobile)
- `*.jks` - Android keystore for release builds
- `*.p12`, `*.mobileprovision` - iOS certificates

## Development Setup Steps

1. Clone the repository
2. Run `pnpm install` in the root directory
3. Create `.env` files in each app using the templates above
4. Run `docker compose up -d` to start infrastructure
5. Start API: `cd apps/api && pnpm run start:dev`
6. Start Web: `cd apps/web && pnpm run dev`
7. Start Mobile: `cd apps/mobile && pnpm start`

## Production Deployment Notes

- Never commit `.env` files or credentials
- Use environment variables in CI/CD pipelines
- Generate new JWT secrets for production
- Update API base URLs for production domains
- Build artifacts are generated during deployment, not committed
