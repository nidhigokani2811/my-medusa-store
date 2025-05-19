import { completeCartWorkflow, updateCartWorkflow } from "@medusajs/medusa/core-flows";


completeCartWorkflow.hooks.validate(
    async ({ input, cart }, { container }) => {
        // Validate required metadata for technician booking
        if (!cart.metadata?.startTime || !cart.metadata?.endTime) {
            throw new Error("Start time and end time are required for technician booking");
        }

        // Validate sales channel exists
        if (!cart.sales_channel_id) {
            throw new Error("Sales channel is required for technician booking");
        }

        // Validate customer exists
        if (!cart.customer_id) {
            throw new Error("Customer is required for technician booking");
        }

        // Validate time slots are valid numbers
        const startTime = Number(cart.metadata.startTime);
        const endTime = Number(cart.metadata.endTime);

        if (isNaN(startTime) || isNaN(endTime)) {
            throw new Error("Invalid time format");
        }

        // Check if time slot is available
        const query = container.resolve("query");
        const { data: sales_channel } = await query.graph({
            entity: "sales_channel",
            filters: { id: cart.sales_channel_id },
            fields: ["tenant.nylas_configuration_id"]
        });

        const configId = sales_channel[0]?.tenant?.nylas_configuration_id;
        if (!configId) {
            throw new Error("Nylas configuration not found for this sales channel");
        }

        // Check availability with Nylas
        const responseAvailability = await fetch(
            `${process.env.NYLAS_API_URL}scheduling/availability?configuration_id=${configId}&end_time=${endTime}&start_time=${startTime}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${process.env.NYLAS_API_KEY}`
                }
            }
        );

        if (!responseAvailability.ok) {
            throw new Error("Failed to check time slot availability");
        }

        const availabilityData = await responseAvailability.json();
        const timeSlot = availabilityData.data.time_slots.find(
            (slot: any) => slot.start_time === startTime && slot.end_time === endTime
        );

        if (!timeSlot) {
            throw new Error("Selected time slot is not available");
        }
     
        return;
    }
);