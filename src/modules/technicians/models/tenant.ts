import { model } from "@medusajs/framework/utils";

export const Tenant = model.define("tenant", {
  id: model.id({ prefix: "tenant" }).primaryKey(),
  name: model.text(),
  email: model.text().unique(),
  nylas_grant_id: model.text().nullable(),
  nylas_calendar_id: model.text().nullable(),
  nylas_configuration_id: model.text().nullable(),
  payload_tenant_id: model.number(),
});
