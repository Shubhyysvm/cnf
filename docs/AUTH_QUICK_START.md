# Quick Start: Testing Authentication System

## 🚀 Start the Backend & Mobile App

### Step 1: Run Database Migration
```bash
# Connect to PostgreSQL
psql -U postgres -d country_natural_foods

# Run the migration
\i c:/xampp/htdocs/CountryNaturalFoods/apps/api/migrations/add_phone_to_users.sql

# Verify phone column added
\d users
```

**Expected Output**:
```
Column | Type | Modifiers
-------+------+-----------
id     | uuid | not null
email  | varchar(100) | not null unique
phone  | varchar(20) | unique
password | varchar(255) | not null
name   | varchar(100) | not null
...
```

---

### Step 2: Start API Server
```bash
cd c:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm dev
```

**Expected Output**:
```
[Nest] Application is running on: http://localhost:3000
```

**Verify API is running**:
Open browser: `http://localhost:3000/api/products`

---

### Step 3: Start Mobile App
```bash
cd c:\xampp\htdocs\CountryNaturalFoods\apps\mobile
pnpm start
```

**Options**:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code for physical device

---

## 📱 Test Authentication Flows

### Test 1: Register New Account with Phone OTP

**Step-by-step**:
1. Open mobile app → Tap "Create Account"
2. Fill in registration form:
   - Full Name: `John Doe`
   - Email: `john@test.com`
   - Phone: `+1234567890`
   - Password: `test123`
   - Confirm Password: `test123`
3. Tap "Create Account" button
4. **Check API terminal** for OTP:
   ```
   [Auth] OTP for +1234567890: 123456
   ```
5. Navigate to OTP screen
6. Enter the 6-digit OTP from terminal
7. Tap "Verify" button
8. ✅ Should navigate to Home screen (logged in)

**Verify Success**:
- App shows Home screen
- User is authenticated
- Token stored in AsyncStorage

---

### Test 2: Login with Email + Password

**Step-by-step**:
1. If logged in, logout first
2. On Login screen, ensure "Email" mode selected
3. Enter credentials:
   - Email: `john@test.com`
   - Password: `test123`
4. Tap "Sign In" button
5. ✅ Should navigate to Home screen

**Verify Success**:
- No OTP required for email login
- Instant authentication
- Token stored

---

### Test 3: Login with Phone + OTP

**Step-by-step**:
1. If logged in, logout first
2. On Login screen, tap "Phone" tab
3. Enter phone: `+1234567890`
4. Tap "Sign In" button
5. **Check API terminal** for OTP:
   ```
   [Auth] OTP for +1234567890: 654321
   ```
6. Enter 6-digit OTP
7. Tap "Verify" button
8. ✅ Should navigate to Home screen

**Verify Success**:
- OTP sent successfully
- Verification works
- User logged in

---

### Test 4: Token Persistence (App Restart)

**Step-by-step**:
1. Login using any method (email or phone)
2. Verify you're on Home screen
3. **Close the app completely** (swipe up on iOS, back button on Android)
4. **Reopen the app**
5. ✅ Should remain logged in (no login screen shown)

**Verify Success**:
- User data loaded from AsyncStorage
- Token persists across app restarts
- No need to login again

---

### Test 5: Logout

**Step-by-step**:
1. While logged in, navigate to Profile/Settings
2. Tap "Logout" button (if implemented)
3. Or manually call: `useAuth().logout()`
4. ✅ Should navigate back to Login screen

**Verify Success**:
- AsyncStorage cleared
- User data removed
- Redirected to login

---

## 🧪 API Testing with cURL

### Test Registration
```bash
# Step 1: Register (sends OTP)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+9876543210",
    "password": "password123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Check Terminal**: Look for `[Auth] OTP for +9876543210: XXXXXX`

---

```bash
# Step 2: Verify Registration (complete signup)
curl -X POST http://localhost:3000/api/auth/verify-register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+9876543210",
    "password": "password123",
    "otp": "XXXXXX"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+9876543210"
  }
}
```

---

### Test Email Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### Test Phone Login (OTP)
```bash
# Step 1: Request OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+9876543210"}'
```

**Check Terminal** for OTP code.

```bash
# Step 2: Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9876543210",
    "otp": "XXXXXX"
  }'
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: OTP Not Showing in Terminal
**Cause**: API server not running or OTP store not logging  
**Solution**: 
- Check API terminal is running
- Look for `[Auth] OTP for...` messages
- Ensure `console.log` is in `sendOTP` and `register` methods

---

### Issue 2: "Phone number not registered" Error
**Cause**: Trying to login with phone that hasn't completed registration  
**Solution**:
- Complete registration flow first (register → verify-register)
- Verify user exists in database: `SELECT * FROM users WHERE phone = '+...'`

---

### Issue 3: "Invalid or expired OTP"
**Cause**: OTP expired (10-minute window) or incorrect code  
**Solution**:
- Request new OTP (tap "Resend Code")
- Copy exact OTP from terminal (case-sensitive)
- Check system time is correct

---

### Issue 4: "Email already registered"
**Cause**: Duplicate email during registration  
**Solution**:
- Use different email
- Or delete existing user: `DELETE FROM users WHERE email = '...'`

---

### Issue 5: AsyncStorage Not Persisting
**Cause**: AsyncStorage not properly initialized  
**Solution**:
```bash
cd apps/mobile
pnpm install @react-native-async-storage/async-storage
# For iOS
cd ios && pod install
```

---

### Issue 6: Navigation Not Working
**Cause**: Screen not registered in navigator  
**Solution**: Check `apps/mobile/App.tsx` includes:
```typescript
<Stack.Screen name="Login" component={LoginScreen} />
<Stack.Screen name="Register" component={RegisterScreen} />
<Stack.Screen name="OTP" component={OTPScreen} />
```

---

## 📊 Database Verification

### Check User Created Successfully
```sql
SELECT id, name, email, phone, role, "isActive" 
FROM users 
WHERE email = 'test@example.com';
```

### Verify Phone Column Exists
```sql
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'phone';
```

**Expected Result**:
```
column_name | data_type | length | nullable
------------+-----------+--------+---------
phone       | varchar   | 20     | YES
```

---

## 🔍 Debug Checklist

Before reporting issues, verify:

- [ ] PostgreSQL is running
- [ ] Database migration executed (phone column exists)
- [ ] API server running on port 3000
- [ ] Mobile app connected to correct API URL
- [ ] No TypeScript errors in terminal
- [ ] AsyncStorage package installed
- [ ] Navigation screens registered
- [ ] AuthProvider wraps app in App.tsx

---

## 🎯 Success Criteria

Your authentication system is working correctly when:

✅ **Registration Flow**:
- New user can register with email + phone + password
- OTP is generated and logged to terminal
- OTP verification creates user in database
- JWT token returned and stored
- User automatically logged in after registration

✅ **Email Login Flow**:
- Existing user can login with email + password
- JWT token returned
- User data loaded
- Redirected to Home screen

✅ **Phone Login Flow**:
- OTP sent to registered phone
- OTP verification authenticates user
- JWT token returned
- User logged in

✅ **Token Persistence**:
- Closing and reopening app keeps user logged in
- Token and user data loaded from AsyncStorage
- Logout clears all stored data

✅ **Security**:
- Passwords hashed with bcrypt
- Duplicate emails/phones rejected
- Invalid credentials rejected
- Expired OTPs rejected
- JWT tokens have 30-day expiry

---

## 📝 Next Steps After Testing

Once basic flows work:

1. **Integrate SMS Service** (Twilio, AWS SNS):
   - Replace `console.log(OTP)` with actual SMS sending
   - Add SMS provider credentials to `.env`
   - Test OTP delivery on real phones

2. **Add Social Authentication**:
   - Install Google Sign-In package
   - Install Apple Authentication package
   - Create intermediate screen for collecting phone
   - Link social accounts to user profiles

3. **Enhance Security**:
   - Add rate limiting on OTP endpoints
   - Implement refresh tokens
   - Add account lockout after failed attempts
   - Enable email verification

4. **Production Readiness**:
   - Move OTP storage to Redis
   - Use strong JWT_SECRET from environment
   - Enable HTTPS/SSL
   - Add monitoring and logging
   - Implement password reset flow

---

**Happy Testing! 🎉**

For detailed documentation, see: [AUTHENTICATION_SYSTEM_COMPLETE.md](./AUTHENTICATION_SYSTEM_COMPLETE.md)
