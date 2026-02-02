import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCategoryFieldsToTables1734783600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add categoryId and categoryName to product_images
    await queryRunner.addColumn(
      'product_images',
      new TableColumn({
        name: 'categoryId',
        type: 'uuid',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'product_images',
      new TableColumn({
        name: 'categoryName',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add categoryId and categoryName to product_variants
    await queryRunner.addColumn(
      'product_variants',
      new TableColumn({
        name: 'categoryId',
        type: 'uuid',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'product_variants',
      new TableColumn({
        name: 'categoryName',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add categoryId and categoryName to product_views
    await queryRunner.addColumn(
      'product_views',
      new TableColumn({
        name: 'categoryId',
        type: 'uuid',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'product_views',
      new TableColumn({
        name: 'categoryName',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add categoryName to products (categoryId already exists via FK)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'categoryName',
        type: 'varchar',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove from product_images
    await queryRunner.dropColumn('product_images', 'categoryName');
    await queryRunner.dropColumn('product_images', 'categoryId');

    // Remove from product_variants
    await queryRunner.dropColumn('product_variants', 'categoryName');
    await queryRunner.dropColumn('product_variants', 'categoryId');

    // Remove from product_views
    await queryRunner.dropColumn('product_views', 'categoryName');
    await queryRunner.dropColumn('product_views', 'categoryId');

    // Remove from products
    await queryRunner.dropColumn('products', 'categoryName');
  }
}
