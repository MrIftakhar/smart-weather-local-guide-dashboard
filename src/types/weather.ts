// src/types/weather.ts

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
  precipitation?: number;
  apparentTemperature?: number;
  localTime?: string;
  localDate?: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
}

export interface DailyForecast {
  day: string;
  dateFormatted: string;
  high: number;
  low: number;
  condition: string;
  pop: number;
  hourly: HourlyForecast[];
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
}