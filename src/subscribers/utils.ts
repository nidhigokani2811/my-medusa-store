

export const bookTechnicianAppointment = async (startTime: number, endTime: number, customer_name: string, customer_email: string) => {
    const NYLAS_CONFIGURATION_ID = '620dba8d-24c1-46e6-8841-69c0b6d896fd';
    const NYLAS_API_KEY = process.env.NYLAS_API_KEY;
    const responseAvailability = await fetch(
        `${process.env.NYLAS_API_URL}scheduling/availability?configuration_id=${NYLAS_CONFIGURATION_ID}&end_time=${endTime}&start_time=${startTime}`,
        {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.NYLAS_API_KEY}`
            }
        }
    );

    if (!responseAvailability.ok) {
        const errorData = await responseAvailability.json();
        throw new Error(`Nylas API error: ${JSON.stringify(errorData)}`);
    }

    const availabilityData = await responseAvailability.json();

    const timeSlot = availabilityData.data.time_slots.find((timeSlot: any) => {
        return timeSlot.start_time === startTime && timeSlot.end_time === endTime
    })
    if (!timeSlot) {
        throw new Error(`No time slot found for ${startTime} to ${endTime}`);
    }
    let emailAddress = timeSlot.emails.find((email: any) => email.email === availabilityData.data.order[0].email);
    if (!emailAddress) {
        emailAddress = timeSlot.emails[0];
    }
    const response = await fetch(`${process.env.NYLAS_API_URL}scheduling/bookings?configuration_id=${NYLAS_CONFIGURATION_ID}&timezone=Asia/Kolkata`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NYLAS_API_KEY}`
        },
        method: 'POST',
        body: JSON.stringify({
            start_time: startTime,
            end_time: endTime,
            "participants": [
                {
                    "email": emailAddress
                }
            ],
            "guest":{
                "name":customer_name,
                "email":customer_email
              },
              "timezone":"Asia/Kolkata"
        })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Nylas API error: ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    return data;
}