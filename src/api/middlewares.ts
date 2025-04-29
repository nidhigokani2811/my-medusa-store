import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework"
import * as QueryConfig from "./store/custom/query-config"
import { AdminGetOrdersParams } from "./store/custom/validator"
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
        },]
    })
