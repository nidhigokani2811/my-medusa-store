import { defineMiddlewares, MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework"
import * as QueryConfig from "./store/custom/query-config"
import { AdminGetOrdersParams } from "./store/custom/validator"
import { createTenantSchema } from "./admin/tenant/validator"
import { createTechnicianSchema } from "./admin/technician/validator"

const adminTenantMiddleware: MiddlewareRoute[] = [
    {
        matcher: "/admin/tenant",
        method: "POST",
        middlewares: [

            validateAndTransformBody(createTenantSchema)
        ],
    },
    {
        matcher: "/admin/technician",
        method: "POST",
        middlewares: [
            validateAndTransformBody(createTechnicianSchema)
        ],
    }
]


export default defineMiddlewares(
    {
        routes: [{
            method: ["GET"],
            matcher: "/store/custom",
            middlewares: [
                validateAndTransformQuery(
                    AdminGetOrdersParams,
                    QueryConfig.listTransformQueryConfig
                ),
            ],
        },
        ...adminTenantMiddleware
        ]
    })
