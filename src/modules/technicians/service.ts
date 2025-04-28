import { MedusaService } from "@medusajs/framework/utils"
import { Technician } from "./models/technicians"

class TechnicianService extends MedusaService({
    Technician,
}) {
}

export default TechnicianService