export async function getWeatherData(lat: number, lon: number, cityName: string) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code,uv_index&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    return 'Thunderstorm';
  };

  const tz = data.timezone || 'UTC';
  const now = new Date();
  
  const localTime = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
  const localDate = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });

  const dailyForecasts = data.daily.time.slice(0, 7).map((dateStr: string, dayIndex: number) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const startHour = dayIndex * 24;
    const hourlyPoints = [];
    for (let h = 0; h < 24; h++) {
      const globalIdx = startHour + h;
      if (data.hourly.time[globalIdx]) {
        const hourDate = new Date(data.hourly.time[globalIdx]);
        hourlyPoints.push({
          time: hourDate.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', hour12: true }),
          temp: Math.round(data.hourly.temperature_2m[globalIdx]),
          condition: getWeatherCondition(data.hourly.weather_code[globalIdx]),
        });
      }
    }

    return {
      day: dayIndex === 0 ? 'Today' : dayName,
      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: Math.round(data.daily.temperature_2m_max[dayIndex]),
      low: Math.round(data.daily.temperature_2m_min[dayIndex]),
      condition: getWeatherCondition(data.daily.weather_code[dayIndex]),
      pop: data.daily.precipitation_probability_max[dayIndex] ?? 0,
      hourly: hourlyPoints,
    };
  });

  return {
    current: {
      city: cityName,
      temperature: Math.round(data.current.temperature_2m),
      condition: getWeatherCondition(data.current.weather_code),
      high: dailyForecasts[0].high,
      low: dailyForecasts[0].low,
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      uvIndex: Math.round(data.current.uv_index || 4),
      airQuality: 45,
      localTime,
      localDate,
    },
    forecast: dailyForecasts,
  };
}

export async function searchCity(query: string) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching city:', error);
    return [];
  }
}