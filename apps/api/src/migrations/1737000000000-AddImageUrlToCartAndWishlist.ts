import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImageUrlToCartAndWishlist1737000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Add imageUrl column to cart_items table
    await queryRunner.addColumn(
      'cart_items',
      new TableColumn({
        name: 'imageUrl',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'Hero image URL at time of adding to cart',
      }),
    );

    // Add imageUrl column to wishlists table
    await queryRunner.addColumn(
      'wishlists',
      new TableColumn({
        name: 'imageUrl',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'Hero image URL at time of adding to wishlist',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Remove imageUrl column from wishlists table
    await queryRunner.dropColumn('wishlists', 'imageUrl');

    // Remove imageUrl column from cart_items table
    await queryRunner.dropColumn('cart_items', 'imageUrl');
  }
}
