import { Migration } from '@mikro-orm/migrations';

export class Migration20220610102602 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" alter column "created_at" type date using ("created_at"::date);');
  }

}
