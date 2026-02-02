# 🎯 Authentication System - Quick Reference Card

## 🔑 API Endpoints Summary

```
POST /api/auth/register
├─ Body: { name, email, phone, password }
├─ Response: { success, message }
└─ Action: Generate & send OTP

POST /api/auth/verify-register
├─ Body: { name, email, phone, password, otp }
├─ Response: { success, token, user }
└─ Action: Create user with OTP verification

POST /api/auth/login
├─ Body: { email, password }
├─ Response: { success, token, user }
└─ Action: Email + password authentication

POST /api/auth/send-otp
├─ Body: { phone }
├─ Response: { success, message }
└─ Action: Send OTP for phone login

POST /api/auth/verify-otp
├─ Body: { phone, otp }
├─ Response: { success, token, user }
└─ Action: Verify OTP for phone login
```

---

## 📱 Mobile Screens

```
LoginScreen
├─ Email Mode: email + password login
├─ Phone Mode: phone + OTP login
└─ Buttons: Social auth (coming soon)

RegisterScreen
├─ Fields: name, email*, phone*, password, confirm
├─ Validation: email format, phone length, password match
└─ Button: Create Account

OTPScreen
├─ Input: 6 separate digit boxes
├─ Modes: register or login
├─ Timer: 60-second resend countdown
└─ Button: Verify
```

---

## 🔐 Security Implementation

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 rounds) |
| Token Type | JWT (30-day expiry) |
| OTP Expiry | 10 minutes |
| Unique Email | Database constraint |
| Unique Phone | Database constraint |
| Token Storage | AsyncStorage (encrypted) |
| OTP Generation | 6-digit random code |

---

## 🗄️ Database Fields

```sql
users table:
├─ id (uuid, PK)
├─ email (varchar, unique)
├─ phone (varchar, unique) ← NEW
├─ password (varchar, hashed)
├─ name (varchar)
├─ role (enum: customer/admin)
└─ isActive (boolean)
```

---

## 📊 Authentication Flows

### Registration
```
Register Form → register() → OTP Store
                                ↓
OTP Screen → verify-register() → Create User → JWT
                                                 ↓
AsyncStorage → Home (logged in)
```

### Email Login
```
Login Form → login() → Verify Password
                            ↓
JWT → AsyncStorage → Home (logged in)
```

### Phone Login
```
Phone Input → send-otp() → OTP Store
                              ↓
OTP Screen → verify-otp() → JWT
                            ↓
AsyncStorage → Home (logged in)
```

---

## ⚙️ Configuration

### Environment Variables
```bash
JWT_SECRET=your-secret-key-change-in-production
POSTGRES_URL=postgresql://user:pass@localhost:5432/db
NODE_ENV=development
API_PORT=3000
```

### Database Connection
```bash
# PostgreSQL running on:
localhost:5432

# Run migration:
psql -d country_natural_foods < migrations/add_phone_to_users.sql
```

---

## 🚀 Quick Start Commands

```bash
# Database Setup
psql -U postgres -d country_natural_foods
\i path/to/add_phone_to_users.sql

# Backend Start
cd apps/api
pnpm install
pnpm dev

# Mobile Start
cd apps/mobile
pnpm install
pnpm start
```

---

## 🧪 Testing Commands

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","phone":"+1234567890","password":"test123"}'

# Login with email
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","otp":"123456"}'
```

---

## 🐛 Debugging Tips

| Issue | Solution |
|-------|----------|
| OTP not showing | Check API terminal for `[Auth] OTP for...` |
| Phone not in DB | Run migration SQL to add column |
| Token not saving | Verify AsyncStorage installed |
| API not responding | Check http://localhost:3000 accessible |
| DB connection error | Verify PostgreSQL running, credentials correct |

---

## 📂 Key Files Reference

```
Frontend:
├─ apps/mobile/context/AuthContext.tsx (global state)
├─ apps/mobile/screens/LoginScreen.tsx (login UI)
├─ apps/mobile/screens/RegisterScreen.tsx (register UI)
├─ apps/mobile/screens/OTPScreen.tsx (OTP UI)
└─ apps/mobile/App.tsx (navigation)

Backend:
├─ apps/api/src/auth/auth.service.ts (business logic)
├─ apps/api/src/auth/auth.controller.ts (endpoints)
├─ apps/api/src/entities/user.entity.ts (schema)
└─ apps/api/migrations/add_phone_to_users.sql (migration)

Docs:
├─ AUTHENTICATION_SYSTEM_COMPLETE.md (full guide)
├─ AUTH_QUICK_START.md (testing guide)
├─ AUTH_IMPLEMENTATION_SUMMARY.md (overview)
└─ AUTH_ARCHITECTURE.md (architecture)
```

---

## ✅ Success Checklist

- [ ] Database migration executed
- [ ] API server running on :3000
- [ ] Mobile app launches without errors
- [ ] Can register new user
- [ ] OTP received and verified
- [ ] Can login with email + password
- [ ] Can login with phone + OTP
- [ ] Token persists after app restart
- [ ] Logout clears data
- [ ] All navigation works

---

## 🎓 Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| AUTHENTICATION_SYSTEM_COMPLETE.md | Comprehensive guide | Developers |
| AUTH_QUICK_START.md | Testing & setup | QA, DevOps |
| AUTH_IMPLEMENTATION_SUMMARY.md | Executive summary | Project managers |
| AUTH_ARCHITECTURE.md | Technical details | Architects |
| IMPLEMENTATION_CHECKLIST.md | Task tracking | Team leads |
| **This file** | Quick reference | Everyone |

---

## 🔗 Related Systems

```
AuthContext
    ├─ LoginScreen (uses login method)
    ├─ RegisterScreen (uses login method)
    ├─ OTPScreen (uses login method)
    ├─ HomeScreen (checks user state)
    └─ Navigation (routes based on auth)

API Client
    ├─ register endpoint
    ├─ verify-register endpoint
    ├─ login endpoint
    ├─ send-otp endpoint
    └─ verify-otp endpoint

Database
    ├─ users table (stores user data)
    ├─ email index (fast lookup)
    └─ phone index (fast lookup)

AsyncStorage
    ├─ @auth_token (JWT)
    └─ @auth_user (user data)
```

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial release |
| - | - | Core auth complete |
| - | - | Email + password login |
| - | - | Phone + OTP login |
| - | - | Token persistence |
| - | - | Full documentation |

---

## 🎯 What's Next?

### Phase 2: Social Authentication
- [ ] Google Sign-In integration
- [ ] Apple Sign-In integration
- [ ] Intermediate screen for phone collection
- [ ] Account linking

### Phase 3: Enhanced Security
- [ ] SMS service integration
- [ ] Email verification
- [ ] Forgot password flow
- [ ] Rate limiting
- [ ] Account lockout

### Phase 4: Production
- [ ] Redis for OTP storage
- [ ] Refresh tokens
- [ ] Monitoring & logging
- [ ] Load testing
- [ ] Security audit

---

## 💡 Pro Tips

1. **Check OTP in Console**: API logs all generated OTPs with `[Auth] OTP for...`
2. **Test with Same Phone**: Use same phone for multiple tests
3. **Clear Storage**: `AsyncStorage.clear()` to reset authentication state
4. **Check Network**: Ensure mobile app can reach API (use correct IP for physical devices)
5. **Monitor Logs**: Keep API terminal visible to see what's happening

---

## 🆘 Emergency Reset

```javascript
// Clear all stored data (run in mobile app console)
await AsyncStorage.clear();

// Delete test user (run in database)
DELETE FROM users WHERE email = 'test@example.com';

// Clear OTP store (API restart required)
// Stop and restart API server
```

---

## 📞 Quick Help

**Q: Where do I see OTP?**  
A: Check API terminal for `[Auth] OTP for +phone: 123456`

**Q: How long is OTP valid?**  
A: 10 minutes from generation

**Q: How long is JWT valid?**  
A: 30 days from generation

**Q: Where is token stored?**  
A: AsyncStorage with keys `@auth_token` and `@auth_user`

**Q: Can I use same email/phone twice?**  
A: No, database prevents duplicates

**Q: What if I forget my password?**  
A: Coming soon (forgot password feature)

---

**Last Updated**: January 2025  
**Status**: Complete & Ready to Use ✅
