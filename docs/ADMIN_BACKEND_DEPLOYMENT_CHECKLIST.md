# Admin Backend Deployment Checklist

**Version**: 1.0.0 | **Status**: Ready for Production

---

## 📋 Pre-Deployment Checklist

### Code Review
- [ ] All TypeScript files compile without errors
- [ ] No `console.log()` statements left in production code
- [ ] All error handling uses proper HTTP status codes
- [ ] No hardcoded credentials in code
- [ ] All environment variables properly documented
- [ ] Code follows NestJS conventions and style guide
- [ ] All imports are used (no unused imports)
- [ ] No circular dependencies

### Database
- [ ] PostgreSQL database is accessible
- [ ] Migration for `audit_logs` table created
- [ ] Indices created on:
  - `audit_logs(admin_id, created_at)`
  - `audit_logs(action, created_at)`
  - `audit_logs(resource_type, resource_id)`
- [ ] Admin entity schema updated with new fields:
  - `last_login` (timestamp)
  - `permissions` (text array)
  - `is_active` (boolean)
- [ ] Database backup taken
- [ ] Connection string verified in environment

### Dependencies
- [ ] All npm packages installed (`pnpm install`)
- [ ] No security vulnerabilities in dependencies (`npm audit`)
- [ ] Lock file committed to git
- [ ] Development dependencies separated from production
- [ ] Node modules `.gitignore` properly configured

### Environment Configuration
- [ ] `.env` file created with all required variables
- [ ] JWT secret configured
- [ ] Database connection string set
- [ ] SMTP configuration for emails (if applicable)
- [ ] MinIO S3 configuration verified
- [ ] Rate limiting configuration set
- [ ] Cors configuration appropriate for production
- [ ] Environment variables not committed to git

### API Documentation
- [ ] Swagger UI accessible at `/api/docs`
- [ ] All endpoints documented with `@ApiOperation`
- [ ] Request/response examples provided
- [ ] Error responses documented
- [ ] Query parameters documented
- [ ] Authentication requirements marked

### Security Review
- [ ] RBAC permissions configured correctly
- [ ] JWT token expiration set appropriately
- [ ] Password hashing implemented (bcrypt)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using TypeORM)
- [ ] XSS protection configured
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] Request logging enabled for audit trail

### Testing
- [ ] Unit tests written and passing (if applicable)
- [ ] Integration tests written and passing
- [ ] RBAC permission tests passing
- [ ] Settings validation tests passing
- [ ] Dashboard calculation tests passing
- [ ] Audit logging tests passing
- [ ] Error handling tests passing
- [ ] Load testing completed (if applicable)

---

## 🚀 Deployment Steps

### Step 1: Database Setup
```bash
# 1. Connect to PostgreSQL
psql -U postgres -h localhost

# 2. Create migration if not exists (skip if using TypeORM migrations)
# Migration SQL:
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_created 
  ON audit_logs(admin_id, created_at DESC);
  
CREATE INDEX idx_audit_logs_action_created 
  ON audit_logs(action, created_at DESC);
  
CREATE INDEX idx_audit_logs_resource 
  ON audit_logs(resource_type, resource_id);

# 3. Verify Admin table has new columns
ALTER TABLE admin ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE admin ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';
ALTER TABLE admin ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

### Step 2: Environment Setup
```bash
# 1. Create .env file
cp .env.example .env

# 2. Update .env with actual values
nano .env

# Required variables:
DATABASE_URL=postgresql://user:password@localhost:5432/country_natural_foods
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=3600

# Optional but recommended:
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Build Application
```bash
# 1. Install dependencies
pnpm install

# 2. Build API
pnpm build --filter=api

# 3. Build admin-web (if needed)
pnpm build --filter=admin-web

# 4. Verify builds
ls -la dist/apps/api
```

### Step 4: Start Services
```bash
# 1. Start API server
NODE_ENV=production pnpm start:prod --filter=api

# 2. Verify server is running
curl http://localhost:3001/api/health

# 3. Verify Swagger UI
curl http://localhost:3001/api/docs

# 4. Check database connection
curl http://localhost:3001/api/admin/settings -H "Authorization: Bearer <token>"
```

### Step 5: Create Initial Super Admin
```bash
# Use API endpoint to create first super admin
POST /api/admin/users

{
  "name": "System Administrator",
  "email": "admin@countrynatural.com",
  "password": "InitialSecurePassword123!",
  "role": "SUPER_ADMIN"
}

# Response:
{
  "id": "uuid",
  "name": "System Administrator",
  "email": "admin@countrynatural.com",
  "role": "SUPER_ADMIN",
  "permissions": [...],
  "isActive": true
}
```

### Step 6: Verify All Modules
```bash
# 1. Test Admin Users Module
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer <token>"

# 2. Test Dashboard Module
curl http://localhost:3001/api/admin/dashboard \
  -H "Authorization: Bearer <token>"

# 3. Test Settings Module
curl http://localhost:3001/api/admin/settings \
  -H "Authorization: Bearer <token>"

# 4. Test Audit Logs Module
curl http://localhost:3001/api/admin/audit-logs \
  -H "Authorization: Bearer <token>"
```

---

## 🔍 Post-Deployment Verification

### Health Checks
- [ ] API server is running and responsive
- [ ] Database connections are stable
- [ ] All endpoints returning 200/201 responses
- [ ] Swagger UI is accessible
- [ ] JWT authentication is working
- [ ] RBAC is enforcing permissions
- [ ] Audit logging is capturing actions

### Performance Checks
- [ ] Dashboard queries complete in < 2 seconds
- [ ] List endpoints with pagination performing well
- [ ] Database indices are being used
- [ ] No N+1 query problems
- [ ] Cache hit rates acceptable (if caching enabled)

### Security Checks
- [ ] HTTPS is enforced in production
- [ ] CORS headers are properly set
- [ ] Rate limiting is active
- [ ] No sensitive data in logs
- [ ] JWT tokens have appropriate expiration
- [ ] RBAC denies unauthorized access
- [ ] Input validation is working

### Monitoring Setup
- [ ] Application logs are being collected
- [ ] Error tracking is configured (Sentry, etc.)
- [ ] Performance monitoring is active
- [ ] Database query monitoring enabled
- [ ] Alert notifications configured

---

## 📊 Production Configuration Examples

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install --prod

COPY dist/apps/api ./dist

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
```

### Docker Compose (with Database)
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/country_natural
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: country_natural
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### Nginx Configuration (Reverse Proxy)
```nginx
upstream api {
    server api:3001;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running queries
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20;
}
```

### PM2 Configuration (for Node deployments)
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'country-natural-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};

// Start:
// pm2 start ecosystem.config.js
```

---

## 🆘 Rollback Plan

If deployment fails or issues occur:

### Quick Rollback Steps
```bash
# 1. Stop current services
docker-compose down
# OR
pm2 stop all

# 2. Restore previous database state
psql -U user -d country_natural < backup_$(date +%Y%m%d).sql

# 3. Revert code to previous commit
git checkout <previous-commit>

# 4. Rebuild and restart
pnpm install
pnpm build --filter=api
docker-compose up -d

# 5. Verify services
curl http://localhost:3001/api/health
```

### Monitoring During Rollback
- [ ] Monitor API error rates
- [ ] Check database replication lag
- [ ] Verify all endpoints are responding
- [ ] Check application logs for errors
- [ ] Verify RBAC is still working

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue 1: Database Connection Failed**
```
Error: ECONNREFUSED localhost:5432

Solution:
1. Check PostgreSQL is running: sudo systemctl status postgresql
2. Verify connection string in .env
3. Check database credentials
4. Verify firewall allows port 5432
```

**Issue 2: JWT Token Invalid**
```
Error: Unauthorized - Invalid token

Solution:
1. Verify JWT_SECRET matches between encode/decode
2. Check token expiration hasn't passed
3. Verify Authorization header format: "Bearer <token>"
4. Check token wasn't modified in transit
```

**Issue 3: Audit Logs Table Not Found**
```
Error: table "audit_logs" does not exist

Solution:
1. Run migration: npm run migration:run
2. Or create manually using SQL provided above
3. Verify migration file exists in src/migrations/
4. Check TypeORM migration configuration
```

**Issue 4: RBAC Permissions Not Working**
```
Error: User denied permission even though should have access

Solution:
1. Verify user's role is set correctly
2. Check permission exists in ROLE_PERMISSIONS
3. Verify permission key spelling matches exactly
4. Check audit logs to see what permission was checked
5. Run: SELECT * FROM admin WHERE id = '<user-id>';
```

**Issue 5: Dashboard Metrics Wrong**
```
Error: Dashboard KPI calculations don't match expected values

Solution:
1. Verify date range queries
2. Check data in orders, products, reviews tables
3. Enable query logging to see actual SQL
4. Test calculations manually with test data
5. Review calculation logic in dashboard.service.ts
```

---

## 📞 Support Contacts

- **Database Issues**: Database Administrator
- **Security Issues**: Security Team
- **Performance Issues**: DevOps Team
- **Feature Issues**: Backend Team

---

## ✅ Sign-Off

- [ ] Deployment checklist completed by: _________________
- [ ] Database verified by: _________________
- [ ] Security review completed by: _________________
- [ ] Performance testing approved by: _________________
- [ ] Production deployment approved by: _________________

**Date**: _________________  
**Time**: _________________  
**Status**: Ready for Production ✅

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-15  
**Next Review**: 2026-02-15
