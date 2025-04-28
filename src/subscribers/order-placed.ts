import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { LinkDefinition } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { TECHNICIAN_MODULE } from "../modules/technicians";

export default async function orderPlacedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { id } = data;


    // Fetch order with items
    const { data: order } = await query.graph({
        entity: "order",
        fields: [
            "*",
            "items.*",
            "customer.*",
            "items.metadata.*",
            "items.variant.*",
            "items.product.*",
            "email",
            "billing_address.*",
            "shipping_address.*",
            "summary.*",
        ],
        filters: { id: id },
    });

    const { data: technicians } = await query.graph({
        entity: "technician",
        fields: ["*"],
    });

    console.log(technicians);

    const remoteLink = container.resolve("remoteLink");

    const links: LinkDefinition[] = [];

    links.push({
        [Modules.ORDER]: {
            order_id: order ? order[0].id : null,
        },
        [TECHNICIAN_MODULE]: {
            technician_id: technicians ? technicians[0].id : null,
        },
    });
    await remoteLink.create(links);
}

export const config: SubscriberConfig = {
    event: "order.placed",
};
