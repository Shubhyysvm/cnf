# Email System Architecture & Design

**Date:** January 19, 2026  
**Component:** Order Notification System  
**Status:** ✅ Complete

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │  Mobile App      │          │  Web App / API   │            │
│  │  (Expo/React)    │          │  (NextJS)        │            │
│  └────────┬─────────┘          └────────┬─────────┘            │
│           │ Order Placement              │                       │
└───────────┼──────────────────────────────┼───────────────────────┘
            │                              │
            └──────────────────┬───────────┘
                               │
                    ┌──────────▼──────────┐
                    │  API Server (NestJS)│
                    │    Port: 3001       │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐
    │ Orders Service │ │EmailService │  │CartService etc │
    │ - createOrder()│ │ - Generate  │  │                │
    │ - checkout()   │ │   templates │  └────────────────┘
    │                │ │ - Send SMTP │
    │ (Async Email   │ │ - Logging   │
    │  Triggering)   │ └──────┬──────┘
    └────────────────┘        │
            │                  │
            │    ┌─────────────┤
            │    │             │
    ┌───────▼────▼────────┐  ┌─▼───────────────┐
    │  PostgreSQL DB      │  │  Nodemailer     │
    │  ┌────────────────┐ │  │  SMTP Client    │
    │  │ orders         │ │  │                 │
    │  │ order_items    │ │  │ ┌────────────┐ │
    │  │ carts          │ │  │ │ Ethereal   │ │
    │  │ └──────────────┘│ │  │ │ (Dev)      │ │
    │  │ master_admin_  │ │  │ │ OR         │ │
    │  │ preferences    │ │  │ │ Custom     │ │
    │  │ ├─ admin_email │ │  │ │ SMTP (Prod)│ │
    │  │ └─ email_from  │ │  │ └────────────┘ │
    │  └────────────────┘ │  └────────────────┘
    └────────────────────┘        │
                                  │
                    ┌─────────────▼─────────────┐
                    │  SMTP Server              │
                    │  localhost:1025 (Mailhog) │
                    │  OR                       │
                    │  smtp.gmail.com:587       │
                    │  (Production)             │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │  Email Recipients         │
                    │                           │
                    │  ┌──────────────────┐    │
                    │  │ Admin Email      │    │
                    │  │ hemanthreddy.y143│    │
                    │  │ @gmail.com       │    │
                    │  └──────────────────┘    │
                    │                           │
                    │  ┌──────────────────┐    │
                    │  │ Customer Email   │    │
                    │  │ (from order)     │    │
                    │  └──────────────────┘    │
                    └───────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
Order Placement Request
        │
        ▼
┌─────────────────────────┐
│ POST /orders/checkout   │
│ with email, address,    │
│ items, etc              │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ OrdersController        │
│ .checkout()             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ OrdersService           │
│ .checkoutFromCart()     │
└────────┬────────────────┘
         │
         ├─→ Get cart
         ├─→ Calculate totals
         ├─→ Generate order#
         ├─→ Save Order to DB
         ├─→ Create OrderItems
         ├─→ Reduce Stock
         └─→ Get Final Order
         │
         ▼
┌─────────────────────────┐
│ sendOrderEmails()       │ ← ASYNC (Non-blocking)
│ [Background Task]       │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
Admin Email  Customer Email
    │          │
    ├─→ ├─→ Fetch admin_email
    │  │    from DB
    │  │
    ├─→ ├─→ Generate HTML
    │  │    template
    │  │
    ├─→ ├─→ Add [TEST]
    │  │    prefix?
    │  │
    ├─→ ├─→ Send via SMTP
    │  │
    └─→ └─→ Log status
         (error handling)
    │
    └─→ Mailhog/SMTP Server
         │
         ├─→ hemanthreddy.y143@gmail.com
         │
         └─→ customer@example.com
    │
    (Background completes)
    │
    ▼
Return Order Response
(Email may still be sending,
 but response is immediate)
```

---

## 🔄 Process Sequence Diagram

```
Client          API Server      EmailService    Database     SMTP
  │                 │                 │            │          │
  │─ Place Order ──→│                 │            │          │
  │                 │                 │            │          │
  │                 │─ Save Order ───→│            │          │
  │                 │                 │← Save ────→│          │
  │                 │                 │            │          │
  │                 │─ Create Items ─→│            │          │
  │                 │                 │← Save ────→│          │
  │                 │                 │            │          │
  │                 │─ Get Order ────→│            │          │
  │                 │                 │← Query ───→│          │
  │                 │                 │            │          │
  │                 │─ Send Emails ──→│            │          │
  │                 │    (async)      │            │          │
  │                 │                 │            │          │
  │                 │                 │─ Fetch admin_email    │
  │                 │                 │← Value ───→│          │
  │                 │                 │            │          │
  │                 │                 │─ Generate HTML        │
  │                 │                 │   template             │
  │                 │                 │            │          │
  │                 │                 │────────────────────  │
  │                 │                 │  Send Email 1 ───────→│
  │                 │                 │────────────────────  │
  │                 │                 │  Send Email 2 ───────→│
  │                 │                 │            │          │
  │← Return Order ─│                 │            │          │
  │  (Immediate)   │                 │            │          │
  │                 │                 │            │          │
  │                 │ (Email sending continues)   │          │
```

---

## 📦 Component Breakdown

### 1. Database Layer
```
master_admin_preferences
├─ id: UUID
├─ key: String (UNIQUE) [email_config]
├─ value: Text [email_value]
├─ description: String
├─ createdAt: Timestamp
└─ updatedAt: Timestamp

Examples:
├─ key='admin_email', value='hemanthreddy.y143@gmail.com'
└─ key='email_from', value='noreply@countrynaturalfoods.com'
```

### 2. Email Service Layer
```
EmailService
├─ Constructor
│  ├─ Inject MasterAdminPreferenceRepository
│  └─ Initialize Nodemailer
│
├─ Methods (Public)
│  ├─ sendAdminOrderNotification(orderData)
│  └─ sendCustomerOrderConfirmation(orderData, customerEmail)
│
├─ Methods (Private)
│  ├─ generateAdminOrderEmailHTML()
│  └─ generateCustomerOrderEmailHTML()
│
├─ Utilities
│  ├─ getAdminEmail() → from DB
│  ├─ getFromEmail() → from DB
│  └─ getEmailPrefix() → '[TEST]' or ''
│
└─ Error Handling
   ├─ Try-catch blocks
   ├─ Logging
   └─ Non-throwing (async)
```

### 3. Orders Service Integration
```
OrdersService
├─ Constructor
│  ├─ Inject EmailService
│  └─ Other dependencies
│
├─ createOrder()
│  ├─ Create order
│  ├─ Create items
│  ├─ Reduce stock
│  ├─ Get final order
│  ├─ Call sendOrderEmails() [ASYNC]
│  └─ Return order
│
└─ sendOrderEmails() [Private]
   ├─ Try block
   │  ├─ Prepare order data
   │  ├─ emailService.sendAdminOrderNotification()
   │  └─ emailService.sendCustomerOrderConfirmation()
   │
   └─ Catch block (log error, don't throw)
```

---

## 🔌 SMTP Configuration Options

### Development
```
Provider: Ethereal (Test)
Host: Auto-generated
Port: 587
Secure: false
Username: Auto-generated
Password: Auto-generated
Preview: console logs URL
Mailhog UI: localhost:8025
```

### Production Options
```
Option 1: Gmail
├─ Host: smtp.gmail.com
├─ Port: 587
├─ Secure: false
└─ Auth: app_password@gmail.com

Option 2: SendGrid
├─ Host: smtp.sendgrid.net
├─ Port: 587
├─ Secure: false
└─ Auth: apikey

Option 3: AWS SES
├─ Host: email-smtp.region.amazonaws.com
├─ Port: 587
├─ Secure: false
└─ Auth: Access Key ID / Secret

Option 4: Custom SMTP
├─ Host: your-smtp.example.com
├─ Port: 587 or 465
├─ Secure: true/false
└─ Auth: your credentials
```

---

## 🎯 Email Template Structure

### Admin Email Template
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Inline CSS for dark, professional look */
  </style>
</head>
<body>
  [TEST WARNING BANNER - if dev/test]
  
  <div class="header">
    <h2>New Order Received</h2>
  </div>
  
  <section class="order-details">
    Order Number: CNF-XXXXXX
    Date: YYYY-MM-DD
    Status: pending
  </section>
  
  <section class="customer-info">
    Name, Email, Phone
  </section>
  
  <section class="address">
    Full Shipping Address
  </section>
  
  <section class="items">
    <table>
      <thead>Product | Qty | Price | Total</thead>
      <tbody>
        [Items rows]
      </tbody>
      <tfoot>
        Subtotal | Shipping | Tax | TOTAL
      </tfoot>
    </table>
  </section>
  
  <section class="payment">
    Payment Method, Status
  </section>
  
  <footer>
    Brand info, disclaimers
  </footer>
</body>
</html>
```

### Customer Email Template
```html
[Similar structure with customer-friendly messaging]

Key differences:
- Confirmation message
- "What's next?" section
- Support contact info
- Call-to-action
- Warmer tone
```

---

## ⚡ Performance Considerations

```
Request Timeline:

0ms    → Order request arrives
100ms  → Order saved, items created, stock reduced
150ms  → Final order retrieved
160ms  → sendOrderEmails() triggered (non-blocking)
170ms  → Response sent to client
       [Background:]
200ms  → Fetch admin email from DB
210ms  → Generate HTML templates
220ms  → Connect to SMTP server
250ms  → Send admin email
260ms  → Send customer email
270ms  → Email service completes

Result: User sees response in 170ms
Email delivery: Doesn't affect user experience
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────┐
│           Security Layers                        │
└─────────────────────────────────────────────────┘

1. Configuration Security
   ├─ SMTP credentials in .env (not code)
   ├─ Admin email in database (not code)
   └─ Environment detection (dev vs prod)

2. Data Security
   ├─ HTML escaping in templates
   ├─ Only intended recipients receive emails
   ├─ No sensitive data in logs
   └─ Error handling prevents data leaks

3. Operational Security
   ├─ Email failures don't break orders
   ├─ Async non-blocking execution
   ├─ Graceful error handling
   └─ Comprehensive logging

4. Access Control
   ├─ Admin emails only to authorized admin
   ├─ Customer emails only to order customer
   ├─ Database access via ORM
   └─ API authentication (JWT)

5. Environment Separation
   ├─ Test prefix in dev/test
   ├─ Production emails in prod
   ├─ Clear indication of environment
   └─ No production emails from test env
```

---

## 📈 Scalability Path

### Current (Single Admin)
```
One admin email
Synchronous email sending (async but single)
In-memory template generation
Suitable for: ~1000 orders/day
```

### Phase 2 (Multiple Admins)
```
Multiple admin emails from database
Loop and send to all
Template versioning
Suitable for: ~5000 orders/day
```

### Phase 3 (Queue-Based)
```
Redis/RabbitMQ message queue
Worker processes pick up jobs
Retries and dead-letter handling
Batching and rate limiting
Suitable for: ~50000 orders/day
```

### Phase 4 (Advanced)
```
Email service provider (SendGrid, Mailgun)
Template versioning system
A/B testing framework
Analytics integration
Scheduled sending
Suitable for: Unlimited
```

---

## 🧪 Testing Architecture

```
Unit Tests
├─ EmailService.sendAdminOrderNotification()
├─ EmailService.sendCustomerOrderConfirmation()
├─ generateAdminOrderEmailHTML()
└─ generateCustomerOrderEmailHTML()

Integration Tests
├─ Order creation with email sending
├─ Database preference fetching
└─ SMTP communication

E2E Tests
├─ Full order flow
├─ Email delivery verification
├─ Mailhog integration
└─ Error scenarios
```

---

## 📋 Deployment Checklist

```
Development
├─ ✅ Ethereal test account
├─ ✅ Mailhog running
├─ ✅ Database seeded
└─ ✅ [TEST] prefix showing

Staging
├─ ⏳ Production SMTP credentials
├─ ⏳ Real admin email updated
├─ ⏳ Templates reviewed
└─ ⏳ Delivery rates checked

Production
├─ ⏳ Final SMTP credentials
├─ ⏳ Admin email verified
├─ ⏳ Customer emails tested
├─ ⏳ Error handling verified
└─ ⏳ Monitoring active
```

---

**Architecture Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** ✅ Complete and Ready
