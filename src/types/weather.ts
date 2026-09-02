export interface CurrentWeather {
  city: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  airQuality: number;
  localTime?: string; // e.g. "10:45 AM"
  localDate?: string; // e.g. "Wednesday, Sep 2"
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  pop: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
}
export interface HourlyForecast {
  time: string; // e.g. "12 AM"
  temp: number;
  condition: string;
}

// Update WeatherData interface to include hourly array
export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  forecast: DailyForecast[];
}