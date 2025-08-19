import { NextRequest, NextResponse } from "next/server";
import { getWeatherForDate } from "@/lib/weather";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const date = searchParams.get("date");

    if (!latitude || !longitude || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: latitude, longitude, date" },
        { status: 400 }
      );
    }

    const coordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const weatherData = await getWeatherForDate(coordinates, date);

    if (!weatherData) {
      return NextResponse.json(
        { error: "Weather data not available for the specified date and location" },
        { status: 404 }
      );
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
