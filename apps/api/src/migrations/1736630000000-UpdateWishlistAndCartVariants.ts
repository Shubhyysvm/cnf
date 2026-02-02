import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class UpdateWishlistAndCartVariants1736630000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. UPDATE WISHLISTS TABLE
    // ========================================
    
    // Add variantId column to wishlists
    await queryRunner.addColumn(
      'wishlists',
      new TableColumn({
        name: 'variantId',
        type: 'uuid',
        isNullable: true, // Allow null for backward compatibility
      })
    );

    // Add foreign key constraint for variantId
    await queryRunner.createForeignKey(
      'wishlists',
      new TableForeignKey({
        name: 'FK_wishlists_variant',
        columnNames: ['variantId'],
        referencedTableName: 'product_variants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Keep wishlist entry even if variant deleted
      })
    );

    // Add index for performance
    await queryRunner.createIndex(
      'wishlists',
      new TableIndex({
        name: 'IDX_wishlists_variant',
        columnNames: ['variantId'],
      })
    );

    // Drop old unique constraint
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_wishlists_user_product"`
    );

    // Create new unique constraint including variantId
    // This allows same product with different variants in wishlist
    await queryRunner.createIndex(
      'wishlists',
      new TableIndex({
        name: 'UQ_wishlists_user_product_variant',
        columnNames: ['userId', 'productId', 'variantId'],
        isUnique: true,
      })
    );

    // ========================================
    // 2. UPDATE CART_ITEMS TABLE
    // ========================================
    
    // Add new variantId UUID column
    await queryRunner.addColumn(
      'cart_items',
      new TableColumn({
        name: 'variantId',
        type: 'uuid',
        isNullable: true, // Allow null during migration
      })
    );

    // Add variantWeight for denormalized display
    await queryRunner.addColumn(
      'cart_items',
      new TableColumn({
        name: 'variantWeight',
        type: 'varchar',
        length: '50',
        isNullable: true,
      })
    );

    // Add productName for denormalized display
    const hasProductName = await queryRunner.hasColumn('cart_items', 'productName');
    if (!hasProductName) {
      await queryRunner.addColumn(
        'cart_items',
        new TableColumn({
          name: 'productName',
          type: 'varchar',
          length: '255',
          isNullable: true,
        })
      );
    }

    // Migrate existing data from old 'variant' VARCHAR to new 'variantWeight'
    await queryRunner.query(
      `UPDATE "cart_items" 
       SET "variantWeight" = "variant" 
       WHERE "variant" IS NOT NULL`
    );

    // Try to map old variant strings to actual variantId (if possible)
    // This is a best-effort migration - manual review may be needed
    await queryRunner.query(
      `UPDATE "cart_items" ci
       SET "variantId" = pv.id
       FROM "product_variants" pv
       WHERE ci."productId" = pv."productId"
       AND ci."variant" = pv."weight"
       AND ci."variantId" IS NULL`
    );

    // Add foreign key constraint for variantId
    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        name: 'FK_cart_items_variant',
        columnNames: ['variantId'],
        referencedTableName: 'product_variants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Keep cart item but mark variant as unavailable
      })
    );

    // Add index for performance
    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_cart_items_variant',
        columnNames: ['variantId'],
      })
    );

    // Add composite index for cart + variant lookups
    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_cart_items_cart_variant',
        columnNames: ['cartId', 'variantId'],
      })
    );

    // Drop old 'variant' VARCHAR column
    // IMPORTANT: Only drop after verifying migration success
    const hasVariantColumn = await queryRunner.hasColumn('cart_items', 'variant');
    if (hasVariantColumn) {
      await queryRunner.dropColumn('cart_items', 'variant');
    }

    // Update price column if needed (ensure it exists and has correct type)
    const hasPriceColumn = await queryRunner.hasColumn('cart_items', 'price');
    if (!hasPriceColumn) {
      await queryRunner.addColumn(
        'cart_items',
        new TableColumn({
          name: 'price',
          type: 'numeric',
          precision: 10,
          scale: 2,
          isNullable: false,
          default: 0,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // ROLLBACK CART_ITEMS
    // ========================================
    
    // Restore old variant VARCHAR column
    await queryRunner.addColumn(
      'cart_items',
      new TableColumn({
        name: 'variant',
        type: 'varchar',
        length: '50',
        isNullable: true,
      })
    );

    // Restore data from variantWeight back to variant
    await queryRunner.query(
      `UPDATE "cart_items" 
       SET "variant" = "variantWeight" 
       WHERE "variantWeight" IS NOT NULL`
    );

    // Drop foreign key and indexes
    await queryRunner.dropForeignKey('cart_items', 'FK_cart_items_variant');
    await queryRunner.dropIndex('cart_items', 'IDX_cart_items_variant');
    await queryRunner.dropIndex('cart_items', 'IDX_cart_items_cart_variant');

    // Drop new columns
    await queryRunner.dropColumn('cart_items', 'variantId');
    await queryRunner.dropColumn('cart_items', 'variantWeight');

    // ========================================
    // ROLLBACK WISHLISTS
    // ========================================
    
    // Drop new unique constraint
    await queryRunner.dropIndex('wishlists', 'UQ_wishlists_user_product_variant');

    // Restore old unique constraint
    await queryRunner.createIndex(
      'wishlists',
      new TableIndex({
        name: 'UQ_wishlists_user_product',
        columnNames: ['userId', 'productId'],
        isUnique: true,
      })
    );

    // Drop foreign key and index
    await queryRunner.dropForeignKey('wishlists', 'FK_wishlists_variant');
    await queryRunner.dropIndex('wishlists', 'IDX_wishlists_variant');

    // Drop variantId column
    await queryRunner.dropColumn('wishlists', 'variantId');
  }
}
