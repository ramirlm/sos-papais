import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReminderTable1758815826992 implements MigrationInterface {
    name = 'AddReminderTable1758815826992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reminder" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dueDate" TIMESTAMP NOT NULL, "message" character varying NOT NULL, "parentId" uuid, CONSTRAINT "PK_9ec029d17cb8dece186b9221ede" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reminder" ADD CONSTRAINT "FK_d48efce3b0f491faeee4d364ffd" FOREIGN KEY ("parentId") REFERENCES "parent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder" DROP CONSTRAINT "FK_d48efce3b0f491faeee4d364ffd"`);
        await queryRunner.query(`DROP TABLE "reminder"`);
    }

}
