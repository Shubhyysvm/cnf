import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDisplayOrderFromProductImages1734793200002 implements MigrationInterface {
  name = 'RemoveDisplayOrderFromProductImages1734793200002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop index if it exists
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_22590be5ea78a6d34cad9f007a"`);
    // Drop column
    await queryRunner.query(`ALTER TABLE "product_images" DROP COLUMN "displayOrder"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add column with default and not null
    await queryRunner.query(`ALTER TABLE "product_images" ADD "displayOrder" integer NOT NULL DEFAULT 0`);
    // Recreate index
    await queryRunner.query(`CREATE INDEX "IDX_22590be5ea78a6d34cad9f007a" ON "product_images" ("displayOrder", "isDefault")`);
  }
}
