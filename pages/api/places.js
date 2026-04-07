// pages/api/places.js — Busca negocios REALES con Google Places API
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const apiKey = process.env.GOOGLE_PLACES_KEY;
  if (!apiKey) return res.status(500).json({ error: "Google API key not configured" });

  try {
    const { query, location } = req.body;
    const searchQuery = `${query} en ${location}, Chile`;

    // Use Google Places Text Search API
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&language=es&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Google API error");
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return res.status(200).json({ results: [] });
    }

    // Transform Google Places results to our format
    const results = data.results.slice(0, 8).map(place => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address
        ? place.formatted_address
            .replace(/, Chile$/i, "")
            .replace(/, Región de .*$/i, "")
            .replace(/, Los Lagos$/i, "")
            .replace(/, Llanquihue$/i, "")
        : "Sin dirección",
      type: place.types 
        ? translateType(place.types[0]) 
        : "Negocio",
      phone: "",
      rating: place.rating || 0,
      user_ratings_total: place.user_ratings_total || 0,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      open_now: place.opening_hours?.open_now,
      place_id: place.place_id,
    }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Places error:", error);
    return res.status(500).json({ error: "Search failed" });
  }
}

function translateType(type) {
  const map = {
    restaurant: "Restaurante",
    food: "Alimentos",
    bakery: "Panadería",
    cafe: "Cafetería",
    bar: "Bar",
    meal_delivery: "Delivery",
    meal_takeaway: "Comida para llevar",
    supermarket: "Supermercado",
    grocery_or_supermarket: "Supermercado",
    store: "Tienda",
    lodging: "Hotel",
    point_of_interest: "Negocio",
    establishment: "Negocio",
    butcher: "Carnicería",
    convenience_store: "Minimarket",
  };
  return map[type] || "Negocio";
}
