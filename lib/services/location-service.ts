"use server";

/**
 * Basic reverse geocoding using Nominatim (OpenStreetMap)
 * Documentation: https://nominatim.org/release-docs/latest/api/Reverse/
 */

export type ReverseGeocodeResult = {
  address: string;
  city: string;
  area: string;
  country: string;
};

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar,en`,
      {
        headers: {
          "User-Agent": "Jorina-Luxury-Cosmetics-App"
        }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const addr = data.address || {};

    // Extract city/state/town
    const city = addr.city || addr.town || addr.state || addr.governorate || "";
    // Extract suburb/neighbourhood/area
    const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.county || "";
    
    return {
      address: data.display_name || "",
      city: city,
      area: area,
      country: addr.country || ""
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

export async function searchLocation(query: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&accept-language=ar,en`,
      {
        headers: {
          "User-Agent": "Jorina-Luxury-Cosmetics-App"
        }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item: any) => ({
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error("Search location error:", error);
    return [];
  }
}
