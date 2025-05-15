import { z } from "zod";

export const createTechnicianSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    payload_technician_id: z.number().min(1, "Payload technician ID is required"),
    payload_tenant_id: z.number().min(1, "Payload tenant ID is required"),
    nylas_grant_id: z.string().nullable().optional(),
    nylas_calendar_id: z.string().nullable().optional(),
    nylas_configuration_id: z.string().nullable().optional(),
});

export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
