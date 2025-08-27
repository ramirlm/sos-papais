import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParentCurrentChildSetNull1756309252312
  implements MigrationInterface
{
  name = 'ParentCurrentChildSetNull1756309252312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parent" DROP CONSTRAINT "FK_c4eeb202b11ebb5226b08b353e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent" ADD CONSTRAINT "FK_c4eeb202b11ebb5226b08b353e3" FOREIGN KEY ("currentChildId") REFERENCES "child"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parent" DROP CONSTRAINT "FK_c4eeb202b11ebb5226b08b353e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent" ADD CONSTRAINT "FK_c4eeb202b11ebb5226b08b353e3" FOREIGN KEY ("currentChildId") REFERENCES "child"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
