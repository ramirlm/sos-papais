import { MigrationInterface, QueryRunner } from 'typeorm';

export class MenusAndOptionsTables1756229575045 implements MigrationInterface {
  name = 'MenusAndOptionsTables1756229575045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "option" ("id" SERIAL NOT NULL, "label" character varying NOT NULL, CONSTRAINT "PK_e6090c1c6ad8962eea97abdbe63" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "menu" ("id" SERIAL NOT NULL, "parentMenuId" integer, CONSTRAINT "PK_35b2a8f47d153ff7a41860cceeb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "menu_options_option" ("menuId" integer NOT NULL, "optionId" integer NOT NULL, CONSTRAINT "PK_a09076ec13fa75fdc768cb84810" PRIMARY KEY ("menuId", "optionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_41d3bdc6b10efc47ba60f36dfd" ON "menu_options_option" ("menuId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af4a310089cb88c4a2853ecb60" ON "menu_options_option" ("optionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "menu" ADD CONSTRAINT "FK_fbe2023241bd4c612415c080cc6" FOREIGN KEY ("parentMenuId") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_options_option" ADD CONSTRAINT "FK_41d3bdc6b10efc47ba60f36dfd3" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_options_option" ADD CONSTRAINT "FK_af4a310089cb88c4a2853ecb608" FOREIGN KEY ("optionId") REFERENCES "option"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "menu_options_option" DROP CONSTRAINT "FK_af4a310089cb88c4a2853ecb608"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_options_option" DROP CONSTRAINT "FK_41d3bdc6b10efc47ba60f36dfd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu" DROP CONSTRAINT "FK_fbe2023241bd4c612415c080cc6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af4a310089cb88c4a2853ecb60"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_41d3bdc6b10efc47ba60f36dfd"`,
    );
    await queryRunner.query(`DROP TABLE "menu_options_option"`);
    await queryRunner.query(`DROP TABLE "menu"`);
    await queryRunner.query(`DROP TABLE "option"`);
  }
}
