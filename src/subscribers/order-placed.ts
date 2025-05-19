import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { TECHNICIAN_MODULE } from "../modules/technicians";
import { bookTechnicianAppointment } from "./utils";
import { updateOrderWorkflow } from "@medusajs/medusa/core-flows";

export default async function orderPlacedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    try {
        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const { id } = data;

        // Fetch only required fields
        const { data: order } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "metadata",
                "customer.email",
                "customer.first_name",
                "customer.last_name",
                "sales_channel.id"
            ],
            filters: { id: id },
        });

        const orderData = order[0];
      

        if (orderData.metadata?.startTime && orderData.metadata?.endTime && orderData.customer?.email && orderData.sales_channel?.id && orderData.metadata?.technicianEmail) {
            // Book appointment
            const bookingData = await bookTechnicianAppointment(
                Number(orderData.metadata?.startTime),
                Number(orderData.metadata?.endTime),
                `${orderData.customer?.first_name} ${orderData.customer?.last_name}`,
                orderData.customer?.email,
                orderData.sales_channel?.id ?? "",
                `${orderData.metadata?.technicianEmail}`
            );

            // Update order and create link in parallel
            await Promise.all([
                updateOrderWorkflow(container).run({
                    input: {
                        id,
                        metadata: {
                            nylasBookingId: bookingData.booking.data.booking_id,
                            technician_id: bookingData.technician.id
                        },
                        user_id: orderData.customer.id
                    }
                }),
                container.resolve("remoteLink").create([{
                    [Modules.ORDER]: { order_id: id },
                    [TECHNICIAN_MODULE]: { technician_id: bookingData.technician.id }
                }])
            ]);
        }
    } catch (error) {
        console.error("Error in orderPlacedHandler:", error);
        throw error;
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
};
