import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentConversationStateField1758824738762 implements MigrationInterface {
    name = 'AddParentConversationStateField1758824738762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "conversationState" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "conversationState"`);
    }

}
