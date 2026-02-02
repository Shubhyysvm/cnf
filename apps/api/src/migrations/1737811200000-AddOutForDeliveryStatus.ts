import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutForDeliveryStatus1737811200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'out_for_delivery' to the orders_status_enum type
    // This enum is used by: orders.status, order_status_history.fromStatus, and order_status_history.toStatus
    await queryRunner.query(`
      ALTER TYPE "orders_status_enum" ADD VALUE 'out_for_delivery' BEFORE 'delivered';
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't allow direct removal of enum values
    // You would need to create a new type, convert columns, drop old type, rename new type
    // For now, this is a one-way migration
    console.warn('Down migration for AddOutForDeliveryStatus is not implemented as PostgreSQL does not support removing enum values directly');
  }
}
