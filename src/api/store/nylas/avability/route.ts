import { MedusaResponse } from "@medusajs/framework/http";
import { MedusaRequest } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest<{ startTime: string, endTime: string }>, res: MedusaResponse) {
    const { startTime, endTime } = req.query;

    //TODO: Get this from the database
    const NYLAS_CONFIGURATION_ID = '620dba8d-24c1-46e6-8841-69c0b6d896fd';
    try {
        const response = await fetch(
            `${process.env.NYLAS_API_URL}scheduling/availability?configuration_id=${NYLAS_CONFIGURATION_ID}&end_time=${endTime}&start_time=${startTime}`,
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
        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'An error occurred while fetching availability'
        });
    }
}