import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsDefaultFromProductImages1734793300003 implements MigrationInterface {
  name = 'RemoveIsDefaultFromProductImages1734793300003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop column
    await queryRunner.query(`ALTER TABLE "product_images" DROP COLUMN "isDefault"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add column with default
    await queryRunner.query(`ALTER TABLE "product_images" ADD "isDefault" boolean NOT NULL DEFAULT false`);
  }
}
