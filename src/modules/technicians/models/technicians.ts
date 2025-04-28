import { model } from "@medusajs/framework/utils";

export const Technician = model
  .define("technician", {
    id: model.id().primaryKey(),
    name: model.text(),
    email: model.text().unique(),
    technician_id: model.text().unique(),
    tenant_id: model.text(),
  })
