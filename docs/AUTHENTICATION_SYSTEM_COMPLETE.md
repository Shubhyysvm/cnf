# Advanced Authentication System - Complete Guide

## Overview
Multi-method authentication system supporting email/password, phone/OTP, Google Sign-In, and Apple Sign-In with comprehensive mobile UI and backend integration.

---

## 🎯 Features

### Authentication Methods
1. **Email + Password** - Traditional login
2. **Phone + OTP** - SMS verification (6-digit code)
3. **Google Sign-In** - OAuth integration (Coming Soon)
4. **Apple Sign-In** - iOS native auth (Coming Soon)

### Key Requirements Met
- ✅ **Mandatory Fields**: Email and phone required during registration
- ✅ **Unique Identifiers**: Both email and phone are unique across users
- ✅ **Multiple Login Paths**: Users can login via email+password OR phone+OTP
- ✅ **OTP System**: 6-digit codes with 10-minute expiry
- ✅ **Token Persistence**: AsyncStorage for seamless app reopens
- ✅ **JWT Authentication**: 30-day token expiry
- ✅ **Password Security**: bcrypt hashing with 10 rounds

---

## 📱 Mobile App (React Native)

### Screens Created

#### 1. **LoginScreen.tsx** (`apps/mobile/screens/LoginScreen.tsx`)
**Purpose**: Main authentication entry point

**Features**:
- Toggle between Email and Phone login modes
- Email Login: Email + Password fields
- Phone Login: Phone number field (sends OTP)
- Password visibility toggle
- Social auth buttons (Google, Apple - iOS only)
- Haptic feedback on interactions
- Loading states during API calls

**Navigation Flow**:
- → Register (Don't have an account?)
- → OTP Screen (after phone number submitted)
- → Home (after successful login)

**API Calls**:
```typescript
// Email Login
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: true, token: string, user: {...} }

// Phone Login (Step 1: Request OTP)
POST /api/auth/send-otp
Body: { phone: string }
Response: { success: true, message: "OTP sent successfully" }
```

---

#### 2. **RegisterScreen.tsx** (`apps/mobile/screens/RegisterScreen.tsx`)
**Purpose**: New account creation with full validation

**Required Fields**:
- Full Name (min 2 characters)
- Email (validated format)
- Phone Number (min 10 digits)
- Password (min 6 characters)
- Confirm Password (must match)

**Validation Logic**:
```typescript
const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const validatePhone = (phone: string) => phone.length >= 10;
const validatePassword = (pass: string) => pass.length >= 6;
const passwordsMatch = password === confirmPassword;
```

**Features**:
- Real-time validation feedback
- Dual password visibility toggles
- Terms of Service acknowledgment
- Social signup buttons (Coming Soon alerts)
- Haptic feedback on button press

**Navigation Flow**:
- → OTP Screen (after successful registration)
- → Login (Already have account?)

**API Call**:
```typescript
POST /api/auth/register
Body: {
  name: string,
  email: string,
  phone: string,
  password: string
}
Response: { success: true, message: "OTP sent successfully" }
```

---

#### 3. **OTPScreen.tsx** (`apps/mobile/screens/OTPScreen.tsx`)
**Purpose**: 6-digit OTP verification for both registration and login

**Features**:
- 6 separate input boxes for each digit
- Auto-focus progression as digits entered
- Backspace handling (moves to previous input)
- Visual feedback (filled inputs highlighted)
- 60-second resend countdown timer
- Supports two modes: 'register' and 'login'

**Navigation Params**:
```typescript
interface OTPScreenParams {
  phone: string;
  mode: 'register' | 'login';
  // For registration mode:
  email?: string;
  password?: string;
  name?: string;
}
```

**API Calls**:
```typescript
// Verify Registration OTP
POST /api/auth/verify-register
Body: {
  phone: string,
  email: string,
  password: string,
  name: string,
  otp: string
}
Response: { success: true, token: string, user: {...} }

// Verify Login OTP
POST /api/auth/verify-otp
Body: { phone: string, otp: string }
Response: { success: true, token: string, user: {...} }

// Resend OTP
POST /api/auth/send-otp
Body: { phone: string }
Response: { success: true, message: "OTP sent successfully" }
```

**Usage Example**:
```typescript
// From RegisterScreen
navigation.navigate('OTP', {
  phone: '+1234567890',
  mode: 'register',
  email: 'user@example.com',
  password: 'securepass',
  name: 'John Doe'
});

// From LoginScreen
navigation.navigate('OTP', {
  phone: '+1234567890',
  mode: 'login'
});
```

---

### AuthContext (`apps/mobile/context/AuthContext.tsx`)
**Purpose**: Global authentication state management

**State Structure**:
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
```

**Storage Keys**:
- `@auth_token`: JWT token string
- `@auth_user`: JSON stringified user object

**Methods**:
```typescript
// Login (called after successful auth)
await login(token, userData);

// Logout (clears AsyncStorage and state)
await logout();

// Update user profile
await updateUser({ name: 'New Name', ... });

// Access auth state
const { user, token, isLoading } = useAuth();
```

**Initialization Flow**:
1. App starts → AuthProvider loads
2. Checks AsyncStorage for `@auth_token` and `@auth_user`
3. If found → Restores auth state
4. Sets `isLoading` to false
5. App renders with authenticated state

---

## 🔧 Backend API (NestJS)

### Database Schema

**User Entity** (`apps/api/src/entities/user.entity.ts`):
```typescript
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // bcrypt hashed

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
```

**Migration Required**:
```sql
-- Run this SQL to add phone column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
```

---

### API Endpoints

#### 1. **POST /api/auth/register**
**Purpose**: Initiate registration with phone OTP

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Process**:
1. Check if email/phone already exists → Throw ConflictException if duplicate
2. Generate 6-digit OTP
3. Store OTP in memory with 10-minute expiry
4. Log OTP to console (production: send via SMS service)
5. Return success message

**Error Cases**:
- `409 Conflict`: Email or phone already registered
- `400 Bad Request`: Missing required fields

---

#### 2. **POST /api/auth/verify-register**
**Purpose**: Complete registration after OTP verification

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepass123",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Process**:
1. Retrieve stored OTP for phone number
2. Validate OTP matches and not expired
3. Hash password with bcrypt (10 rounds)
4. Create user record in database
5. Clear OTP from store
6. Generate JWT token (30-day expiry)
7. Return token and user data

**Error Cases**:
- `401 Unauthorized`: Invalid or expired OTP
- `409 Conflict`: Race condition - user created during OTP wait

---

#### 3. **POST /api/auth/login**
**Purpose**: Email + password authentication

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Process**:
1. Find user by email
2. Compare password with bcrypt
3. Generate JWT token
4. Return token and user data

**Error Cases**:
- `401 Unauthorized`: Invalid email or password

---

#### 4. **POST /api/auth/send-otp**
**Purpose**: Send OTP to registered phone number for login

**Request Body**:
```json
{
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Process**:
1. Check if phone is registered and user is active
2. Generate 6-digit OTP
3. Store OTP with 10-minute expiry
4. Log OTP to console (production: send SMS)
5. Return success message

**Error Cases**:
- `401 Unauthorized`: Phone number not registered

---

#### 5. **POST /api/auth/verify-otp**
**Purpose**: Verify OTP and login via phone

**Request Body**:
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Process**:
1. Retrieve and validate OTP
2. Find user by phone number
3. Clear OTP from store
4. Generate JWT token
5. Return token and user data

**Error Cases**:
- `401 Unauthorized`: Invalid or expired OTP
- `401 Unauthorized`: User not found

---

### Authentication Service (`apps/api/src/auth/auth.service.ts`)

**OTP Storage Structure**:
```typescript
private otpStore = new Map<string, { code: string; expiresAt: Date }>();
```

**Key Methods**:

```typescript
// Generate 6-digit OTP
private generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT with user data
generateJwt(user: User): string {
  return jwt.sign(
    { 
      sub: user.id, 
      email: user.email, 
      phone: user.phone, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'changeme',
    { expiresIn: '30d' }
  );
}
```

**Production Considerations**:
- Replace in-memory Map with Redis for OTP storage
- Integrate SMS service (Twilio, AWS SNS, etc.) instead of console.log
- Use environment variable for JWT_SECRET
- Add rate limiting for OTP requests
- Add monitoring for failed auth attempts

---

## 🔄 Complete Authentication Flows

### Flow 1: Email + Password Registration

```
User Opens App
    ↓
LoginScreen → "Create Account" button
    ↓
RegisterScreen
    ↓ [Enter: name, email, phone, password]
    ↓ [Submit]
POST /api/auth/register
    ↓ [OTP generated and sent]
Navigate to OTPScreen (mode: 'register')
    ↓ [Enter 6-digit OTP]
    ↓ [Submit]
POST /api/auth/verify-register
    ↓ [User created, JWT returned]
AuthContext.login(token, user)
    ↓ [Store in AsyncStorage]
Navigate to Home (authenticated)
```

---

### Flow 2: Email + Password Login

```
User Opens App
    ↓
LoginScreen (mode: 'email')
    ↓ [Enter: email, password]
    ↓ [Submit]
POST /api/auth/login
    ↓ [JWT returned]
AuthContext.login(token, user)
    ↓ [Store in AsyncStorage]
Navigate to Home (authenticated)
```

---

### Flow 3: Phone + OTP Login

```
User Opens App
    ↓
LoginScreen → Toggle to "Phone" mode
    ↓ [Enter: phone number]
    ↓ [Submit]
POST /api/auth/send-otp
    ↓ [OTP sent]
Navigate to OTPScreen (mode: 'login')
    ↓ [Enter 6-digit OTP]
    ↓ [Submit]
POST /api/auth/verify-otp
    ↓ [JWT returned]
AuthContext.login(token, user)
    ↓ [Store in AsyncStorage]
Navigate to Home (authenticated)
```

---

### Flow 4: App Restart (Token Persistence)

```
User Reopens App
    ↓
AuthProvider initializes
    ↓ [Load from AsyncStorage]
Check @auth_token and @auth_user
    ↓ [If found]
Restore user and token to state
    ↓
User remains logged in
Navigate to Home (authenticated)
```

---

## 🎨 UI Design System

### Color Palette
```typescript
const colors = {
  primary: '#16A34A',      // Green-600
  primaryLight: '#22C55E', // Green-500
  background: '#F9FAFB',   // Gray-50
  card: '#FFFFFF',
  text: '#1F2937',         // Gray-800
  textLight: '#6B7280',    // Gray-500
  border: '#E5E7EB',       // Gray-200
  error: '#EF4444',        // Red-500
  success: '#10B981',      // Green-500
};
```

### Button Styles
- **Primary Button**: Gradient from green-500 to green-600, white text
- **Social Buttons**: White background, bordered, icon + text
- **Link Buttons**: Green text, no background

### Input Fields
- **Card-style**: White background, shadow, rounded-lg
- **Icon Support**: Left icon for email/phone/password
- **Error States**: Red border and text below input
- **Focus States**: Green border highlight

### Typography
```typescript
heading: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' }
subheading: { fontSize: 14, color: '#6B7280' }
inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151' }
buttonText: { fontSize: 16, fontWeight: '600' }
```

---

## 🧪 Testing Checklist

### Registration Flow
- [ ] Register with valid email + phone + password
- [ ] Verify email format validation
- [ ] Verify phone length validation
- [ ] Verify password match validation
- [ ] Verify duplicate email rejection
- [ ] Verify duplicate phone rejection
- [ ] Verify OTP sent (check console logs)
- [ ] Verify OTP validation (correct code)
- [ ] Verify OTP expiry (after 10 minutes)
- [ ] Verify successful user creation
- [ ] Verify JWT token generation
- [ ] Verify AsyncStorage persistence

### Email Login Flow
- [ ] Login with valid credentials
- [ ] Verify invalid email rejection
- [ ] Verify invalid password rejection
- [ ] Verify JWT token received
- [ ] Verify user data returned
- [ ] Verify AsyncStorage persistence

### Phone Login Flow
- [ ] Send OTP to registered phone
- [ ] Verify unregistered phone rejection
- [ ] Verify OTP received (console logs)
- [ ] Verify correct OTP acceptance
- [ ] Verify incorrect OTP rejection
- [ ] Verify expired OTP rejection
- [ ] Verify resend OTP functionality
- [ ] Verify 60-second timer works
- [ ] Verify JWT token received

### Token Persistence
- [ ] Login and close app
- [ ] Reopen app
- [ ] Verify user remains logged in
- [ ] Verify user data loaded from AsyncStorage
- [ ] Logout and reopen app
- [ ] Verify user logged out

### UI/UX
- [ ] Password visibility toggle works
- [ ] Haptic feedback on button press
- [ ] Loading indicators show during API calls
- [ ] Error messages display properly
- [ ] Navigation between screens works
- [ ] Back button behavior correct
- [ ] OTP input auto-focus works
- [ ] OTP backspace handling works

---

## 🚀 Setup Instructions

### Backend Setup

1. **Add phone column to database**:
```bash
# Connect to your PostgreSQL database
psql -U postgres -d your_database

# Run migration
\i apps/api/migrations/add_phone_to_users.sql
```

2. **Set JWT secret** (`.env` file):
```bash
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

3. **Install dependencies** (if not already):
```bash
cd apps/api
pnpm install @nestjs/jwt bcryptjs jsonwebtoken
pnpm install -D @types/bcryptjs @types/jsonwebtoken
```

4. **Start API server**:
```bash
cd apps/api
pnpm dev
```

### Mobile Setup

1. **Install dependencies** (already done):
```bash
cd apps/mobile
pnpm install @react-native-async-storage/async-storage
```

2. **Update API URL** in mobile config if needed:
```typescript
// apps/mobile/lib/api.ts
const API_URL = 'http://your-api-url:3000/api';
```

3. **Start mobile app**:
```bash
cd apps/mobile
pnpm start
```

---

## 📋 API URL Configuration

**Current Setup** (`apps/mobile/lib/api.ts`):
```typescript
const API_URL = 'http://localhost:3000/api';
```

**For Testing on Physical Device**:
```typescript
// Find your computer's local IP
// Windows: ipconfig
// Mac/Linux: ifconfig

const API_URL = 'http://192.168.1.XXX:3000/api';
```

**For Production**:
```typescript
const API_URL = process.env.API_URL || 'https://api.yourdomain.com';
```

---

## 🔐 Security Considerations

### Current Implementation
✅ Password hashing with bcrypt (10 rounds)  
✅ JWT tokens with 30-day expiry  
✅ Unique email and phone constraints  
✅ OTP expiry (10 minutes)  
✅ Secure token storage in AsyncStorage  

### Recommended Additions
- [ ] Rate limiting on OTP requests (prevent spam)
- [ ] Account lockout after failed attempts
- [ ] Email verification for email-based registration
- [ ] Two-factor authentication (2FA) option
- [ ] Refresh token mechanism
- [ ] Session management (logout from all devices)
- [ ] SSL/TLS for all API requests
- [ ] Password strength requirements
- [ ] Biometric authentication (Face ID, Touch ID)

---

## 🔮 Future Enhancements (Coming Soon)

### Social Authentication

#### Google Sign-In
**Implementation Plan**:
1. Install `@react-native-google-signin/google-signin`
2. Configure Google Console OAuth credentials
3. Create intermediate screen for phone collection
4. Link Google account to user profile
5. Generate JWT after linking

**Flow**:
```
User taps "Continue with Google"
    ↓
Google OAuth popup
    ↓ [User authorizes]
Receive Google profile data
    ↓
Check if email exists in database
    ↓ [If new user]
Show IntermediateScreen (collect phone + password)
    ↓
POST /api/auth/register-social
    ↓
Link Google account to user
    ↓
Generate JWT, login user
```

#### Apple Sign-In
**Implementation Plan**:
1. Install `expo-apple-authentication`
2. Configure Apple Developer account
3. Handle Apple auth response
4. Same intermediate screen flow as Google
5. Support iOS 13+ requirement

---

### Additional Features
- **Forgot Password**: Email-based password reset
- **Change Password**: In-app password update
- **Phone Verification**: Verify phone after Google/Apple signup
- **Profile Management**: Update name, email, phone
- **Account Deletion**: GDPR compliance
- **Login History**: Show recent login attempts
- **Trusted Devices**: Remember devices
- **Push Notifications**: OTP via push instead of SMS

---

## 📞 Support

### OTP Not Received?
- Check console logs in API terminal: `[Auth] OTP for +123456789: 123456`
- In production, integrate SMS service (Twilio, AWS SNS)
- Verify phone number format (+country code)

### Token Expired?
- JWT tokens expire after 30 days
- User will need to login again
- Consider implementing refresh tokens

### AsyncStorage Issues?
- Clear storage: `AsyncStorage.clear()` in code
- Reinstall app to reset storage
- Check iOS/Android storage permissions

---

## 📄 File Reference

### Mobile App Files
- `apps/mobile/context/AuthContext.tsx` - Auth state management
- `apps/mobile/screens/LoginScreen.tsx` - Login interface
- `apps/mobile/screens/RegisterScreen.tsx` - Registration form
- `apps/mobile/screens/OTPScreen.tsx` - OTP verification
- `apps/mobile/App.tsx` - Main app with navigation
- `apps/mobile/lib/api.ts` - API client configuration

### Backend Files
- `apps/api/src/auth/auth.service.ts` - Auth business logic
- `apps/api/src/auth/auth.controller.ts` - API endpoints
- `apps/api/src/auth/auth.module.ts` - NestJS module
- `apps/api/src/entities/user.entity.ts` - User database schema
- `apps/api/migrations/add_phone_to_users.sql` - Database migration

---

## ✅ Completion Status

### Completed ✅
- Multi-method authentication screens (Email, Phone)
- OTP generation and verification system
- JWT token management
- AsyncStorage persistence
- User registration with validation
- Email + password login
- Phone + OTP login
- Password security (bcrypt)
- Responsive UI with haptic feedback
- Database schema with phone field
- Complete API endpoints

### Pending ⏳
- Google Sign-In integration
- Apple Sign-In integration
- SMS service integration (production)
- Intermediate screen for social auth
- Forgot password flow
- Email verification
- Rate limiting
- Refresh tokens

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Backend Complete, Mobile UI Complete, Social Auth Pending
