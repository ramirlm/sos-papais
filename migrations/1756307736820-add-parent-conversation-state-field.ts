import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentConversationStateField1756307736820
  implements MigrationInterface
{
  name = 'AddParentConversationStateField1756307736820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parent" ADD "conversationState" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parent" DROP COLUMN "conversationState"`,
    );
  }
}
