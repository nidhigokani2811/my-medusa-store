//name: model.text(),
// email: model.text().unique(),
// nylas_grant_id: model.text().nullable(),
// nylas_calendar_id: model.text().nullable(),
// nylas_configuration_id: model.text().nullable(),
// payload_tenant_id: model.text(),


import { MedusaRequest } from "@medusajs/framework/http";
import { MedusaResponse } from "@medusajs/framework/http";
import TechnicianService from "../../../modules/technicians/service";
import { TECHNICIAN_MODULE } from "../../../modules/technicians";
import { CreateTenantInput } from "./validator";
import { container } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

export async function POST(
    req: MedusaRequest<CreateTenantInput>,
    res: MedusaResponse
) {
    const technicianService: TechnicianService =
        req.scope.resolve(TECHNICIAN_MODULE);

    const response = await technicianService.createTenants({
        name: req.body.name,
        email: req.body.email,
        payload_tenant_id: req.body.payload_tenant_id,
        nylas_grant_id: req.body.nylas_grant_id,
        nylas_calendar_id: req.body.nylas_calendar_id,
        nylas_configuration_id: req.body.nylas_configuration_id,
    });

    const remoteLink = container.resolve("remoteLink");

    // Create link between tenant and sales channel
    await remoteLink.create([
        {
            [TECHNICIAN_MODULE]: {
                tenant_id: response.id,

            },
            [Modules.SALES_CHANNEL]: {
                sales_channel_id: req.body.sales_channel_id,
            },
        },
    ]);

    res.json({
        message: "Tenant created successfully",
        data: response,
    });
}
