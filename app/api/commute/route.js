export async function POST(request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { origin, destination, startRange, endRange } = body;

        // Validate that origin, destination, and time range are provided
        if (!origin || !destination || !startRange || !endRange) {
            return new Response(
                JSON.stringify({ error: "Origin, destination, and time range are required." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const times = [];

        // Convert the start and end times to date objects with the full date and time
        const startTime = new Date(startRange);
        let endTime = new Date(endRange);

        // Adjust the end time if it's earlier than the start time (move it to the next day)
        if (endTime <= startTime) {
            endTime.setDate(endTime.getDate() + 1);
        }

        // Ensure the start time is in the future (if it's already past, move it to the next day)
        const currentTime = new Date();
        if (startTime < currentTime) {
            startTime.setDate(startTime.getDate() + 1); // Move to the next day if start time is in the past
        }

        console.log("Start Time:", startTime.toISOString());
        console.log("End Time:", endTime.toISOString());

        // Loop through the time range in 15-minute intervals
        for (let time = startTime.getTime(); time <= endTime.getTime(); time += 15 * 60 * 1000) {
            const departureTime = Math.floor(time / 1000); // Convert to seconds since epoch

            // Build the Google Maps URL with the departure time
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
                origin
            )}&destinations=${encodeURIComponent(destination)}&departure_time=${departureTime}&key=${apiKey}`;

            // Fetch data from the Google Maps API
            const response = await fetch(url);
            if (!response.ok) {
                console.error("Failed to fetch data:", response.status, response.statusText);
                return new Response(
                    JSON.stringify({ error: "Failed to fetch data from Google Maps API." }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
            console.log("Google Maps API URL:", url);
console.log("Google Maps API Response:", response.status, response.statusText);

            const data = await response.json();
            console.log("Google Maps API Response:", JSON.stringify(data, null, 2));

            // Extract the travel time in seconds
            const travelTimeInSeconds = data.rows?.[0]?.elements?.[0]?.duration_in_traffic?.value;

            if (travelTimeInSeconds) {
                console.log(`Departure Time: ${new Date(time).toLocaleTimeString()} | Travel Time: ${travelTimeInSeconds} seconds`);
                times.push({ departureTime: new Date(time).toISOString(), travelTimeInSeconds });
            } else {
                console.error("No travel time found for this request:", data);
            }
        }

        // If no valid times were found, return an error response
        if (times.length === 0) {
            return new Response(
                JSON.stringify({ error: "Unable to determine the best departure time." }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Find the departure time with the shortest travel time
        const bestTime = times.reduce((prev, curr) =>
            prev.travelTimeInSeconds < curr.travelTimeInSeconds ? prev : curr
        );

        return new Response(
            JSON.stringify({
                message: `The best time to leave is ${new Date(bestTime.departureTime).toLocaleTimeString()} with a travel time of ${bestTime.travelTimeInSeconds} seconds.`,
                bestDepartureTime: new Date(bestTime.departureTime).toLocaleTimeString(),
                travelTimeInSeconds: bestTime.travelTimeInSeconds,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error handling POST request:", error.message);
        return new Response(
            JSON.stringify({ error: "Internal server error." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
// POST REQUEST BODY:
// {
//     "origin": "Times Square, New York, NY",
//     "destination": "Central Park, New York, NY",
//     "startRange": "2025-01-16T23:00:00",
//     "endRange": "2025-01-16T23:30:00"
// }