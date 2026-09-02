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
  localTime?: string; // e.g. "10:45 AM"
  localDate?: string; // e.g. "Wednesday, Sep 2"
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
}

export interface DailyForecast {
  day: string;
  dateFormatted?: string;
  high: number;
  low: number;
  condition: string;
  hourly?: HourlyForecast[];
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
}