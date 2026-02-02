import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveOfferFromProductVariants1734789000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('product_variants', 'offer');
    if (hasColumn) {
      await queryRunner.dropColumn('product_variants', 'offer');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('product_variants', 'offer');
    if (!hasColumn) {
      await queryRunner.addColumn('product_variants', new TableColumn({
        name: 'offer',
        type: 'varchar',
        isNullable: true,
      }));
    }
  }
}
