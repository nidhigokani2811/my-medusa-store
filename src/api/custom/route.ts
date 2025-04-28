import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TECHNICIAN_MODULE } from "../../modules/technicians";
import TechnicianService from "../../modules/technicians/service";

export async function POST(req: MedusaRequest<{ name: string, email: string }>, res: MedusaResponse) {

    const technicianService: TechnicianService = req.scope.resolve(TECHNICIAN_MODULE);

    console.log(req.body, "req.bodyfff");
    const response = await technicianService.createTechnicians({
        ...req.body,
    });

    res.json({
        message: "Success",
        data: response,
    });
}