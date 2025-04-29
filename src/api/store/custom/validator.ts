import { createFindParams, createOperatorMap } from "@medusajs/medusa/api/utils/validators"
import { z } from "zod"

export const AdminGetOrdersParams = createFindParams({
    limit: 15,
    offset: 0,
}).merge(
    z.object({
        id: z
            .union([z.string(), z.array(z.string()), createOperatorMap()])
            .optional(),
        status: z
            .union([z.string(), z.array(z.string()), createOperatorMap()])
            .optional(),
        name: z.union([z.string(), z.array(z.string())]).optional(),
        sales_channel_id: z.array(z.string()).optional(),
        region_id: z.union([z.string(), z.array(z.string())]).optional(),
        customer_id: z.union([z.string(), z.array(z.string())]).optional(),
        q: z.string().optional(),
        created_at: createOperatorMap().optional(),
        updated_at: createOperatorMap().optional(),
        tenant_id: z.string().optional(),
        technician_id: z.string().optional(),
    })
)

export type AdminGetOrdersParamsType = z.infer<typeof AdminGetOrdersParams>