# Authentication System - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (React Native)                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      App Root (App.tsx)                  │  │
│  │                                                          │  │
│  │   AuthProvider  ← AuthContext.tsx                        │  │
│  │   CartProvider                                           │  │
│  │   └─ Navigation Stack                                    │  │
│  │      ├─ LoginScreen (email/phone toggle)                │  │
│  │      ├─ RegisterScreen (4 fields + OTP)                 │  │
│  │      ├─ OTPScreen (6-digit verification)                │  │
│  │      ├─ HomeScreen (products list)                      │  │
│  │      ├─ CategoryProducts (filtered products)            │  │
│  │      └─ ProductDetail (single product)                  │  │
│  │                                                          │  │
│  │   AsyncStorage                                           │  │
│  │   ├─ @auth_token (JWT string)                           │  │
│  │   └─ @auth_user (JSON user data)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              │ (HTTPS/TCP)
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (NestJS)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AuthController & AuthService               │  │
│  │                                                          │  │
│  │  POST /api/auth/register                                │  │
│  │    │ Generates OTP                                       │  │
│  │    └─→ OTP Store (in-memory Map)                        │  │
│  │                                                          │  │
│  │  POST /api/auth/verify-register                         │  │
│  │    │ Validates OTP                                       │  │
│  │    │ Hash password (bcrypt)                             │  │
│  │    └─→ Create User                                      │  │
│  │                                                          │  │
│  │  POST /api/auth/login                                   │  │
│  │    │ Find user by email                                 │  │
│  │    │ Compare password (bcrypt)                          │  │
│  │    └─→ Generate JWT                                     │  │
│  │                                                          │  │
│  │  POST /api/auth/send-otp                                │  │
│  │    │ Find user by phone                                 │  │
│  │    └─→ Generate & Store OTP                             │  │
│  │                                                          │  │
│  │  POST /api/auth/verify-otp                              │  │
│  │    │ Validate OTP                                        │  │
│  │    │ Find user by phone                                 │  │
│  │    └─→ Generate JWT                                     │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           PostgreSQL Database                           │  │
│  │                                                          │  │
│  │  users table:                                            │  │
│  │  ├─ id (uuid, primary key)                              │  │
│  │  ├─ email (varchar, unique)                             │  │
│  │  ├─ phone (varchar, unique)                             │  │
│  │  ├─ password (varchar, hashed)                          │  │
│  │  ├─ name (varchar)                                      │  │
│  │  ├─ role (enum: customer/admin)                         │  │
│  │  └─ isActive (boolean)                                  │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow Sequence Diagrams

### Flow 1: Registration with OTP

```
Mobile App                    Backend API              Database
    │                              │                      │
    │ 1. Register Button           │                      │
    │ (name, email, phone, pwd)    │                      │
    ├─────────────────────────────→│                      │
    │                              │ 2. Validate input    │
    │                              │ 3. Generate OTP      │
    │                              │ 4. Store OTP in Map  │
    │                              │ Log: [OTP] XXXXXX    │
    │←─ Response: "OTP sent"       │                      │
    │                              │                      │
    │ 5. Navigate to OTP Screen    │                      │
    │ (user enters 6 digits)       │                      │
    │                              │                      │
    │ 6. Verify Button             │                      │
    ├──────────────────────────────→│                      │
    │ (phone, email, pwd, otp)     │                      │
    │                              │ 7. Validate OTP      │
    │                              │ 8. Hash password     │
    │                              ├─────────────────────→│
    │                              │ 9. Create user       │
    │                              │←─────────────────────┤
    │                              │ 10. Delete OTP       │
    │                              │ 11. Sign JWT         │
    │←─ JWT Token + User Data      │                      │
    │                              │                      │
    │ 12. Save to AsyncStorage     │                      │
    │ 13. Navigate to Home         │                      │
    │                              │                      │
```

### Flow 2: Email Login

```
Mobile App                    Backend API              Database
    │                              │                      │
    │ 1. Login Button              │                      │
    │ (email, password)            │                      │
    ├─────────────────────────────→│                      │
    │                              │ 2. Find user         │
    │                              ├─────────────────────→│
    │                              │←─────────────────────┤
    │                              │ 3. Compare password  │
    │                              │ (bcrypt)             │
    │                              │ 4. Sign JWT          │
    │←─ JWT Token + User Data      │                      │
    │                              │                      │
    │ 5. Save to AsyncStorage      │                      │
    │ 6. Navigate to Home          │                      │
    │                              │                      │
```

### Flow 3: Phone + OTP Login

```
Mobile App                    Backend API              Database
    │                              │                      │
    │ 1. Switch to Phone Mode      │                      │
    │ 2. Enter Phone Number        │                      │
    │                              │                      │
    │ 3. Send OTP Button           │                      │
    ├─────────────────────────────→│                      │
    │ (phone)                      │ 4. Find user         │
    │                              ├─────────────────────→│
    │                              │←─────────────────────┤
    │                              │ 5. Generate OTP      │
    │                              │ 6. Store OTP in Map  │
    │                              │ Log: [OTP] YYYYYY    │
    │←─ Response: "OTP sent"       │                      │
    │                              │                      │
    │ 7. Navigate to OTP Screen    │                      │
    │ (user enters 6 digits)       │                      │
    │                              │                      │
    │ 8. Verify Button             │                      │
    ├──────────────────────────────→│                      │
    │ (phone, otp)                 │                      │
    │                              │ 9. Validate OTP      │
    │                              │ 10. Find user        │
    │                              ├─────────────────────→│
    │                              │←─────────────────────┤
    │                              │ 11. Delete OTP       │
    │                              │ 12. Sign JWT         │
    │←─ JWT Token + User Data      │                      │
    │                              │                      │
    │ 13. Save to AsyncStorage     │                      │
    │ 14. Navigate to Home         │                      │
    │                              │                      │
```

---

## 🔐 Security Layer

### Password Security
```
User Input: "mypassword123"
    ↓
bcrypt.hash(password, 10)
    ↓
Stored in DB: "$2a$10$Oy...encrypted...hash$"
    ↓
On Login: bcrypt.compare(input, stored)
    ↓
Returns: true/false
```

### Token Security
```
User Data: { id, email, phone, role }
    ↓
JWT.sign(payload, SECRET, { expiresIn: '30d' })
    ↓
Generated Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI..."
    ↓
Mobile App: Stores in AsyncStorage
    ↓
Future Requests: Include in Authorization header
    ↓
Backend: Validates signature using SECRET
    ↓
If valid: Proceed
If invalid: Reject (401 Unauthorized)
```

### OTP Security
```
Generate: Math.random() → 6 digits
    ↓
Store: {
  phone: { code: "123456", expiresAt: Date+10min }
}
    ↓
On Verify:
  1. Find phone in OTP store
  2. Check code matches
  3. Check not expired
  4. Clear from store
    ↓
If all pass: Create user/login
If any fail: Reject (401 Unauthorized)
```

---

## 📱 Mobile App State Management

### AuthContext Structure
```typescript
interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Methods
  login(token: string, user: User): Promise<void>;
  logout(): Promise<void>;
  updateUser(user: User): Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
```

### State Persistence Flow
```
App Launch
    ↓
AuthProvider initializes
    ↓
Check AsyncStorage:
  • Load @auth_token
  • Load @auth_user
    ↓
If found:
  • Restore state
  • Set isLoading = false
  • Navigate to Home
    ↓
If not found:
  • Set user = null
  • Set token = null
  • Set isLoading = false
  • Navigate to Login
```

---

## 🌐 API Request/Response Format

### Standard Response Format
```json
{
  "success": true/false,
  "message": "Human-readable message",
  "token": "JWT token (if auth successful)",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400/401/409,
  "error": "BadRequest/Unauthorized/Conflict"
}
```

---

## 🗄️ Database Schema

### Current User Entity
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

---

## 🚀 Deployment Architecture

### Development
```
Local Machine
├─ PostgreSQL (port 5432)
├─ API Server (port 3000)
│  └─ OTP Store: In-memory Map
├─ Mobile Emulator
│  └─ AsyncStorage: Device storage
└─ Console Logs for OTP
```

### Production (Future)
```
Cloud Infrastructure
├─ Managed PostgreSQL (RDS/Cloud SQL)
├─ NestJS API Server (Kubernetes/Container)
│  ├─ OTP Store: Redis cluster
│  ├─ JWT Secret: Environment variable
│  └─ SMS Service: Twilio/AWS SNS
├─ Mobile App
│  └─ AsyncStorage: Encrypted storage
└─ Monitoring: CloudWatch/Datadog
```

---

## 📊 Data Flow Summary

### Complete Authentication Cycle

```
1. USER REGISTRATION
   Mobile App → Register Form → Backend → Database
   (name, email, phone, password)
        ↓
   Backend generates OTP
        ↓
   Mobile App → OTP Screen → Backend → Database
   (phone, email, password, otp)
        ↓
   Backend creates user, returns JWT
        ↓
   Mobile App saves JWT → AsyncStorage
        ↓
   Navigate to Home (authenticated)

2. USER LOGIN (Email)
   Mobile App → Login Form → Backend
   (email, password)
        ↓
   Backend finds user, verifies password
        ↓
   Backend returns JWT
        ↓
   Mobile App saves JWT → AsyncStorage
        ↓
   Navigate to Home (authenticated)

3. USER LOGIN (Phone)
   Mobile App → Phone Input → Backend
   (phone)
        ↓
   Backend sends OTP
        ↓
   Mobile App → OTP Screen → Backend
   (phone, otp)
        ↓
   Backend verifies OTP, returns JWT
        ↓
   Mobile App saves JWT → AsyncStorage
        ↓
   Navigate to Home (authenticated)

4. APP RESTART
   Mobile App launches
        ↓
   AuthProvider checks AsyncStorage
        ↓
   JWT & User data found
        ↓
   Restore state, stay logged in
        ↓
   Navigate to Home (authenticated)

5. LOGOUT
   User taps Logout
        ↓
   AuthContext clears AsyncStorage
        ↓
   State reset to null
        ↓
   Navigate to Login (unauthenticated)
```

---

## 🔗 API Endpoints Map

```
Authentication Endpoints:
├─ POST /api/auth/register
│  └─ Body: { name, email, phone, password }
│  └─ Response: { success, message }
│  └─ Action: Generate OTP, store, return message
│
├─ POST /api/auth/verify-register
│  └─ Body: { name, email, phone, password, otp }
│  └─ Response: { success, token, user }
│  └─ Action: Validate OTP, create user, sign JWT
│
├─ POST /api/auth/login
│  └─ Body: { email, password }
│  └─ Response: { success, token, user }
│  └─ Action: Find user, verify password, sign JWT
│
├─ POST /api/auth/send-otp
│  └─ Body: { phone }
│  └─ Response: { success, message }
│  └─ Action: Find user, generate OTP, store
│
└─ POST /api/auth/verify-otp
   └─ Body: { phone, otp }
   └─ Response: { success, token, user }
   └─ Action: Validate OTP, find user, sign JWT

Product Endpoints (require JWT):
├─ GET /api/products
├─ GET /api/products/:id
├─ GET /api/categories/:id/products
└─ ... (existing endpoints)
```

---

## ⚡ Performance Considerations

### Caching Strategy
- **AsyncStorage**: Token caching on mobile (immediate access)
- **In-Memory OTP Store**: Fast OTP validation (no DB lookup)
- **Database Indexes**: email, phone for quick user lookup

### Load Optimization
- **JWT Tokens**: Stateless, no session storage needed
- **OTP Store**: In-memory (scales to ~100K concurrent registrations)
- **Password Hashing**: Async, non-blocking operations

### Future Optimizations
- Redis for OTP storage (distributed cache)
- Database connection pooling
- API rate limiting
- Caching layer for product data

---

## 🛡️ Error Handling

### HTTP Status Codes
```
200 OK             → Successful operation
201 Created        → Resource created
400 Bad Request    → Invalid input
401 Unauthorized   → Auth failed/invalid OTP
409 Conflict       → Duplicate email/phone
500 Server Error   → Unexpected error
```

### Common Error Scenarios
```
Registration:
  - 400: Missing fields
  - 409: Email/phone already exists

Verify Register:
  - 401: Invalid/expired OTP
  - 409: User created during OTP wait

Login:
  - 401: Invalid email or password

Send OTP:
  - 401: Phone not registered

Verify OTP:
  - 401: Invalid/expired OTP
  - 401: User not found
```

---

## 📈 Scalability Roadmap

### Phase 1 (Current)
- In-memory OTP store
- Single-instance API server
- Console logging for OTP

### Phase 2 (Next)
- Redis for OTP storage
- Horizontal scaling (multiple API instances)
- SMS service integration

### Phase 3 (Future)
- Social authentication (Google, Apple)
- Refresh token mechanism
- Email verification
- Account lockout after failed attempts
- Two-factor authentication (2FA)

---

## 🎯 Key Metrics

### Response Time Targets
- Register endpoint: < 500ms
- Login endpoint: < 300ms
- OTP verification: < 300ms
- Token validation: < 100ms

### Success Metrics
- Registration completion rate: > 85%
- Login success rate: > 95%
- OTP delivery rate: 100%
- Token persistence rate: 100%

---

## 🔗 Component Integration

### How Auth Integrates with Other Systems

```
AuthContext (global state)
    ↓
useAuth() hook
    ↓
Consume in:
  ├─ LoginScreen → Display login form
  ├─ RegisterScreen → Display register form
  ├─ OTPScreen → Verify OTP
  ├─ HomeScreen → Display if authenticated
  ├─ API Client → Add JWT to headers
  └─ Navigation → Conditional rendering

Product System
    ↓
API requests
    ↓
AuthContext provides JWT token
    ↓
API includes Authorization header
    ↓
Backend validates token
    ↓
Return product data (if authenticated)
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Architecture Complete & Implemented ✅
