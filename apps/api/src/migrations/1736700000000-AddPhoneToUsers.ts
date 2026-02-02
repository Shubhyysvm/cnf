import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneToUsers1736700000000 implements MigrationInterface {
  name = 'AddPhoneToUsers1736700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add phone column to users table if it doesn't exist
    const table = await queryRunner.getTable('users');
    const phoneColumnExists = table?.columns.find((col) => col.name === 'phone');

    if (!phoneColumnExists) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'phone',
          type: 'character varying',
          length: '20',
          isUnique: true,
          isNullable: true,
        }),
      );

      // Create index for faster phone lookups
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users" ("phone")`,
      );

      console.log('[Migration] Phone column added to users table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
    console.log('[Migration] Phone column removed from users table');
  }
}
