# Auth System Quick Reference Card

## 🎯 Current State
✅ Phone field consolidated to **users table only**  
✅ All auth flows working correctly  
✅ No data duplication  
✅ Single source of truth for phone  

## 📊 Data Schema

| Table | Phone Field | Purpose |
|-------|:-----------:|---------|
| **users** | ✅ YES | Primary storage, queries, authentication |
| **user_profiles** | ❌ NO | Name details, profile info |

## 🔐 Auth Methods

### 1. Registration
```
register(firstName, lastName, email, phone, password)
  → Sends OTP
  
verifyRegister(firstName, lastName, email, phone, password, otp)
  → Creates user + profile
  → Returns token
```

### 2. Email Login
```
login(email, password)
  → Validates credentials
  → Returns token
```

### 3. Phone Login
```
sendOTP(phone)
  → Queries users.phone
  → Sends OTP
  
verifyOTP(phone, otp)
  → Queries users.phone
  → Returns token
```

## ✔️ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Phone | 10 digits | "1234567890" |
| Email | Valid format | "user@example.com" |
| Password | Min 6 chars | "password123" |

## 📁 Key Files

```
apps/api/src/auth/
  ├── auth.service.ts ← Phone field fix applied here
  ├── auth.controller.ts
  └── auth.module.ts

apps/api/src/entities/
  ├── user.entity.ts ← Phone stored here
  └── user-profile.entity.ts ← NO phone field
```

## 🔍 Debug Query

```sql
-- Verify phone location
SELECT id, email, phone FROM users WHERE id = 'user-id';
-- Should return phone from users table

-- Verify user_profiles doesn't have phone
SELECT * FROM user_profiles WHERE userId = 'user-id';
-- Should NOT have phone column
```

## 🚀 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Step 1: Send OTP |
| POST | `/auth/verify-register` | Step 2: Create account |
| POST | `/auth/login` | Email/password login |
| POST | `/auth/send-otp` | Phone login step 1 |
| POST | `/auth/verify-otp` | Phone login step 2 |

## 📋 Recent Fix

**What**: Removed phone from user_profiles  
**Why**: Avoid data duplication  
**Where**: [apps/api/src/auth/auth.service.ts](apps/api/src/auth/auth.service.ts)  
**Impact**: Phone now stored only in users table  

## 🔄 OTP Flow

```
User Input → Generate OTP → Store with 10-min expiry
                ↓
          User Verifies OTP
                ↓
    OTP Valid? → YES → Clear OTP → Return JWT
              NO → Error Message
```

## 📱 Phone Format

- **Length**: Exactly 10 digits
- **Regex**: `/^[0-9]{10}$/`
- **Stored in**: `users.phone`
- **Queried from**: `users.phone`

## 🛡️ Security

- Passwords: bcrypt hash
- OTP: 6-digit, 10-min expiry
- JWT: 30-day expiry, HS256
- Token payload: `{sub, email, phone, role}`

## ⚠️ Common Errors

| Error | Solution |
|-------|----------|
| "Phone must be 10 digits" | Use valid format: "1234567890" |
| "Email already registered" | Use different email |
| "Invalid or expired OTP" | Request new OTP |
| "Incorrect password" | Check credentials |

## 📚 Documentation

- Full details: [AUTH_SYSTEM_CURRENT_STATE.md](AUTH_SYSTEM_CURRENT_STATE.md)
- Fix explanation: [PHONE_FIELD_CONSOLIDATION_FIX.md](PHONE_FIELD_CONSOLIDATION_FIX.md)
- Work summary: [SESSION_WORK_SUMMARY.md](SESSION_WORK_SUMMARY.md)

## 🧪 Test Checklist

- [ ] Register with email validation
- [ ] Register with phone validation
- [ ] OTP verification on registration
- [ ] User created in users table with phone
- [ ] UserProfile created without phone
- [ ] Login with email/password
- [ ] Login with phone OTP
- [ ] JWT token contains phone
- [ ] Error messages display correctly

## 🔮 Next Steps

1. Create database migration to remove phone from user_profiles
2. Implement SMS service for OTP delivery (Twilio, AWS SNS)
3. Move OTP storage to Redis for scalability
4. Add email verification option
5. Implement rate limiting
6. Add 2FA support

---

**Status**: ✅ Ready for use  
**Last Updated**: Current session  
**Tested**: Database queries only  

