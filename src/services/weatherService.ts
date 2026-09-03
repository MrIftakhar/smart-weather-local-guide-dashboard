// src/services/weatherService.ts

export async function fetchLocationWeather(query: string) {
  // Initialize variables safely to satisfy TypeScript assignment checks
  let latitude: number | null = null;
  let longitude: number | null = null;
  let name: string = 'Current Location';
  let country: string = '';

  // Check if query is passed as coordinates (e.g. "23.81,90.41")
  const coordinateMatch = query.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordinateMatch) {
    const parsedLatitude = Number(coordinateMatch[1]);
    const parsedLongitude = Number(coordinateMatch[2]);
    if (parsedLatitude >= -90 && parsedLatitude <= 90 && parsedLongitude >= -180 && parsedLongitude <= 180) {
      latitude = parsedLatitude;
      longitude = parsedLongitude;
      name = "Current Location";
      country = "";
    }
  }

  // If not coordinates or coordinates were invalid, perform name geocoding search
  if (latitude === null || longitude === null) {
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
  } else {
    // Resolve the coordinate label separately; forecast data still uses the exact coordinates.
    try {
      const reverseRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const reverseData = await reverseRes.json();
      const address = reverseData.address || {};
      const subarea = address.suburb || address.neighbourhood || address.city_district || address.town || address.village || '';
      const city = address.city || address.municipality || address.county || address.state_district || '';
      const locationParts = [subarea, city, address.country || country].filter(
        (value, index, parts) => value && parts.indexOf(value) === index
      );

      if (locationParts.length > 0) {
        name = locationParts.slice(0, -1).join(', ') || name;
        country = locationParts[locationParts.length - 1] || country;
      }
    } catch {
      // Weather remains available if reverse geocoding is unavailable.
    }
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