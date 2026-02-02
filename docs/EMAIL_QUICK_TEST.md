# Email Implementation - Quick Test Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Docker installed and running
- All services working

### Step 1: Install & Migrate (Terminal 1)
```bash
cd c:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm install
pnpm migration:run
pnpm seed
```

### Step 2: Start Services (3 separate terminals)

**Terminal 1 - Docker:**
```bash
cd c:\xampp\htdocs\CountryNaturalFoods
docker compose up -d
```

**Terminal 2 - API:**
```bash
cd c:\xampp\htdocs\CountryNaturalFoods\apps\api
pnpm start:dev
```

**Terminal 3 - View Emails:**
```bash
# Open in browser
http://localhost:8025
```

### Step 3: Verify Setup

**Check database:**
```bash
# Connect to PostgreSQL
psql -U countrynaturalfoods -d countrynaturalfoods -h localhost

# Run query
SELECT * FROM master_admin_preferences;
```

**Expected output:**
```
 id | key | value | description | created_at | updated_at
----|-----|-------|-------------|------------|----------
 1  | admin_email | hemanthreddy.y143@gmail.com | ... | ... | ...
 2  | email_from | noreply@countrynaturalfoods.com | ... | ... | ...
```

---

## 📧 Test Email Sending

### Option 1: Via Mobile App

1. Open mobile app (Expo)
2. Go to Home → Browse Products
3. Add product to cart
4. Go to Cart
5. Click "Buy Now" or "Checkout"
6. Fill in details:
   - Name: John Doe
   - Email: **customer@example.com** ← key!
   - Phone: 9876543210
   - Address: 123 Main Street
   - City: Bangalore
   - State: Karnataka
   - Zip: 560001
7. Continue to payment
8. Complete payment (test mode auto-captures)
9. See "Order Success" screen

### Option 2: Via API (cURL)

```bash
curl -X POST http://localhost:3001/orders/checkout \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-123" \
  -d '{
    "shippingAddress": {
      "recipientName": "John Doe",
      "line1": "123 Main Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "zip": "560001",
      "country": "India"
    },
    "email": "customer@example.com",
    "phone": "9876543210",
    "paymentMethod": "card"
  }'
```

---

## ✅ Check Emails

### Open Mailhog (http://localhost:8025)

**You should see 2 emails:**

#### Email 1 - Admin Notification
- **From:** noreply@countrynaturalfoods.com
- **To:** hemanthreddy.y143@gmail.com
- **Subject:** `[TEST] New Order Received: CNF-TEST-20260119-XXXXX`
- **Content:** 
  - Order details
  - Customer info
  - Shipping address
  - Itemized products
  - Total: ₹XXXX
  - ⚠️ TEST EMAIL banner at top

#### Email 2 - Customer Confirmation
- **From:** noreply@countrynaturalfoods.com
- **To:** customer@example.com
- **Subject:** `[TEST] Order Confirmation: CNF-TEST-20260119-XXXXX`
- **Content:**
  - Order confirmation message
  - All order details
  - What's next (shipping, delivery, etc.)
  - ⚠️ TEST EMAIL banner at top

---

## 🔍 Verify Email Details

In Mailhog, click each email and verify:

### Admin Email Verification
- [ ] Order number matches (CNF-TEST-...)
- [ ] Customer name: John Doe
- [ ] Customer email: customer@example.com
- [ ] Customer phone: 9876543210
- [ ] Shipping address is complete
- [ ] All products listed with quantities
- [ ] Prices are correct
- [ ] Subtotal + Tax + Shipping = Total
- [ ] [TEST] prefix in subject
- [ ] Warning banner in body

### Customer Email Verification
- [ ] Same order number
- [ ] Confirmation message
- [ ] Shipping address
- [ ] Order items and prices match
- [ ] Next steps mentioned
- [ ] [TEST] prefix in subject
- [ ] Warning banner in body

---

## 🐛 Troubleshooting

### No emails in Mailhog?

**Check API logs:**
```bash
# Look for errors in Terminal 2 (API logs)
# Should see: "Admin order notification sent to..."
# Should see: "Customer order confirmation sent to..."
```

**If not present:**
1. Restart API: `pnpm start:dev`
2. Check Mailhog: `docker compose logs mailhog`
3. Verify SMTP connection: Check if `localhost:1025` is accessible

### Emails missing [TEST] prefix?

**Check .env variables:**
```bash
# In .env file, verify:
NODE_ENV=development
PAYMENT_MODE=test
```

**Restart API if changed:**
```bash
# Kill: Ctrl+C in Terminal 2
# Restart: pnpm start:dev
```

### Wrong admin email in emails?

**Check database:**
```bash
SELECT * FROM master_admin_preferences WHERE key = 'admin_email';
```

**Update if needed:**
```bash
UPDATE master_admin_preferences 
SET value = 'newemail@example.com' 
WHERE key = 'admin_email';
```

**Then restart API**

### Database migration failed?

```bash
# Check existing migrations
pnpm migration:generate

# View migration status
# Look for: 1705600800000-CreateMasterAdminPreferences

# If missing, run again
pnpm migration:run
```

---

## 📊 What Should Happen

```
1. Place Order
   ↓
2. Order Created (CNF-TEST-...)
   ↓
3. Email Service Called (background)
   ├─ Fetch admin email from DB: hemanthreddy.y143@gmail.com
   ├─ Generate Admin HTML
   ├─ Send Admin Email (SMTP → Mailhog)
   │
   └─ Generate Customer HTML
      └─ Send Customer Email (SMTP → Mailhog)
   ↓
4. Order Response Sent to Client
   ↓
5. Emails Appear in Mailhog (http://localhost:8025)
```

---

## 🎯 Success Criteria

✅ **Database created:** `master_admin_preferences` table exists  
✅ **Preferences seeded:** 2 rows (admin_email, email_from)  
✅ **Emails sent:** 2 emails in Mailhog for each order  
✅ **Admin email:** hemanthreddy.y143@gmail.com  
✅ **Customer email:** customer@example.com (from order)  
✅ **Test prefix:** [TEST] in subject line  
✅ **Test banner:** Warning at top of email  
✅ **Order details:** All items, prices, totals correct  
✅ **HTML format:** Professional styling, readable tables  

---

## 🚀 Next: Production Setup

When ready for production:

1. **Update SMTP credentials** in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

2. **Set production mode:**
   ```
   NODE_ENV=production
   PAYMENT_MODE=production
   ```

3. **Update admin email** in database:
   ```sql
   UPDATE master_admin_preferences 
   SET value = 'admin@countrynaturalfoods.com' 
   WHERE key = 'admin_email';
   ```

4. **Test sending** real emails before going live

5. **Monitor deliverability** (bounces, opens, clicks)

---

## 📞 Contact

Issues? Check:
1. API logs in Terminal 2
2. Mailhog at http://localhost:8025
3. Docker logs: `docker compose logs`
4. Database connection: psql
5. Email configuration: .env file
