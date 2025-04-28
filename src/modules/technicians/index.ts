import TechnicianService from "./service"
import { Module } from "@medusajs/framework/utils"

export const TECHNICIAN_MODULE = "technician"

export default Module(TECHNICIAN_MODULE, {
    service: TechnicianService,
})