import { BaseProvider } from './base';

interface WeatherCoordinates {
  lat: number;
  lon: number;
}

interface WeatherResponse {
  location: string;
  temperature: string;
  condition: string;
  windSpeed: string;
  timestamp: string;
}

export class WeatherProvider extends BaseProvider {
  private cityCoords: Record<string, WeatherCoordinates> = {
    'berlin': { lat: 52.52, lon: 13.41 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    'london': { lat: 51.5074, lon: -0.1278 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'new york': { lat: 40.7128, lon: -74.0060 },
    'los angeles': { lat: 34.0522, lon: -118.2437 },
    'sydney': { lat: -33.8688, lon: 151.2093 },
    'moscow': { lat: 55.7558, lon: 37.6176 },
    'madrid': { lat: 40.4168, lon: -3.7038 },
    'rome': { lat: 41.9028, lon: 12.4964 },
    'amsterdam': { lat: 52.3676, lon: 4.9041 },
    'dubai': { lat: 25.2048, lon: 55.2708 },
    'miami': { lat: 25.7617, lon: -80.1918 },
    'barcelona': { lat: 41.3851, lon: 2.1734 },
    'istanbul': { lat: 41.0082, lon: 28.9784 },
    'singapore': { lat: 1.3521, lon: 103.8198 }
  };

  constructor() {
    super('https://api.open-meteo.com/v1');
  }

  async getWeather(city: string): Promise<WeatherResponse> {
    console.log('🌤️ WeatherProvider.getWeather called with city:', city);
    const coords = this.cityCoords[city.toLowerCase()];
    
    if (!coords) {
      console.log('🚫 City not found in supported cities list');
      throw new Error(
        `Weather data not available for "${city}". ` +
        `Available cities: ${Object.keys(this.cityCoords).join(', ')}`
      );
    }

    const response = await this.client.get('/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current_weather: true
      }
    });

    const weather = response.data.current_weather;
    
    return this.addTimestamp({
      location: city,
      temperature: `${weather.temperature}°C`,
      condition: this.getWeatherCondition(weather.weathercode),
      windSpeed: `${weather.windspeed} km/h`
    });
  }

  private getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      61: 'Slight rain',
      80: 'Rain showers',
      95: 'Thunderstorm'
    };
    return conditions[code] || `Unknown weather (code: ${code})`;
  }

  getSupportedCities(): string[] {
    return Object.keys(this.cityCoords);
  }
}