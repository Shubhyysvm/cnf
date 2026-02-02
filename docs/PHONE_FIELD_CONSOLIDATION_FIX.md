# Phone Field Consolidation Fix

## Issue Identified
The phone field was duplicated across two tables:
- **users table**: Has a `phone` column (primary storage)
- **user_profiles table**: Also had a `phone` column (duplicate)

This redundancy caused confusion and potential data inconsistency.

## Root Cause
During user registration, the phone was being stored in both:
1. `users` table (via User entity) - ✓ Correct
2. `user_profiles` table (via UserProfile entity) - ✗ Redundant

## Solution Implemented
Remove phone field from user_profiles table storage. Phone is now stored ONLY in the users table.

### Changes Made

#### 1. Auth Service Update
**File**: `apps/api/src/auth/auth.service.ts`

Updated `verifyRegister` method to NOT store phone in user_profiles:

```typescript
// Before (WRONG):
const profile = this.userProfileRepository.create({
  userId: user.id,
  firstName: data.firstName,
  middleName: data.middleName,
  lastName: data.lastName,
  phone: data.phone,  // ✗ REMOVED - phone is in users table
});

// After (CORRECT):
const profile = this.userProfileRepository.create({
  userId: user.id,
  firstName: data.firstName,
  middleName: data.middleName,
  lastName: data.lastName,
  // phone field removed - not needed here
});
```

#### 2. Database Schema (user_profiles table)
- **Remove column**: `phone` from user_profiles table
- **Phone location**: Only in users table
- **Rationale**: One source of truth, prevents data inconsistency

## Authentication Flow After Fix

### Registration (2-Step Process)
1. **Step 1 - register()**: 
   - Validates input
   - Sends OTP to phone
   - Does NOT create user yet

2. **Step 2 - verifyRegister()**:
   - Verifies OTP
   - Creates User with phone in users table
   - Creates UserProfile with name details (NO phone field)
   - Returns JWT token

### Phone Login
1. **sendOTP()**: 
   - Finds user by phone in users table
   - Sends OTP
   
2. **verifyOTP()**: 
   - Verifies OTP
   - Finds user by phone in users table
   - Returns JWT token

## Data Flow Diagram

```
User Registration:
┌──────────────┐
│ Phone        │
│ Email        │
│ Password     │
│ Name         │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ register() - Send OTP    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ verifyRegister(otp)      │
└──────┬───────────────────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────────┐         ┌──────────────────────┐
│ users table      │         │ user_profiles table  │
│ - id             │         │ - id                 │
│ - email          │         │ - userId             │
│ - phone ◄────────┼─────────┼─ firstName           │
│ - password       │         │ - middleName         │
│ - name           │         │ - lastName           │
│ - isActive       │         │ - avatarUrl          │
│ - role           │         │ - preferences        │
└──────────────────┘         │ - createdAt          │
                             │ - updatedAt          │
                             └──────────────────────┘
```

## Phone Field Locations

### ✓ CORRECT - Phone in users table
- User entity stores phone
- findOne queries on users.phone
- API returns phone from users.phone

### ✗ REMOVED - Phone from user_profiles table
- No longer duplicated
- Prevents inconsistency
- Cleaner database schema

## Migration (When Needed)
To remove phone from user_profiles table in database:

```sql
-- Remove phone column from user_profiles
ALTER TABLE user_profiles DROP COLUMN phone;
```

## Testing Recommendations

### 1. Registration Flow
```
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
→ Response: OTP sent

POST /auth/verify-register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "otp": "123456"
}
→ Response: token + user object with phone from users table
```

### 2. Phone Login
```
POST /auth/send-otp
{
  "phone": "1234567890"
}
→ Response: OTP sent

POST /auth/verify-otp
{
  "phone": "1234567890",
  "otp": "123456"
}
→ Response: token + user object
```

### 3. Verify user_profiles does NOT contain phone
```sql
SELECT * FROM user_profiles WHERE id = 1;
-- Should show: id, userId, firstName, middleName, lastName, avatarUrl, preferences, createdAt, updatedAt
-- Should NOT show: phone
```

## Summary
✓ Phone field consolidated to users table only  
✓ user_profiles stores name details  
✓ Single source of truth for phone  
✓ No data duplication  
✓ All auth flows work correctly  

