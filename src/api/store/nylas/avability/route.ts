import { container } from "@medusajs/framework";
import { MedusaResponse } from "@medusajs/framework/http";
import { MedusaRequest } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest<{ startTime: string, endTime: string, cartId: string }>, res: MedusaResponse) {
    const { startTime, endTime, cartId } = req.query;
    if (!cartId) {
        console.log("Cart ID is required")
        return res.status(400).json({
            error: "Cart ID is required"
        });
    }
    const query = container.resolve("query")
    const { data: cart } = await query.graph({
        entity: "cart",
        filters: { id: cartId as unknown as string },
        fields: ["*", "sales_channel.*", "sales_channel.tenant.*"]
    })

    const tenantId = cart?.[0]?.sales_channel?.tenant?.id
    if (!tenantId && !cart?.[0]?.sales_channel?.tenant?.nylas_configuration_id) {
        console.log("Cart not found or missing tenant information")
        return res.status(400).json({
            error: "Cart not found or missing tenant information or nylas configuration id"
        });
    }
    // const NYLAS_CONFIGURATION_ID = '620dba8d-24c1-46e6-8841-69c0b6d896fd';
    const configId = cart?.[0]?.sales_channel?.tenant?.nylas_configuration_id
    if (!configId) {
        console.log("Technician not found or missing configuration information")
        return res.status(400).json({
            error: "Technician not found or missing configuration information"
        });
    }
    try {
        const response = await fetch(
            `${process.env.NYLAS_API_URL}scheduling/availability?configuration_id=${configId}&end_time=${endTime}&start_time=${startTime}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${process.env.NYLAS_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Nylas API error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("🚀 ~ GET ~ data:", data)
        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'An error occurred while fetching availability'
        });
    }
}