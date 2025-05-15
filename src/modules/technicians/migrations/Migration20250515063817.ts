import { Migration } from '@mikro-orm/migrations';

export class Migration20250515063817 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "technician" drop constraint if exists "technician_email_unique";`);
    this.addSql(`alter table if exists "tenant" drop constraint if exists "tenant_email_unique";`);
    this.addSql(`create table if not exists "tenant" ("id" text not null, "name" text not null, "email" text not null, "nylas_grant_id" text null, "nylas_calendar_id" text null, "nylas_configuration_id" text null, "payload_tenant_id" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tenant_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tenant_email_unique" ON "tenant" (email) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tenant_deleted_at" ON "tenant" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "technician" ("id" text not null, "name" text not null, "email" text not null, "payload_technician_id" integer not null, "nylas_grant_id" text null, "nylas_calendar_id" text null, "nylas_configuration_id" text null, "payload_tenant_id" integer not null, "tenant_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "technician_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_technician_email_unique" ON "technician" (email) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technician_tenant_id" ON "technician" (tenant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technician_deleted_at" ON "technician" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "technician" add constraint "technician_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "technician" drop constraint if exists "technician_tenant_id_foreign";`);

    this.addSql(`drop table if exists "tenant" cascade;`);

    this.addSql(`drop table if exists "technician" cascade;`);
  }

}
