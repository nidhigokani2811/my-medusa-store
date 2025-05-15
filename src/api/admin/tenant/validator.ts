import { z } from "zod";

export const createTenantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    nylas_grant_id: z.string().nullable().optional(),
    nylas_calendar_id: z.string().nullable().optional(),
    nylas_configuration_id: z.string().nullable().optional(),
    payload_tenant_id: z.string().min(1, "Payload tenant ID is required"),
    sales_channel_id: z.string().min(1, "Sales channel ID is required"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
