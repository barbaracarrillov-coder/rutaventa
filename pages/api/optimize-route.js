// pages/api/optimize-route.js — Optimiza el orden de paradas usando Google Directions API
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GOOGLE_PLACES_KEY;
  if (!apiKey) return res.status(500).json({ error: "Google API key not configured" });

  try {
    const { addresses } = req.body;

    if (!addresses || addresses.length < 2) {
      return res.status(400).json({ error: "Need at least 2 addresses" });
    }

    const origin = encodeURIComponent(addresses[0]);
    const destination = encodeURIComponent(addresses[addresses.length - 1]);
    const waypoints = addresses.length > 2
      ? addresses.slice(1, -1).map(a => encodeURIComponent(a)).join("|")
      : "";

    // optimize:true tells Google to reorder waypoints for shortest route
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypoints ? `&waypoints=optimize:true|${waypoints}` : ""}&mode=driving&language=es&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Google Directions API error");

    const data = await response.json();

    if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
      return res.status(200).json({ optimized: false, error: data.status });
    }

    const route = data.routes[0];
    const optimizedOrder = route.waypoint_order || [];

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    const legs = route.legs.map(leg => {
      totalDistance += leg.distance.value;
      totalDuration += leg.duration.value;
      return {
        start: leg.start_address,
        end: leg.end_address,
        distance: leg.distance.text,
        duration: leg.duration.text,
      };
    });

    return res.status(200).json({
      optimized: true,
      waypoint_order: optimizedOrder,
      total_distance: (totalDistance / 1000).toFixed(1) + " km",
      total_duration: Math.round(totalDuration / 60) + " min",
      legs,
    });
  } catch (error) {
    console.error("Optimize error:", error);
    return res.status(500).json({ error: "Optimization failed" });
  }
}
