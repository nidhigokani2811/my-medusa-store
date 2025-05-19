import { container } from "@medusajs/framework";


export const bookTechnicianAppointment = async (
    startTime: number,
    endTime: number,
    customer_name: string,
    customer_email: string,
    sales_channel_id: string,
    email_address: string
) => {
    const query = container.resolve("query");

    // Fetch sales channel and technician data concurrently
    const [{ data: sales_channel }, { data: technician }] = await Promise.all([
        query.graph({
            entity: "sales_channel",
            filters: { id: sales_channel_id },
            fields: ["tenant.*",]
        }),
        query.graph({
            entity: "technician",
            filters: { email: email_address },
            fields: ["*", "tenant.*"]
        })
    ]);

    const configId = sales_channel[0]?.tenant?.nylas_configuration_id;

    if (!technician[0].tenant.id || technician[0].tenant.id !== sales_channel[0]?.tenant?.id) {
        throw new Error("Technician not found");
    }
    // Create booking
    const response = await fetch(
        `${process.env.NYLAS_API_URL}scheduling/bookings?configuration_id=${configId}&timezone=Asia/Kolkata`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NYLAS_API_KEY}`
            },
            method: 'POST',
            body: JSON.stringify({
                start_time: startTime,
                end_time: endTime,
                participants: [{ email: email_address }],
                guest: {
                    name: customer_name,
                    email: customer_email
                },
                timezone: "Asia/Kolkata"
            })
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Nylas API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return { booking: data, technician: technician[0] };
};