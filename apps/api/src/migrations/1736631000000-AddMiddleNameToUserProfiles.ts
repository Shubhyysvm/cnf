import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMiddleNameToUserProfiles1736631000000 implements MigrationInterface {
  name = 'AddMiddleNameToUserProfiles1736631000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
      ADD COLUMN "middleName" character varying(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
      DROP COLUMN "middleName"
    `);
  }
}
