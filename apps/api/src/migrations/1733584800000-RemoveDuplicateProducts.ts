import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDuplicateProducts1733584800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration identifies and removes duplicate products
    // Duplicates are identified by case-insensitive name matching
    
    // Find duplicates (case-insensitive)
    const duplicates = await queryRunner.query(`
      SELECT LOWER(name) as name_lower, array_agg(id) as ids, COUNT(*) as cnt
      FROM products
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC;
    `);

    if (duplicates.length > 0) {
      console.log("Found duplicate products:", duplicates);
      
      // For each duplicate group, keep the first (oldest) and delete the rest
      for (const duplicate of duplicates) {
        const idsToKeep = duplicate.ids.slice(0, 1); // Keep first
        const idsToDelete = duplicate.ids.slice(1);   // Delete rest
        
        console.log(`Keeping: ${idsToKeep}, Deleting: ${idsToDelete}`);
        
        // Delete duplicate product records
        if (idsToDelete.length > 0) {
          await queryRunner.query(
            `DELETE FROM products WHERE id = ANY($1)`,
            [idsToDelete]
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is destructive, no rollback available
    throw new Error("This migration cannot be rolled back - duplicates have been permanently removed");
  }
}
