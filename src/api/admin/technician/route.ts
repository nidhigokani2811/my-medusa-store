

import { MedusaRequest } from "@medusajs/framework/http";
import { MedusaResponse } from "@medusajs/framework/http";
import TechnicianService from "../../../modules/technicians/service";
import { TECHNICIAN_MODULE } from "../../../modules/technicians";
import { CreateTechnicianInput } from "./validator";
import { container } from "@medusajs/framework";

export async function POST(
  req: MedusaRequest<CreateTechnicianInput>,
  res: MedusaResponse
) {

  const technicianService: TechnicianService =
    req.scope.resolve(TECHNICIAN_MODULE);
  const query = container.resolve("query")

  const { data: tenant } = await query.graph({
    entity: "tenant",
    filters: { payload_tenant_id: req.body.payload_tenant_id },
    fields: ["id"]
  })
  const response = await technicianService.createTechnicians({
    name: req.body.name,
    email: req.body.email,
    payload_technician_id: req.body.payload_technician_id,
    payload_tenant_id: req.body.payload_tenant_id,
    nylas_grant_id: req.body.nylas_grant_id,
    nylas_calendar_id: req.body.nylas_calendar_id,
    nylas_configuration_id: req.body.nylas_configuration_id,
    tenant_id: tenant[0].id,
  });

  res.json({
    message: "Technician created successfully",
    data: response,
  });
}
