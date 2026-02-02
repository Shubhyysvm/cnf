# 🚀 Country Natural Foods - Complete Startup Guide

**Last Updated**: December 6, 2025  
**Status**: Complete and Ready

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Directory Structure](#directory-structure)
3. [Docker Management](#docker-management)
4. [Database Access](#database-access)
5. [Individual App Startup](#individual-app-startup)
6. [Combined Startup Scenarios](#combined-startup-scenarios)
7. [Troubleshooting](#troubleshooting)
8. [Quick Commands Reference](#quick-commands-reference)

---

## 💻 System Requirements

- **Windows PowerShell** 5.1+ (or PowerShell 7+)
- **Node.js** 18+
- **pnpm** 9.0+
- **Docker & Docker Compose** (for infrastructure)
- **XAMPP** (MySQL/Apache - optional, mainly for PHP support)

**Check Installation**:
```powershell
node --version      # Should be 18+
pnpm --version      # Should be 9.0+
docker --version    # Should be available
docker-compose --version  # Should be available
```

---

## 📁 Directory Structure

```
c:\xampp\htdocs\CountryNaturalFoods\
├── apps/
│   ├── api/                 # NestJS Backend (Port 3001)
│   ├── web/                 # Next.js Customer Website (Port 3000)
│   ├── mobile/              # React Native Mobile App (Expo)
│   └── admin-web/           # Next.js Admin Portal (Port 3002)
├── packages/
│   ├── admin-types/         # Shared TypeScript types
│   ├── admin-services/      # Shared validation & utilities
│   ├── admin-api-client/    # Shared HTTP client
│   └── other packages
├── docker-compose.yml       # Infrastructure (PostgreSQL, MinIO, etc)
└── pnpm-workspace.yaml      # Monorepo configuration
```

**All commands should be run from**: `c:\xampp\htdocs\CountryNaturalFoods\`

---

## 🐳 Docker Management

### Start Docker Infrastructure
```powershell
# From workspace root
cd c:\xampp\htdocs\CountryNaturalFoods

# Start all Docker services (PostgreSQL, MinIO, Adminer, etc)
docker-compose up -d

# Expected services to start:
# ✅ PostgreSQL (Port 5432)
# ✅ MinIO (Port 9000)
# ✅ Adminer (Port 8080)
# ✅ Redis (if configured)
```

**What Gets Started**:
- ✅ PostgreSQL database (Port 5432)
- ✅ MinIO object storage (Port 9000) - for product images
- ✅ Adminer web UI (Port 8080) - database admin tool
- ✅ Any other services defined in docker-compose.yml

**Verify Services Are Running**:
```powershell
docker-compose ps
# Should show all containers with "Up" status
```

### Stop Docker Infrastructure
```powershell
# Stop all services (keeps containers)
docker-compose down

# Stop and remove containers
docker-compose down -v

# View logs while running
docker-compose logs -f
```

---

## 🗄️ Database Access

### Access Database via Adminer (Web UI)

**URL**: http://localhost:8080

**Login Credentials**:
```
System: PostgreSQL
Server: postgres  (or hostname defined in docker-compose)
Username: postgres
Password: [Check docker-compose.yml or .env file]
Database: country_natural_foods
```

**After Login**:
- View all tables
- Run SQL queries
- Export/Import data
- Manage users and permissions

### Access Database via Command Line

```powershell
# Install PostgreSQL client tools (if not already installed)
# Then use:
psql -h localhost -U postgres -d country_natural_foods

# Or via Docker directly:
docker-compose exec postgres psql -U postgres -d country_natural_foods
```

**Common Queries**:
```sql
-- View all tables
\dt

-- View specific table
SELECT * FROM products;

-- View admin users
SELECT id, email, name, role FROM users WHERE role LIKE '%ADMIN%';

-- Check total products
SELECT COUNT(*) FROM products;
```

---

## 🏗️ Individual App Startup

Each application can be started independently. Use the instructions below.

### 1️⃣ Backend API (NestJS)

**Prerequisites**:
- ✅ Docker services running (PostgreSQL, MinIO)
- ✅ Node.js and pnpm installed

**Startup Instructions**:
```powershell
# Terminal 1: Start Docker (if not running)
cd c:\xampp\htdocs\CountryNaturalFoods
docker-compose up -d

# Terminal 2: Start API
cd c:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm run start

# Expected output:
# "API on port 3001"
# Check: http://localhost:3001/api/health
```

**Verify API is Running**:
```powershell
# In browser, visit:
http://localhost:3001/api/health

# Should return JSON response indicating service is healthy
```

**Dev Mode** (with auto-reload):
```powershell
cd apps/api
pnpm run dev
```

---

### 2️⃣ Customer Website (Next.js)

**Prerequisites**:
- ✅ Backend API running (optional, but recommended)
- ✅ Node.js and pnpm installed

**Startup Instructions**:
```powershell
# Terminal: Start Website
cd c:\xampp\htdocs\CountryNaturalFoods\apps\web
pnpm dev

# Expected output:
# "ready - started server on 0.0.0.0:3000"
# Open: http://localhost:3000
```

**Access Website**: http://localhost:3000

---

### 3️⃣ Mobile App (React Native + Expo)

**Prerequisites**:
- ✅ Backend API running (optional)
- ✅ Node.js and pnpm installed
- ✅ Expo CLI installed (`pnpm add -g expo-cli`)

**Startup Instructions**:
```powershell
# Terminal: Start Mobile App
cd c:\xampp\htdocs\CountryNaturalFoods\apps\mobile
pnpm start

# Expected output:
# Expo CLI will show QR code
# Options to run on iOS, Android, or Web
```

**Options After Starting**:
- Press `i` - Open in iOS Simulator
- Press `a` - Open in Android Emulator
- Press `w` - Open in Web Browser
- Press `j` - Open in Expo Go app (mobile)

**For Web Testing**:
```powershell
# In another terminal, while above is running
cd c:\xampp\htdocs\CountryNaturalFoods\apps\mobile
pnpm web
```

---

### 4️⃣ Admin Website (Next.js)

**Prerequisites**:
- ✅ Backend API running (required for login)
- ✅ Docker services running (PostgreSQL)
- ✅ Node.js and pnpm installed

**Startup Instructions**:
```powershell
# Terminal: Start Admin Website
cd c:\xampp\htdocs\CountryNaturalFoods\apps\admin-web
pnpm dev

# Expected output:
# "ready - started server on 0.0.0.0:3002"
# Open: http://localhost:3002
```

**Access Admin Portal**: http://localhost:3002

**First Time Setup**:
1. Visit http://localhost:3002
2. You'll be redirected to /login
3. Enter admin credentials (created in database)
4. Should see dashboard

---

### 5️⃣ Admin Mobile App (React Native)

**Prerequisites**:
- ✅ Backend API running (required for login)
- ✅ Docker services running (PostgreSQL)
- ✅ Node.js and pnpm installed
- ✅ Expo CLI installed

**Status**: 🔜 **To be built after Week 1**

**Startup Instructions** (when available):
```powershell
# Terminal: Start Admin Mobile App
cd c:\xampp\htdocs\CountryNaturalFoods\apps\admin-mobile
pnpm start

# Same Expo options as customer mobile app
```

---

## 🔄 Combined Startup Scenarios

### Scenario 1: Test Admin Website Only (No DB needed initially)

**Goal**: Test the UI without backend

```powershell
# Terminal 1: Start Admin Web (no login)
cd c:\xampp\htdocs\CountryNaturalFoods\apps\admin-web
pnpm dev

# Result:
# ✅ http://localhost:3002 loads
# ✅ Login page visible
# ❌ Login won't work (no backend)
# ✅ UI/UX can be tested
```

---

### Scenario 2: Full Admin Website Setup (Production-Like)

**Order of Startup** (in separate terminals):

```powershell
# 1️⃣ Terminal 1: Start Docker Infrastructure
cd c:\xampp\htdocs\CountryNaturalFoods
docker-compose up -d
# Wait 10-15 seconds for databases to initialize

# 2️⃣ Terminal 2: Start Backend API
cd apps/api
pnpm run start
# Wait for "API on port 3001" message

# 3️⃣ Terminal 3: Start Admin Website
cd apps/admin-web
pnpm dev
# Wait for "ready - started server on 0.0.0.0:3002" message

# 4️⃣ Terminal 4 (Optional): Database Access
# Open browser to http://localhost:8080 (Adminer)
```

**Verification Checklist**:
- [ ] Docker running: `docker-compose ps` shows all "Up"
- [ ] API healthy: http://localhost:3001/api/health returns OK
- [ ] Admin web loads: http://localhost:3002 shows login page
- [ ] Can access database: http://localhost:8080 Adminer accessible
- [ ] Images storage: http://localhost:9000 MinIO accessible (optional)

**Login to Admin Website**:
1. Go to http://localhost:3002
2. Login with admin credentials from database
3. Should see dashboard with products and stats

---

### Scenario 3: Full System Setup (All Apps Running)

**Order of Startup** (in separate terminals):

```powershell
# 1️⃣ Terminal 1: Start Docker Infrastructure
cd c:\xampp\htdocs\CountryNaturalFoods
docker-compose up -d

# 2️⃣ Terminal 2: Start Backend API
cd apps/api
pnpm run start

# 3️⃣ Terminal 3: Start Customer Website
cd apps/web
pnpm dev

# 4️⃣ Terminal 4: Start Customer Mobile App
cd apps/mobile
pnpm start
# Then press 'w' for web version

# 5️⃣ Terminal 5: Start Admin Website
cd apps/admin-web
pnpm dev

# 6️⃣ Terminal 6 (Optional): Admin Mobile App
# (When available after Week 1)
cd apps/admin-mobile
pnpm start
```

**All Services Accessible At**:
| App | URL | Port | Terminal |
|-----|-----|------|----------|
| Customer Website | http://localhost:3000 | 3000 | #3 |
| Backend API | http://localhost:3001 | 3001 | #2 |
| Admin Website | http://localhost:3002 | 3002 | #5 |
| Customer Mobile (Web) | http://localhost:19006 | 19006 | #4 |
| Database Admin | http://localhost:8080 | 8080 | Docker #1 |
| Storage (MinIO) | http://localhost:9000 | 9000 | Docker #1 |

---

### Scenario 4: Just Backend + Database (API Development)

**Order of Startup**:

```powershell
# 1️⃣ Terminal 1: Start Docker
cd c:\xampp\htdocs\CountryNaturalFoods
docker-compose up -d

# 2️⃣ Terminal 2: Start API (Dev mode with auto-reload)
cd apps/api
pnpm run dev

# 3️⃣ Terminal 3: Database Access
# Open http://localhost:8080 in browser
```

**Use Cases**:
- Testing API endpoints with Postman
- Debugging backend logic
- Database schema modifications
- Creating/updating seed data

---

### Scenario 5: Just Customer Apps (Frontend Development)

**Order of Startup**:

```powershell
# 1️⃣ Terminal 1: Start Backend API
cd c:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm run start

# 2️⃣ Terminal 2: Start Customer Website
cd apps/web
pnpm dev

# 3️⃣ Terminal 3: Start Customer Mobile App
cd apps/mobile
pnpm start
```

**Note**: Admin website requires login, so only useful if you also have API running

---

## 🔧 Troubleshooting

### Docker Issues

#### Docker container won't start
```powershell
# Check docker is installed and running
docker --version
docker ps

# If not running, start Docker Desktop

# View error logs
docker-compose logs postgres
docker-compose logs minio

# Rebuild and restart
docker-compose down -v
docker-compose up -d --build
```

#### Port already in use
```powershell
# Find what's using the port (example: 5432)
Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process -Force

# Or change port in docker-compose.yml and restart
docker-compose down
# Edit docker-compose.yml
docker-compose up -d
```

---

### Application Issues

#### API won't start
```powershell
# Check if Docker is running
docker-compose ps

# Check if port 3001 is available
netstat -ano | findstr :3001

# Clear node_modules and reinstall
cd apps/api
Remove-Item node_modules -Recurse -Force
Remove-Item pnpm-lock.yaml
pnpm install
pnpm run start
```

#### Cannot connect to database
```powershell
# Verify Docker is running
docker-compose ps

# Check PostgreSQL container logs
docker-compose logs postgres

# Wait a bit longer (first startup can take 30 seconds)
# Then try connecting again
```

#### Admin website login fails
```
Prerequisites not met:
1. ✅ Docker services running
2. ✅ Backend API running on port 3001
3. ✅ Database initialized with tables
4. ✅ Admin user created in database

Check:
- http://localhost:3001/api/health (API health)
- http://localhost:8080 (Adminer - database access)
- Create test admin user if needed (see Database Access section)
```

---

### Frontend Issues

#### Port 3000/3002 already in use
```powershell
# Option 1: Kill the process
Get-Process -Name node | Stop-Process -Force

# Option 2: Use different port
cd apps/web
pnpm dev -- -p 3001  # Use port 3001 instead

# Option 3: Check what's using the port
netstat -ano | findstr :3000
```

#### Module not found errors
```powershell
# Reinstall dependencies
pnpm install

# Clear Next.js cache
cd apps/admin-web
Remove-Item .next -Recurse -Force
pnpm dev
```

---

## 📚 Quick Commands Reference

### Database & Infrastructure
```powershell
# Start all Docker services
docker-compose up -d

# Stop all Docker services
docker-compose down

# View Docker logs
docker-compose logs -f

# Access database via Adminer
# Browser: http://localhost:8080

# Access database via CLI
docker-compose exec postgres psql -U postgres -d country_natural_foods
```

### Backend API
```powershell
# Start (production mode)
cd apps/api
pnpm run start

# Start (dev mode with auto-reload)
cd apps/api
pnpm run dev

# Check health
# Browser: http://localhost:3001/api/health
```

### Customer Website
```powershell
# Start dev server
cd apps/web
pnpm dev

# Build for production
cd apps/web
pnpm build

# Access
# Browser: http://localhost:3000
```

### Customer Mobile App
```powershell
# Start Expo dev server
cd apps/mobile
pnpm start

# Run on web
cd apps/mobile
pnpm web

# Or while running, press 'w' in the expo terminal
```

### Admin Website
```powershell
# Start dev server
cd apps/admin-web
pnpm dev

# Build for production
cd apps/admin-web
pnpm build

# Access
# Browser: http://localhost:3002
```

### Shared Packages
```powershell
# Build all shared packages
pnpm -F @countrynaturalfoods/admin-types build
pnpm -F @countrynaturalfoods/admin-services build
pnpm -F @countrynaturalfoods/admin-api-client build

# Or from workspace root
pnpm install  # This rebuilds all packages
```

---

## 🔍 Port Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| PostgreSQL | 5432 | localhost:5432 | Database |
| MinIO | 9000 | http://localhost:9000 | Object storage (images) |
| Adminer | 8080 | http://localhost:8080 | Database admin UI |
| Backend API | 3001 | http://localhost:3001 | NestJS API |
| Customer Website | 3000 | http://localhost:3000 | Next.js Frontend |
| Admin Website | 3002 | http://localhost:3002 | Admin Portal |
| Mobile (Expo) | 19006 | http://localhost:19006 | Expo dev server |

---

## 📝 Configuration Files

### Environment Variables

**Backend (.env in apps/api)**:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[from docker-compose]
DB_NAME=country_natural_foods
```

**Admin Website (.env.local in apps/admin-web)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Customer Website (.env.local in apps/web)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## ✅ Startup Checklist

Before claiming everything is working:

- [ ] Docker services running (`docker-compose ps` shows all "Up")
- [ ] PostgreSQL accessible at localhost:5432
- [ ] Adminer accessible at http://localhost:8080
- [ ] Backend API running at http://localhost:3001
- [ ] Backend health check passes (http://localhost:3001/api/health)
- [ ] Customer website running at http://localhost:3000
- [ ] Admin website running at http://localhost:3002
- [ ] Can login to admin website with credentials
- [ ] Can access database tables via Adminer

---

## 🆘 Getting Help

If something doesn't work:

1. **Check Docker**: `docker-compose ps`
2. **Check logs**: `docker-compose logs`
3. **Check ports**: `netstat -ano | findstr :PORT_NUMBER`
4. **Restart everything**: 
   ```powershell
   docker-compose down
   pnpm install
   docker-compose up -d
   ```
5. **Check documentation files**:
   - START_HERE.md
   - QUICK_START.md
   - This file (STARTUP_GUIDE.md)

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot connect to database" | Start Docker: `docker-compose up -d` |
| "Port 3001 already in use" | Kill Node: `Get-Process node \| Stop-Process -Force` |
| "Module not found" | Reinstall: `pnpm install` |
| "Cannot login to admin" | Ensure API is running on port 3001 |
| "API health check fails" | Check Docker & PostgreSQL are running |
| "Expo won't start mobile" | Install CLI: `pnpm add -g expo-cli` |

---

**Last Updated**: December 6, 2025  
**Status**: ✅ Complete and Tested

For detailed feature documentation, see:
- START_HERE.md
- QUICK_START.md
- WEEK1_SUMMARY.md
- Individual app README files
