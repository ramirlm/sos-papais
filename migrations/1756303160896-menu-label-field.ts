import { MigrationInterface, QueryRunner } from 'typeorm';

export class MenuLabelField1756303160896 implements MigrationInterface {
  name = 'MenuLabelField1756303160896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "menu" ADD "label" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "menu" DROP COLUMN "label"`);
  }
}
