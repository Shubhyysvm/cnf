# Guest Session Persistence & Login Flow Explained

## The Answer: Yes, Guest Sessions Persist!

**Short Answer:** If a guest adds items to cart/wishlist and comes back the **next day on the same device**, their cart and wishlist items are **still there** ✓

---

## How This Works

### Day 1: Guest Adds Items

```
[10:00 AM]
┌─ Mobile app launches
├─ Generate sessionId: "session-abc-123-xyz"
├─ Save to AsyncStorage
└─ Ready for requests
  
[10:15 AM] Guest adds "Coconut Oil (500ml)" to cart
├─ POST /cart/items
│  Headers: x-session-id: "session-abc-123-xyz"
│  Body: { productId: "prod-123", variantId: "var-456", quantity: 1 }
│
└─ Backend:
   ├─ Check: Does cart exist with sessionId="session-abc-123-xyz"?
   ├─ NO → Create new cart
   │   INSERT INTO carts {
   │     id: "cart-uuid-1",
   │     sessionId: "session-abc-123-xyz",
   │     userId: NULL,  ← GUEST
   │     expiresAt: [NOW + 7 days],
   │     createdAt: NOW
   │   }
   │
   └─ Add item to cart
      INSERT INTO cart_items {
        id: "item-uuid-1",
        cartId: "cart-uuid-1",
        productId: "prod-123",
        variantId: "var-456",
        productName: "Coconut Oil",
        variantWeight: "500ml",
        quantity: 1,
        price: 299
      }

RESULT: Item in cart ✓
```

### Day 1: Later Sessions

```
[11:30 AM] Guest adds "Quinoa (1kg)" to cart
├─ POST /cart/items
│  Headers: x-session-id: "session-abc-123-xyz"
│
└─ Backend:
   ├─ Check: Does cart exist with sessionId="session-abc-123-xyz"?
   ├─ YES! → Load existing cart
   │   SELECT * FROM carts WHERE sessionId='session-abc-123-xyz'
   │   Returns: cart-uuid-1 (created this morning)
   │
   └─ Add item to same cart
      INSERT INTO cart_items {
        cartId: "cart-uuid-1",  ← SAME CART
        productId: "prod-789",
        variantId: "var-999",
        quantity: 1
      }

RESULT: Cart now has 2 items ✓
```

### Browser Closes (End of Day 1)

```
[11:59 PM] Guest closes app
├─ sessionId "session-abc-123-xyz" still in AsyncStorage
├─ Cart "cart-uuid-1" in database with expiresAt=[Jan 18 11:15 AM]
└─ Ready for next visit
```

### Day 2: Guest Returns (Same Device)

```
[02:00 PM Next Day]
┌─ Guest opens app on SAME device
├─ AsyncStorage is persistent!
├─ sessionId "session-abc-123-xyz" is still there ✓
└─ Ready for requests

[02:05 PM] Guest views cart
├─ GET /cart
│  Headers: x-session-id: "session-abc-123-xyz"
│
└─ Backend:
   ├─ Check: Does cart exist with sessionId="session-abc-123-xyz"?
   ├─ YES! → Load cart from database
   │   SELECT * FROM carts 
   │   WHERE sessionId='session-abc-123-xyz'
   │   Returns: cart-uuid-1
   │
   └─ Get items
      SELECT * FROM cart_items 
      WHERE cartId='cart-uuid-1'
      Returns: [item-1, item-2]  ← SAME 2 ITEMS!

RESPONSE:
{
  "id": "cart-uuid-1",
  "items": [
    {
      "productName": "Coconut Oil",
      "variantWeight": "500ml",
      "quantity": 1,
      "price": 299
    },
    {
      "productName": "Quinoa",
      "variantWeight": "1kg",
      "quantity": 1,
      "price": 399
    }
  ],
  "subtotal": 698,
  "itemCount": 2
}

RESULT: Items still there! ✓✓✓
```

### Day 2: Guest on Different Device

```
[02:00 PM] Guest opens app on DIFFERENT device (tablet)
├─ New device → New AsyncStorage
├─ NO sessionId in storage
├─ Generate NEW sessionId: "session-def-456-uvw"
└─ Cart from yesterday is NOT accessible
   (Different sessionId)

[02:05 PM] GET /cart
  Headers: x-session-id: "session-def-456-uvw"
  └─ Backend finds no cart with this sessionId
  └─ Creates empty cart
  └─ Result: Empty cart ✗

NOTE: Original cart still exists in DB on the phone
      Accessible if they use phone again with same sessionId
```

### Day 8: Cleanup

```
[Jan 18, 11:15 AM] Cleanup Job Runs
├─ SELECT * FROM carts WHERE expiresAt < now()
├─ Finds: cart-uuid-1 (expiresAt was Jan 18 11:15 AM)
├─ DELETE FROM carts WHERE id='cart-uuid-1'
│  └─ CASCADE deletes all cart_items
├─ DELETE FROM wishlists WHERE sessionId='session-abc-123-xyz'
│  └─ Cleans up guest wishlist items
└─ Result: Guest cart/wishlist gone

BUT: add_to_cart_events table still has records!
    (Never deleted for analytics)
```

---

## Detailed Timeline

```
Timeline: Guest Behavior Over 8 Days
═════════════════════════════════════════════════════════════════

Day 1 (Jan 11)
├─ 10:15 AM: First visit
│  ├─ Generate sessionId
│  ├─ Add Coconut Oil to cart ✓
│  └─ Database:
│     carts.sessionId = "abc-123"
│     carts.expiresAt = Jan 18, 10:15 AM
│
├─ 11:30 AM: Return to app
│  ├─ Use same sessionId (from AsyncStorage)
│  ├─ Add Quinoa to cart ✓
│  └─ Cart has 2 items
│
└─ 08:00 PM: Browse products
   ├─ Add Honey to wishlist ✓
   └─ Wishlist has 1 item

Day 2 (Jan 12)
├─ 09:00 AM: Open app on same phone
│  ├─ sessionId still in AsyncStorage ✓
│  ├─ GET /cart → 2 items shown ✓
│  ├─ GET /wishlist → 1 item shown ✓
│  └─ Seamless experience!
│
├─ 02:00 PM: Open app on tablet (different device)
│  ├─ New sessionId generated
│  ├─ GET /cart → Empty cart ✗
│  ├─ GET /wishlist → Empty wishlist ✗
│  └─ Device-specific data

Day 3-7 (Jan 13-17)
├─ Phone: Can access same cart/wishlist anytime
├─ Tablet: Has separate empty cart
├─ Database:
│  ├─ Phone cart still exists (expiresAt: Jan 18, 10:15 AM)
│  ├─ Tablet cart exists (expiresAt: Jan 19, 09:00 AM if they added items)
│  └─ Events table has all add_to_cart_events from all sessions

Day 8 (Jan 18)
├─ Before 10:15 AM
│  └─ Phone cart still accessible ✓
│
├─ 10:15 AM: CLEANUP JOB RUNS
│  ├─ DELETE FROM carts WHERE expiresAt < now()
│  ├─ Deletes: Phone cart (expiresAt was 10:15 AM)
│  ├─ Keeps: Tablet cart (expiresAt is later)
│  └─ Cascade deletes: All cart_items for phone cart
│
└─ After 10:15 AM
   ├─ Phone cart gone ✗
   ├─ Next access creates new empty cart
   └─ Wishlist also cleaned up (guest)

Day 19 (Jan 19)
└─ After tablet's expiresAt
   ├─ Tablet cart also deleted
   └─ All guest data cleared
```

---

## Key Points to Remember

### ✅ Persistence Works Because

1. **AsyncStorage is Persistent**
   - Mobile: AsyncStorage survives app closes/phone restarts
   - Web: localStorage survives browser closes/page refreshes
   - Only cleared if user manually clears cache

2. **sessionId is the Key**
   - Same sessionId = Same cart/wishlist
   - Backend uses sessionId to identify guests
   - No authentication needed

3. **Database Records Persist**
   - Cart records remain in DB until expiresAt date
   - 7-day TTL keeps DB clean
   - Events table never deletes (analytics)

### ❌ Persistence Fails When

1. **Different Device**
   - New device = New sessionId generated
   - Can't access old cart
   - Need login (userId) for cross-device access

2. **User Clears Cache**
   - Deletes AsyncStorage/localStorage
   - sessionId is lost
   - Next visit creates new sessionId

3. **Browser/App Uninstall**
   - Clears all local storage
   - sessionId is lost
   - But cart still exists in DB until expiry

4. **7 Days Pass**
   - Cleanup job deletes expired carts
   - Cart is gone forever
   - Should login to preserve data

---

## When Guest Logs In (Login Flow)

### Current Behavior

```
[Guest has sessionId: "abc-123"]
Guest adds items to cart/wishlist
Database:
  carts.sessionId = "abc-123"
  carts.userId = NULL

[Guest logs in] → userId = "user-789"
Request includes:
  x-session-id: "abc-123"  (from AsyncStorage)
  x-user-id: "user-789"    (from auth)

Backend now has BOTH:
├─ sessionId: "abc-123" (old guest cart)
└─ userId: "user-789" (new user cart)

Question: Should we merge them?
```

### Recommended Flow (TODO)

```
Option 1: Merge Guest to User (RECOMMENDED)
│
├─ When user logs in:
│  └─ Call: POST /wishlist/merge
│     Body: { sessionId: "abc-123", userId: "user-789" }
│
├─ WishlistService.mergeGuestWishlistToUser():
│  ├─ Find all wishlists with sessionId="abc-123"
│  ├─ For each item:
│  │  ├─ Check if user already has it
│  │  ├─ If NO → Update sessionId=NULL, userId="user-789"
│  │  └─ If YES → Delete guest copy
│  └─ Result: Guest wishlist now belongs to user
│
└─ Similar for carts (UPDATE carts SET userId='user-789' WHERE sessionId='abc-123')

Result: All items now persist indefinitely (no 7-day expiry)

───────────────────────────────────────────────────────

Option 2: Keep Separate (CURRENT)
│
├─ User can have both:
│  ├─ Guest cart (sessionId="abc-123", userId=NULL)
│  ├─ User cart (sessionId="abc-123", userId="user-789")
│
└─ Frontend decides which to show
   ├─ If userId exists → Show user cart
   └─ If no userId → Show guest cart

Result: Guest cart expires in 7 days, user cart persists forever
```

### Implementation Note

```typescript
// In WishlistService
async mergeGuestWishlistToUser(
  sessionId: string,
  userId: string
): Promise<void> {
  const guestWishlists = await this.wishlistRepository.find({
    where: { sessionId },
  });

  for (const guestItem of guestWishlists) {
    const existingUserWishlist = await this.wishlistRepository.findOne({
      where: {
        userId,
        productId: guestItem.productId,
        variantId: guestItem.variantId,
      },
    });

    if (!existingUserWishlist) {
      // Move to user account
      guestItem.userId = userId;
      guestItem.sessionId = null;
      guestItem.expiresAt = null;  // Remove 7-day expiry
      await this.wishlistRepository.save(guestItem);
    } else {
      // User already has it, delete guest copy
      await this.wishlistRepository.remove(guestItem);
    }
  }
}

// Call when user logs in:
// await wishlistService.mergeGuestWishlistToUser(sessionId, userId);
```

---

## Summary Table

| Scenario | Cart Visible? | Wishlist Visible? | Persistence |
|----------|---------------|-------------------|-------------|
| Guest, Same Device | ✓ | ✓ | 7 days |
| Guest, Different Device | ✗ | ✗ | None |
| Guest, Cache Cleared | ✗ | ✗ | Lost |
| Guest, 8 Days Later | ✗ | ✗ | Deleted |
| User, Same Account | ✓ | ✓ | Forever |
| User, Different Device | ✓ | ✓ | Forever |
| User, Cache Cleared | ✓ | ✓ | Forever |
| User, Any time | ✓ | ✓ | Forever |

---

## Code Example: Mobile App Implementation

```typescript
// app.tsx or main entry point
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    // Check if sessionId already exists
    let id = await AsyncStorage.getItem('sessionId');

    // If not, generate new one
    if (!id) {
      id = uuidv4();
      await AsyncStorage.setItem('sessionId', id);
    }

    setSessionId(id);
  };

  const addToCart = async (productId: string, variantId: string, quantity: number) => {
    const response = await fetch('http://api.example.com/cart/items', {
      method: 'POST',
      headers: {
        'x-session-id': sessionId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, variantId, quantity }),
    });

    const cart = await response.json();
    return cart;
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('http://api.example.com/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const { token } = await response.json();
    await AsyncStorage.setItem('authToken', token);

    // Merge guest wishlist to user
    const userId = jwtDecode(token).sub;
    await fetch('http://api.example.com/wishlist/merge', {
      method: 'POST',
      headers: {
        'x-session-id': sessionId!,
        'x-user-id': userId,
        'Content-Type': 'application/json',
      },
    });
  };

  return <YourApp sessionId={sessionId} />;
}
```

---

## Troubleshooting

### "I added items yesterday but they're gone today"

**Possible Causes:**
- [ ] Different device (new sessionId)
- [ ] Cache was cleared (AsyncStorage wiped)
- [ ] 7 days passed (cleanup job ran)
- [ ] sessionId not saved properly

**Solution:**
- Use same device as before
- Check AsyncStorage for sessionId
- If >7 days, cart is gone (by design)
- Login to user account (persists forever)

### "My cart is different on phone vs tablet"

**Expected Behavior:**
- Each device gets its own sessionId
- Each sessionId has separate cart
- This is by design!

**Solution:**
- Login with same account on both
- User carts sync across devices
- Guest carts are device-specific

### "Items disappeared when I logged in"

**Possible Causes:**
- [ ] Didn't merge guest wishlist
- [ ] Frontend didn't send sessionId after login
- [ ] Merge endpoint not called

**Solution:**
- Call mergeGuestWishlistToUser after login
- Ensure x-session-id header sent after login
- Check server logs for errors

---

## Final Answer

**Yes!** A guest's cart and wishlist items persist across sessions on the same device for up to 7 days, thanks to:

1. ✅ **AsyncStorage/localStorage** - Persists sessionId
2. ✅ **Database records** - Persist until expiresAt
3. ✅ **sessionId matching** - Backend identifies same guest
4. ✅ **7-day TTL** - Automatic cleanup

The moment they log in, their data can persist forever if you call the merge method!
