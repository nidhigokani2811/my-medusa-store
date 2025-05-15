import { MedusaService } from "@medusajs/framework/utils"
import { Technician } from "./models/technicians"
import { Tenant } from "./models/tenant"
class TechnicianService extends MedusaService({
    Technician,
    Tenant,
}) {
}

export default TechnicianService