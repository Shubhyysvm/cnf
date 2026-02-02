# CNF Database Schema Extensions (Dec 21, 2025)

This document summarizes the new tables and modifications added to support scale, payments, inventory safety, reviews, coupons, and analytics.

## New Tables
- user_profiles: Profile PII and preferences (JSONB) linked 1:1 to users.
- user_addresses: Multiple addresses per user, type shipping/billing, default per type.
- login_sessions: Audited sessions with IP, UA, lifecycle (revocation).
- wishlists: Per-user favorites with unique (userId, productId).
- payments: Decoupled payment records with provider/status enums and gateway JSONB.
- refunds: Refunds against payments, partial supported.
- inventory_movements: Stock ledger with reasons and references.
- inventory_reservations (optional): Checkout locking with active partial index.
- order_status_history: Order lifecycle audit trail.
- reviews: Ratings/comments with moderation status.
- coupons: Discount definitions with validity window and usage tracking.
- order_coupons: Applied coupons snapshot per order.
- returns: After-sales returns linked to order_items.
- search_logs: Lightweight search analytics.
- add_to_cart_events: Funnel metric for add-to-cart actions.
- checkout_abandonments: Track checkout drop-offs by step with JSONB meta.

## Modifications
- orders: Added currency and billingAddress (JSONB) snapshot.
- site_settings: Value converted to JSONB and added group enum (payments, shipping, seo, general).
- carts: Optional currency column.

## Foreign Keys & Indexes
- FKs follow e-commerce relationships; indexes cover frequent filters (userId, status, createdAt, variant/product references).
- Partial indexes are used for defaults and active reservations.

## Rationale & Best Practices
- Use UUIDs and enums for integrity/performance.
- Snapshot data in orders/carts for historical accuracy.
- Payment/refund lifecycle decoupled from order status; gatewayResponse stored as JSONB.
- Audit and analytics tables kept lightweight but extensible.
