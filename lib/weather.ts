import { fetchWeatherApi } from 'openmeteo';

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  date: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Weather condition mapping - expanded to cover more codes
const weatherConditions: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌦️" },
  56: { description: "Light freezing drizzle", icon: "🌨️" },
  57: { description: "Dense freezing drizzle", icon: "🌨️" },
  61: { description: "Slight rain", icon: "🌧️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌨️" },
  67: { description: "Heavy freezing rain", icon: "🌨️" },
  71: { description: "Slight snow", icon: "❄️" },
  73: { description: "Moderate snow", icon: "❄️" },
  75: { description: "Heavy snow", icon: "❄️" },
  77: { description: "Snow grains", icon: "❄️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌦️" },
  82: { description: "Violent rain showers", icon: "🌦️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "🌨️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
};

export async function getWeatherForDate(
  coordinates: Coordinates,
  date: string
): Promise<WeatherData | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    
    let url: string;
    let params: any;
    
    if (isToday) {
      // Use current weather API for today
      url = "https://api.open-meteo.com/v1/forecast";
      params = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        hourly: ["temperature_2m", "weather_code"],
        timezone: "auto",
      };
    } else {
      // Use archive API for past dates
      url = "https://archive-api.open-meteo.com/v1/archive";
      params = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        start_date: date,
        end_date: date,
        hourly: ["temperature_2m", "weather_code"],
        timezone: "auto",
      };
    }

    const responses = await fetchWeatherApi(url, params);

    if (responses.length === 0) {
      return null;
    }

    const response = responses[0];
    const hourly = response.hourly()!;

    // Get the average temperature and most common weather condition for the day
    const temperatures = hourly.variables(0)?.valuesArray();
    const weatherCodes = hourly.variables(1)?.valuesArray();

    if (!temperatures || !weatherCodes || temperatures.length === 0 || weatherCodes.length === 0) {
      return null;
    }

    // Calculate maximum temperature (more representative for daily weather)
    const maxTemperature = Math.max(...temperatures);

    // Get most common weather condition
    const weatherCodeCounts: Record<number, number> = {};
    weatherCodes.forEach(code => {
      weatherCodeCounts[code] = (weatherCodeCounts[code] || 0) + 1;
    });

    const mostCommonCode = Object.entries(weatherCodeCounts)
      .sort(([, a], [, b]) => b - a)[0][0];

    const weatherCondition = weatherConditions[parseInt(mostCommonCode)] || 
      { description: "Unknown", icon: "❓" };

    return {
      temperature: Math.round(maxTemperature),
      description: weatherCondition.description,
      icon: weatherCondition.icon,
      date,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Function to get current weather (for today)
export async function getCurrentWeather(
  coordinates: Coordinates
): Promise<WeatherData | null> {
  const today = new Date().toISOString().split('T')[0];
  return getWeatherForDate(coordinates, today);
}
