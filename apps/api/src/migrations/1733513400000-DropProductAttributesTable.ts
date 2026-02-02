import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProductAttributesTable1733513400000 implements MigrationInterface {
  name = 'DropProductAttributesTable1733513400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists before attempting to drop it
    const tableExists = await queryRunner.hasTable('product_attributes');
    
    if (tableExists) {
      // Drop foreign key constraint first
      await queryRunner.query(
        `ALTER TABLE "product_attributes" DROP CONSTRAINT IF EXISTS "FK_c0cef0099fde7eb45d630f66f71"`,
      );

      // Drop the product_attributes table
      await queryRunner.query(`DROP TABLE "product_attributes"`);
      console.log('Successfully dropped product_attributes table');
    } else {
      console.log('Table product_attributes does not exist, skipping...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the product_attributes table (for rollback)
    await queryRunner.query(
      `CREATE TABLE "product_attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "productId" uuid, CONSTRAINT "PK_9f2fa11ad9a14c31c9efc30eefc" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_c0cef0099fde7eb45d630f66f7" ON "product_attributes" ("productId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_c0cef0099fde7eb45d630f66f71" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE`,
    );
  }
}
