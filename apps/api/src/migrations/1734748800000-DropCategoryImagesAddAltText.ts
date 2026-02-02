import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCategoryImagesAddAltText1734748800000 implements MigrationInterface {
  name = 'DropCategoryImagesAddAltText1734748800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop category_images table if it exists
    const hasCategoryImages = await queryRunner.hasTable('category_images');
    if (hasCategoryImages) {
      await queryRunner.query(`DROP TABLE "category_images"`);
      console.log('Dropped category_images table');
    } else {
      console.log('category_images table not found, skipping drop');
    }

    // Add altText column to categories if not exists
    const hasAltText = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'altText'`
    );
    if (!hasAltText || hasAltText.length === 0) {
      await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN "altText" character varying`);
      console.log('Added altText column to categories');
    } else {
      console.log('altText column already exists on categories, skipping');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove altText column
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "altText"`);

    // Recreate category_images table (minimal structure) for rollback
    await queryRunner.query(`
      CREATE TABLE "category_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "categoryId" uuid NOT NULL,
        "imageUrl" text NOT NULL,
        "altText" text,
        "displayOrder" integer NOT NULL DEFAULT 0,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_category_images_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "category_images" ADD CONSTRAINT "FK_category_images_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_category_images_display_default" ON "category_images" ("displayOrder", "isDefault")`
    );
  }
}