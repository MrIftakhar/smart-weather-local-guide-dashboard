// src/services/weatherService.ts

export async function fetchLocationWeather(query: string) {
  let latitude: number, longitude: number, name: string, country: string;

  // Check if query is passed as coordinates (e.g. "23.81,90.41")
  if (query.includes(',')) {
    const parts = query.split(',');
    if (!isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      latitude = Number(parts[0]);
      longitude = Number(parts[1]);
      name = "Current Location";
      country = "";
    }
  }

  // If not coordinates, perform name geocoding search
  if (!latitude || !longitude) {
    const cleanQuery = query.split(',')[0].trim();
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('Location not found');
    }

    const loc = geoData.results[0];
    latitude = loc.latitude;
    longitude = loc.longitude;
    name = loc.name;
    country = loc.country || '';
  }

  // Fetch forecast data using the resolved coordinates
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto`
  );
  const weatherData = await weatherRes.json();

  const getWeatherCondition = (code: number) => {
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 95) return 'Thunderstorm';
    if (code >= 1 && code <= 3) return 'Cloudy';
    return 'Sunny';
  };

  const currentCondition = getWeatherCondition(weatherData.current.weather_code);

  const forecast = weatherData.daily.time.map((dateStr: string, idx: number) => {
    const dateObj = new Date(dateStr);
    return {
      day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: Math.round(weatherData.daily.temperature_2m_max[idx]),
      low: Math.round(weatherData.daily.temperature_2m_min[idx]),
      condition: getWeatherCondition(weatherData.daily.weather_code[idx]),
      hourly: weatherData.hourly.time.slice(idx * 24, (idx + 1) * 24).map((timeStr: string, hIdx: number) => ({
        time: new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(weatherData.hourly.temperature_2m[idx * 24 + hIdx]),
        condition: getWeatherCondition(weatherData.hourly.weather_code[idx * 24 + hIdx])
      }))
    };
  });

  return {
    current: {
      city: `${name}${country ? `, ${country}` : ''}`,
      temperature: Math.round(weatherData.current.temperature_2m),
      high: Math.round(weatherData.daily.temperature_2m_max[0]),
      low: Math.round(weatherData.daily.temperature_2m_min[0]),
      condition: currentCondition,
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: Math.round(weatherData.current.wind_speed_10m),
      uvIndex: 4,
      airQuality: 35,
      localDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    forecast
  };
}