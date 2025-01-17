export async function POST(request) {
    try {
        // Parse the request body
        const body = await request.json();

        const { origin, destination } = body;

        // Validate that origin and destination are provided
        if (!origin || !destination) {
            return new Response(
                JSON.stringify({ error: "Origin and destination are required." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Fetch travel time using Google Maps API
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
            origin
        )}&destinations=${encodeURIComponent(destination)}&departure_time=now&key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: "Failed to fetch data from Google Maps API." }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const data = await response.json();
        console.log("Google Maps API Response:", JSON.stringify(data, null, 2));

        const travelTimeInSeconds = data.rows?.[0]?.elements?.[0]?.duration?.value;

        if (!travelTimeInSeconds) {
            return new Response(
                JSON.stringify({
                    error: "Unable to determine travel time.",
                    debug: data, // Include the API response for debugging
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Return the travel time
        return new Response(
            JSON.stringify({ travelTimeInSeconds }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error handling POST request:", error.message);
        return new Response(
            JSON.stringify({ error: "Internal server error." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
