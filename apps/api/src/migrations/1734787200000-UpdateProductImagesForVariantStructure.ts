import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateProductImagesForVariantStructure1734787200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add variantId to product_images
    await queryRunner.addColumn(
      'product_images',
      new TableColumn({
        name: 'variantId',
        type: 'uuid',
        isNullable: true,
      })
    );

    // Add variantWeight to product_images
    await queryRunner.addColumn(
      'product_images',
      new TableColumn({
        name: 'variantWeight',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add imageType to product_images (hero-card, info-card, other)
    await queryRunner.addColumn(
      'product_images',
      new TableColumn({
        name: 'imageType',
        type: 'varchar',
        default: "'other'",
      })
    );

    // Create index on variantId and imageType for quick lookups
    await queryRunner.query(
      `CREATE INDEX idx_product_images_variant_type ON product_images("variantId", "imageType")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX idx_product_images_variant_type`);

    // Remove columns
    await queryRunner.dropColumn('product_images', 'imageType');
    await queryRunner.dropColumn('product_images', 'variantWeight');
    await queryRunner.dropColumn('product_images', 'variantId');
  }
}
