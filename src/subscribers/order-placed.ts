import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { LinkDefinition } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { TECHNICIAN_MODULE } from "../modules/technicians";
import { bookTechnicianAppointment } from "./utils";
import { updateOrderWorkflow } from "@medusajs/medusa/core-flows";

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
            "metadata.*",
            "sales_channel.*"
        ],
        filters: { id: id },
    });


    console.log("🚀 ~ order.metadata:", order[0].metadata)


    // book technician appointment in nylas
    if (order[0].metadata && order[0].metadata.startTime && order[0].metadata.endTime && order[0]?.customer?.email && order[0]?.sales_channel?.id) {
        const data = await bookTechnicianAppointment(Number(order[0].metadata.startTime), Number(order[0].metadata.endTime), order[0]?.customer?.email, order[0].customer.first_name + " " + order[0].customer.last_name, order[0]?.sales_channel?.id)
        await updateOrderWorkflow(container).run({
            input: {
                id: id,
                metadata: {
                    nylasBookingId: data.booking.data.booking_id,
                    technician_id: data.technician.id
                },
                user_id: order[0].customer.id
            }
        })



        const remoteLink = container.resolve("remoteLink");

        const links: LinkDefinition[] = [];

        links.push({
            [Modules.ORDER]: {
                order_id: id,
            },
            [TECHNICIAN_MODULE]: {
                technician_id: data.technician.id
            },
        });
        await remoteLink.create(links);
    }

}

export const config: SubscriberConfig = {
    event: "order.placed",
};
