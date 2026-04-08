"use server";

export type ReverseGeocodeResult = {
  address: string;
  city: string;
  area: string;
  country: string;
};

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar,en`,
      {
        headers: {
          "User-Agent": "Jorina-Luxury-Cosmetics-App"
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.address ?? {};
    const city =
      address.city ?? address.town ?? address.state ?? address.governorate ?? "";
    const area =
      address.suburb ??
      address.neighbourhood ??
      address.city_district ??
      address.county ??
      "";

    return {
      address: data.display_name ?? "",
      city,
      area,
      country: address.country ?? ""
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

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.map((item: { display_name: string; lat: string; lon: string }) => ({
      label: item.display_name,
      lat: Number.parseFloat(item.lat),
      lng: Number.parseFloat(item.lon)
    }));
  } catch (error) {
    console.error("Search location error:", error);
    return [];
  }
}
