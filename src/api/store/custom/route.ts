import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";
import { HttpTypes, OrderDTO } from "@medusajs/framework/types";
import TechnicianService from "../../../modules/technicians/service";
import { TECHNICIAN_MODULE } from "../../../modules/technicians";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest<HttpTypes.AdminOrderFilters>,
  res: MedusaResponse<HttpTypes.AdminOrderListResponse>
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { technician_id, tenant_id } = req.query;

  const { data } = await query.graph({
    entity: "technician",
    fields: ["*", "orders.*"],
    filters: {
      ...(technician_id && { technician_id: technician_id as string }),
      ...(tenant_id && { tenant_id: tenant_id as string }),
    },
  });

  const order_id = data.flatMap((order) =>
    order.orders?.map((order) => order?.id)
  );

  req.filterableFields.id = order_id;

  delete req.filterableFields.technician_id;
  delete req.filterableFields.tenant_id;

  const variables = {
    filters: {
      ...req.filterableFields,
      is_draft_order: false,
    },
    ...req.queryConfig.pagination,
  };

  const workflow = getOrdersListWorkflow(req.scope);
  const { result } = await workflow.run({
    input: {
      fields: [...req.queryConfig.fields, "technician.*", "customer.*"],
      variables,
    },
  });

  const { rows, metadata } = result as {
    rows: OrderDTO[];
    metadata: any;
  };

  res.json({
    orders: rows as unknown as HttpTypes.AdminOrder[],
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
}
