// pages/api/optimize-route.js — Optimiza el orden de paradas
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.GOOGLE_PLACES_KEY;
  if (!apiKey) return res.status(500).json({ error: "Google API key not configured" });

  try {
    const { addresses } = req.body;
    if (!addresses || addresses.length < 3) return res.status(400).json({ error: "Need at least 3 addresses" });

    const origin = encodeURIComponent(addresses[0]);
    const destination = encodeURIComponent(addresses[addresses.length - 1]);
    const waypoints = "optimize:true|" + addresses.slice(1, -1).map(a => encodeURIComponent(a)).join("|");

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&mode=driving&language=es&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Google Directions API error");
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return res.status(200).json({ optimized: false, error: "No route found" });
    }

    const route = data.routes[0];
    const waypointOrder = route.waypoint_order || [];

    let totalDistance = 0;
    let totalDuration = 0;
    route.legs.forEach(leg => {
      totalDistance += leg.distance.value;
      totalDuration += leg.duration.value;
    });

    return res.status(200).json({
      optimized: true,
      waypoint_order: waypointOrder,
      total_distance: totalDistance < 1000 ? `${totalDistance}m` : `${(totalDistance / 1000).toFixed(1)}km`,
      total_duration: totalDuration < 3600 ? `${Math.round(totalDuration / 60)}min` : `${Math.floor(totalDuration / 3600)}h${Math.round((totalDuration % 3600) / 60)}m`,
    });
  } catch (error) {
    console.error("Route optimization error:", error);
    return res.status(500).json({ optimized: false, error: "Failed" });
  }
}
