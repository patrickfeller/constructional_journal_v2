# Weather Feature for Construction Journal

## Overview
The construction journal application now includes automatic weather detection for journal entries. When creating a journal entry, the system automatically fetches weather data for the project location and date.

## Features Added

### 1. Enhanced Project Management
- **Coordinates Support**: Projects now support latitude and longitude coordinates
- **Automatic Geocoding**: "Get Coordinates" button automatically converts addresses to coordinates using OpenStreetMap Nominatim API
- **Coordinate Display**: Project list shows coordinates when available

### 2. Weather Integration
- **Automatic Weather Fetching**: When selecting a project and date in the journal form, weather data is automatically fetched
- **Weather Display**: Shows weather icon, description, and temperature
- **Weather Storage**: Weather data is stored with each journal entry
- **Historical Weather**: Uses OpenMeteo API to fetch weather data for any date

### 3. User Experience Improvements
- **Real-time Weather**: Weather information updates automatically when changing project or date
- **Visual Indicators**: Weather icons and descriptions make it easy to understand conditions
- **Responsive Design**: Weather information is displayed in a clean, organized layout

## Technical Implementation

### Database Changes
- Added `latitude` and `longitude` fields to the `Project` model
- Weather data is stored as JSON in the `JournalEntry` model

### API Endpoints
- `/api/weather` - Fetches weather data for specific coordinates and date
- Uses OpenMeteo API for historical weather data

### Weather Data Structure
```typescript
interface WeatherData {
  temperature: number;      // Temperature in Celsius
  description: string;      // Human-readable weather description
  icon: string;            // Weather emoji icon
  date: string;            // Date of weather data
}
```

### Supported Weather Conditions
- Clear sky, cloudy, overcast
- Rain (light, moderate, heavy)
- Snow (light, moderate, heavy)
- Fog, drizzle, thunderstorms
- And many more with appropriate icons

## Usage Instructions

### Setting Up Project Coordinates
1. **Automatic Geocoding**: 
   - Enter a full address (street, city, country) in the address field
   - Coordinates are automatically geocoded when the project is created or updated
   - No manual coordinate entry needed

### Creating Journal Entries with Weather
1. Select a project (must have coordinates)
2. Choose a date
3. Weather data will automatically appear below the form
4. Weather information is automatically saved with the entry

### Viewing Weather in Journal
- Weather information is displayed in the journal entry header
- Shows temperature and weather icon
- Weather data is preserved when editing entries

## Dependencies
- `openmeteo` package for weather API integration
- OpenStreetMap Nominatim for geocoding
- OpenMeteo API for weather data

## API Limits and Considerations
- OpenMeteo API: Free tier with generous limits
- Nominatim API: Free with rate limiting (1 request per second recommended)
- Weather data is fetched on-demand and cached in the database

## Future Enhancements
- Weather forecast for upcoming dates
- Weather alerts and notifications
- Weather impact on construction activities
- Weather data export and reporting
