import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestWishlistAndRemoveCurrency1736630000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add sessionId column to wishlists table for guest wishlists
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD COLUMN "sessionId" character varying(100)`,
    );

    // Add expiresAt column to wishlists for guest cleanup (7 days)
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD COLUMN "expiresAt" timestamp`,
    );

    // Make userId nullable to support guest wishlists
    await queryRunner.query(
      `ALTER TABLE "wishlists" ALTER COLUMN "userId" DROP NOT NULL`,
    );

    // Create index for guest wishlists
    await queryRunner.query(
      `CREATE INDEX "IDX_wishlists_session" ON "wishlists" ("sessionId")`,
    );

    // Create index for session + product + variant combination (guest)
    await queryRunner.query(
      `CREATE INDEX "IDX_wishlists_session_product_variant" ON "wishlists" ("sessionId", "productId", "variantId")`,
    );

    // Update unique constraint to allow NULL userId for guests
    // This allows the same variant to be in both guest and user wishlists
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_b2faa2b8f8c5d0a4c2e1f3a9d5b7c9e1"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_wishlists_user_product_variant"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_wishlists_user_product_variant" ON "wishlists" ("userId", "productId", "variantId") WHERE "userId" IS NOT NULL`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_wishlists_session_product_variant"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_wishlists_session_product_variant" ON "wishlists" ("sessionId", "productId", "variantId") WHERE "sessionId" IS NOT NULL`,
    );

    // Remove currency column from carts table (India-only, always INR)
    await queryRunner.query(
      `ALTER TABLE "carts" DROP COLUMN IF EXISTS "currency"`,
    );

    // Add DEFAULT constant for INR if needed elsewhere
    // No need to store per-cart since it's always INR
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Remove guest wishlist support
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_wishlists_session_product_variant"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_wishlists_user_product_variant"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_wishlists_session_product_variant"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_wishlists_session"`,
    );

    // Make userId NOT NULL again
    await queryRunner.query(
      `ALTER TABLE "wishlists" ALTER COLUMN "userId" SET NOT NULL`,
    );

    // Remove new columns
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP COLUMN "expiresAt"`,
    );

    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP COLUMN "sessionId"`,
    );

    // Restore currency column to carts
    await queryRunner.query(
      `ALTER TABLE "carts" ADD COLUMN "currency" character varying(3) DEFAULT 'INR'`,
    );

    // Restore original unique constraint
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b2faa2b8f8c5d0a4c2e1f3a9d5b7c9e1" ON "wishlists" ("userId", "productId", "variantId")`,
    );
  }
}
