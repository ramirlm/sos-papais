import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRemindersNullableDueDate1759033408557 implements MigrationInterface {
    name = 'AddRemindersNullableDueDate1759033408557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder" ALTER COLUMN "dueDate" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder" ALTER COLUMN "dueDate" SET NOT NULL`);
    }

}
