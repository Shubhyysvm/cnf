# Authentication System - Current State & Status

## System Overview
CountryNaturalFoods uses a multi-step authentication system with OTP verification for both registration and phone login.

## Database Schema

### users table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| **phone** | VARCHAR(10) | Unique phone number ✓ |
| password | VARCHAR | Hashed password |
| name | VARCHAR | Full name |
| isActive | BOOLEAN | Account status |
| role | ENUM | User role (user/admin) |
| createdAt | TIMESTAMP | Account creation |
| updatedAt | TIMESTAMP | Last update |

### user_profiles table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to users |
| firstName | VARCHAR | First name |
| middleName | VARCHAR | Middle name (optional) |
| lastName | VARCHAR | Last name |
| avatarUrl | VARCHAR | Profile picture URL |
| preferences | JSON | User preferences |
| createdAt | TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | Last update |

**Note**: phone field is ONLY in users table (not in user_profiles)

## Auth Service Methods

### 1. register()
**Purpose**: Initiate registration and send OTP

**Input**:
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;      // 10 digits
  password: string;   // min 6 chars
  middleName?: string;
}
```

**Output**:
```typescript
{ message: "OTP sent to your phone number. Please verify to complete signup." }
```

**Logic**:
- Validates all required fields
- Validates phone format (10 digits)
- Validates email format
- Validates password length (min 6)
- Checks for existing email/phone
- Generates OTP (6 digits)
- Stores OTP with 10-min expiry
- **DOES NOT create user account yet**

### 2. verifyRegister()
**Purpose**: Verify OTP and create user account

**Input**:
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  otp: string;        // 6 digits from step 1
  middleName?: string;
}
```

**Output**:
```typescript
{
  token: string;      // JWT token
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;    // from users table
  }
}
```

**Logic**:
- Validates OTP against stored value
- Checks OTP expiry
- Hashes password
- Creates User in users table (with phone)
- Creates UserProfile in user_profiles table (name details only)
- Clears OTP
- Returns JWT token

### 3. login()
**Purpose**: Email/password login

**Input**:
```typescript
{
  email: string;
  password: string;
}
```

**Output**:
```typescript
{
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  }
}
```

**Logic**:
- Validates email format
- Looks up user by email
- Verifies password hash
- Returns JWT token

### 4. sendOTP()
**Purpose**: Send OTP for phone-based login

**Input**:
```typescript
{
  phone: string;      // 10 digits
}
```

**Output**:
```typescript
{ message: "OTP sent successfully" }
```

**Logic**:
- Validates phone format
- Queries users table for phone (CORRECT - phone in users table)
- Returns error if user not found
- Generates OTP
- Stores with 10-min expiry
- **Logs OTP to console (in production use SMS service)**

### 5. verifyOTP()
**Purpose**: Verify OTP and return JWT for phone login

**Input**:
```typescript
{
  phone: string;      // 10 digits
  otp: string;        // 6 digits from sendOTP
}
```

**Output**:
```typescript
{
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  }
}
```

**Logic**:
- Validates OTP
- Queries users table for phone
- Returns JWT token

## Flow Diagrams

### Registration Flow
```
1. Client POST /auth/register
   {firstName, lastName, email, phone, password, middleName?}
   ↓
   Server validates & sends OTP
   ↓ Response: { message: "OTP sent" }

2. Client POST /auth/verify-register
   {firstName, lastName, email, phone, password, middleName?, otp}
   ↓
   Server validates OTP, creates user & profile
   ↓ Response: { token, user }

3. Client is logged in ✓
```

### Email/Password Login
```
1. Client POST /auth/login
   {email, password}
   ↓
   Server validates credentials
   ↓ Response: { token, user }

2. Client is logged in ✓
```

### Phone-Based Login
```
1. Client POST /auth/send-otp
   {phone}
   ↓
   Server queries users table, sends OTP
   ↓ Response: { message: "OTP sent" }

2. Client POST /auth/verify-otp
   {phone, otp}
   ↓
   Server validates OTP
   ↓ Response: { token, user }

3. Client is logged in ✓
```

## Key Implementation Details

### OTP Storage
- **Type**: In-memory Map (temporary)
- **Structure**: `Map<phone, { code: string, expiresAt: Date }>`
- **Expiry**: 10 minutes
- **Production**: Should use Redis with persistence

### Password Hashing
- **Algorithm**: bcrypt with salt rounds = 10
- **Verification**: bcrypt.compare()

### JWT Token
- **Algorithm**: HS256
- **Payload**: `{ sub: userId, email, phone, role }`
- **Expiry**: 30 days
- **Secret**: From `JWT_SECRET` env variable (default: 'changeme')

### Phone Format Validation
- **Format**: Exactly 10 digits (0-9)
- **Regex**: `/^[0-9]{10}$/`
- **Example**: "1234567890"

### Email Format Validation
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Example**: "user@example.com"

### Password Validation
- **Minimum length**: 6 characters
- **Hashing**: bcrypt with 10 salt rounds

## Error Handling

### Registration (register)
| Error | Status | Message |
|-------|--------|---------|
| Missing field | 400 | "All required fields must be provided" |
| Invalid phone | 400 | "Phone number must be exactly 10 digits" |
| Invalid email | 400 | "Please enter a valid email address" |
| Short password | 400 | "Password must be at least 6 characters" |
| Duplicate email | 409 | "Email already registered" |
| Duplicate phone | 409 | "Phone number already registered" |

### Verify Register (verifyRegister)
| Error | Status | Message |
|-------|--------|---------|
| No OTP found | 401 | "No OTP found. Please request a new one." |
| Wrong OTP | 401 | "Invalid OTP. Please try again." |
| Expired OTP | 401 | "OTP has expired. Please request a new one." |

### Login (login)
| Error | Status | Message |
|-------|--------|---------|
| Missing email | 400 | "Email is required" |
| Missing password | 400 | "Password is required" |
| Invalid email | 400 | "Please enter a valid email address" |
| User not found | 401 | "No account found with this email. Please sign up first." |
| Wrong password | 401 | "Incorrect password. Please try again." |

### Send OTP (sendOTP)
| Error | Status | Message |
|-------|--------|---------|
| Missing phone | 400 | "Phone number is required" |
| Invalid phone | 400 | "Phone number must be exactly 10 digits" |
| User not found | 401 | "No account linked to this phone number. Please sign up first." |

### Verify OTP (verifyOTP)
| Error | Status | Message |
|-------|--------|---------|
| No OTP found | 401 | "No OTP found. Please request a new one." |
| Wrong OTP | 401 | "Invalid OTP. Please try again." |
| Expired OTP | 401 | "OTP has expired. Please request a new one." |
| User not found | 401 | "User not found" |

## Key Files
- **Service**: `apps/api/src/auth/auth.service.ts`
- **Controller**: `apps/api/src/auth/auth.controller.ts`
- **Entity (User)**: `apps/api/src/entities/user.entity.ts`
- **Entity (Profile)**: `apps/api/src/entities/user-profile.entity.ts`

## Recent Fixes

### Phone Field Consolidation
- **Issue**: Phone was duplicated in users and user_profiles tables
- **Fix**: Removed phone from user_profiles storage
- **Result**: Phone only stored in users table (single source of truth)
- **Date**: Current session
- **Impact**: Prevents data inconsistency, simpler schema

## Testing Checklist

- [ ] Registration: Email validation
- [ ] Registration: Phone validation (10 digits)
- [ ] Registration: Password validation (min 6 chars)
- [ ] Registration: OTP sending
- [ ] Registration: OTP verification
- [ ] Registration: User creation in users table
- [ ] Registration: UserProfile creation (NO phone field)
- [ ] Login: Email/password verification
- [ ] Phone Login: OTP sending (queries users.phone)
- [ ] Phone Login: OTP verification
- [ ] JWT Token: Contains correct payload (sub, email, phone, role)
- [ ] Error Handling: All error messages display correctly

## Next Steps (If Needed)
1. Create database migration to remove phone from user_profiles
2. Implement SMS service integration for OTP delivery
3. Add email verification as alternative to phone
4. Implement token refresh mechanism
5. Add rate limiting for OTP requests
6. Add 2FA (Two-Factor Authentication)

