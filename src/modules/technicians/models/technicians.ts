import { model } from "@medusajs/framework/utils";
import { Tenant } from "./tenant";

export const Technician = model.define("technician", {
  id: model.id({ prefix: "tech" }).primaryKey(),
  name: model.text(),
  email: model.text().unique(),
  payload_technician_id: model.number(),
  nylas_grant_id: model.text().nullable(),
  nylas_calendar_id: model.text().nullable(),
  nylas_configuration_id: model.text().nullable(),
  payload_tenant_id: model.number(),
  tenant: model.belongsTo(() => Tenant, {
    fields: ["tenant_id"],
    references: ["id"],
  })
});
