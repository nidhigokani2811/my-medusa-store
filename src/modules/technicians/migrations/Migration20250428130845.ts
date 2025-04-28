import { Migration } from '@mikro-orm/migrations';

export class Migration20250428130845 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "technician" drop constraint if exists "technician_technician_id_unique";`);
    this.addSql(`alter table if exists "technician" drop constraint if exists "technician_email_unique";`);
    this.addSql(`create table if not exists "technician" ("id" text not null, "name" text not null, "email" text not null, "technician_id" text not null, "tenant_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "technician_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_technician_email_unique" ON "technician" (email) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_technician_technician_id_unique" ON "technician" (technician_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technician_deleted_at" ON "technician" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "technician" cascade;`);
  }

}
