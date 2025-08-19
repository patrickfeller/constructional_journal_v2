export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const results = await response.json();
    
    if (results.length === 0) {
      return null;
    }
    
    return {
      lat: results[0].lat,
      lon: results[0].lon,
      display_name: results[0].display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
