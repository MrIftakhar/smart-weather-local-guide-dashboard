'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '@/types/weather';
import { Sun, Wind, Droplets, ShieldAlert, Clock, Calendar, CloudRain, MapPin, Loader2 } from 'lucide-react';

interface DashboardViewProps {
  unit: 'C' | 'F';
  isDarkMode?: boolean;
  weather?: WeatherData | null; // <-- Ensure this is present
  onLocationResolved?: (lat: number, lon: number, locationName: string) => void;
}

export default function DashboardView({ unit, isDarkMode = false, weather: parentWeather, onLocationResolved }: DashboardViewProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherData | null>(parentWeather || null);
  const [isLoading, setIsLoading] = useState(!parentWeather);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    try {
      setIsLoading(true);

      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`, {
        headers: { 'Accept-Language': 'en' }
      });
      const geoData = await geoRes.json();
      
      const address = geoData.address || {};
      const thana = address.suburb || address.neighbourhood || address.city_district || address.town || address.village || '';
      const city = address.city || address.county || address.state_district || '';
      const country = address.country || '';
      
      const locationParts = [thana, city, country].filter((val, index, self) => val && self.indexOf(val) === index);
      const formattedLocationName = locationParts.length > 0 ? locationParts.join(', ') : 'Current Location';

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,weather_code&timezone=auto`
      );
      const weatherJson = await weatherRes.json();

      const getWeatherCondition = (code: number) => {
        if (code === 0) return 'Sunny';
        if ([1, 2, 3].includes(code)) return 'Partly Cloudy';
        if ([45, 48].includes(code)) return 'Foggy';
        if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rain Showers';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy';
        if ([95, 96, 99].includes(code)) return 'Thunderstorm';
        return 'Clear Sky';
      };

      const currentCondition = getWeatherCondition(weatherJson.current.weather_code);
      const now = new Date();

      const parsedWeatherData: WeatherData = {
        current: {
          city: formattedLocationName,
          temperature: Math.round(weatherJson.current.temperature_2m),
          high: Math.round(weatherJson.daily.temperature_2m_max[0]),
          low: Math.round(weatherJson.daily.temperature_2m_min[0]),
          condition: currentCondition,
          humidity: weatherJson.current.relative_humidity_2m,
          windSpeed: Math.round(weatherJson.current.wind_speed_10m),
          uvIndex: 4,
          airQuality: 35,
          localDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          localTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        },
        forecast: weatherJson.daily.time.map((dateStr: string, idx: number) => {
          const d = new Date(dateStr);
          return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            high: Math.round(weatherJson.daily.temperature_2m_max[idx]),
            low: Math.round(weatherJson.daily.temperature_2m_min[idx]),
            condition: getWeatherCondition(weatherJson.daily.weather_code[idx]),
            hourly: Array.from({ length: 24 }).map((_, hIdx) => ({
              time: `${hIdx.toString().padStart(2, '0')}:00`,
              temp: Math.round(weatherJson.daily.temperature_2m_max[idx] - (hIdx % 3)),
              condition: getWeatherCondition(weatherJson.daily.weather_code[idx])
            }))
          };
        })
      };

      setWeather(parsedWeatherData);
      setIsLoading(false);

      if (onLocationResolved) {
        onLocationResolved(lat, lon, formattedLocationName);
      }
    } catch (err) {
      console.error('Failed to load weather/location details:', err);
      setLocationError('Could not fetch exact location weather.');
      setIsLoading(false);
    }
  }, [onLocationResolved]);

  useEffect(() => {
    if (parentWeather) {
      setWeather(parentWeather);
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.warn('Geolocation access denied:', error.message);
        fetchWeatherByCoords(23.8103, 90.4125);
        setLocationError('Location permission denied. Displaying default area weather.');
      },
      { timeout: 10000, maximumAge: 0 }
    );
  }, [parentWeather, fetchWeatherByCoords]);

  if (isLoading || !weather || !weather.forecast) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 rounded-4 shadow-sm w-100" style={{ minHeight: '350px', backgroundColor: isDarkMode ? '#171717' : '#ffffff', color: isDarkMode ? '#fff' : '#000' }}>
        <Loader2 className="animate-spin text-primary mb-3" size={40} />
        <p className="font-body fw-medium mb-1">Detecting your exact Thana, City, and Country...</p>
        <p className="font-body small text-muted mb-0">Please permit location access if prompted.</p>
      </div>
    );
  }

  const { current, forecast } = weather;
  const activeDayData = forecast[selectedDayIndex] || forecast[0];

  const displayTemp = (celsius: number) => {
    return unit === 'F' ? `${Math.round((celsius * 9) / 5 + 32)}°F` : `${celsius}°C`;
  };

  const conditionLower = current.condition.toLowerCase();
  const isRaining = conditionLower.includes('rain') || conditionLower.includes('shower') || conditionLower.includes('thunderstorm');
  const isCloudy = conditionLower.includes('cloud') || conditionLower.includes('overcast') || conditionLower.includes('mist') || conditionLower.includes('fog');

  const cardStyle = {
    backgroundColor: isDarkMode ? '#171717' : '#ffffff',
    borderColor: isDarkMode ? '#262626 !important' : '#dee2e6',
    color: isDarkMode ? '#ffffff' : '#212529',
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  };

  return (
    <div className="d-flex flex-column gap-4 w-100">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 1. Hero Weather Card */}
      <div
        className="hero-weather-card position-relative overflow-hidden p-4 p-md-5 rounded-4 d-flex flex-column justify-content-between shadow-sm"
        style={{ 
          minHeight: '260px',
          background: isRaining 
            ? 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' 
            : isCloudy 
            ? 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)' 
            : 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
          color: '#fff',
          transition: 'background 0.8s ease-in-out'
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          {isRaining ? (
            <div className="w-100 h-100 position-relative">
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className="realistic-raindrop"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 50}px`,
                    animationDuration: `${0.4 + Math.random() * 0.4}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.3 + Math.random() * 0.5,
                  }}
                />
              ))}
            </div>
          ) : isCloudy ? (
            <div className="w-100 h-100 position-relative opacity-50">
              <div className="realistic-cloud cloud-alpha" />
              <div className="realistic-cloud cloud-beta" />
              <div className="realistic-cloud cloud-gamma" />
            </div>
          ) : (
            <div className="w-100 h-100 position-relative">
              <div className="sun-core" />
              <div className="sun-ray-ring" />
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-start position-relative z-1">
          <div>
            <span className="font-label text-white-50 d-flex align-items-center gap-1 mb-1">
              <MapPin size={13} /> CURRENT LOCATION WEATHER
            </span>
            <h2 className="font-headline display-6 mb-0 fw-bold text-break" style={{ maxWidth: '700px' }}>
              {current.city}
            </h2>
            
            <div className="d-flex align-items-center gap-3 mt-2 font-body small text-white-50">
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} />
                {current.localDate}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <Clock size={14} />
                {current.localTime}
              </span>
            </div>
          </div>

          <span className="badge bg-white bg-opacity-25 backdrop-blur px-3 py-2 rounded-pill font-body text-white">
            {current.condition}
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-end position-relative z-1 mt-4">
          <div>
            <h1 className="display-1 fw-bold mb-0 font-headline">{displayTemp(current.temperature)}</h1>
            <p className="mb-0 font-body text-white-50">
              H: {displayTemp(current.high)} &nbsp;|&nbsp; L: {displayTemp(current.low)}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .realistic-raindrop {
          position: absolute;
          width: 1.5px;
          height: 25px;
          background: linear-gradient(transparent, rgba(255, 255, 255, 0.8));
          transform: rotate(-10deg);
          animation: realisticFall linear infinite;
        }
        @keyframes realisticFall {
          0% { transform: translate(0, -40px) rotate(-10deg); }
          100% { transform: translate(-30px, 320px) rotate(-10deg); }
        }

        .realistic-cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(2px);
          border-radius: 100px;
          animation: cloudDrift linear infinite;
        }
        .cloud-alpha { width: 160px; height: 45px; top: 15px; left: -160px; animation-duration: 25s; }
        .cloud-beta { width: 220px; height: 60px; top: 70px; left: -220px; animation-duration: 38s; animation-delay: 4s; opacity: 0.15; }
        .cloud-gamma { width: 130px; height: 35px; top: 40px; left: -130px; animation-duration: 18s; animation-delay: 9s; }
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(700px); }
        }

        .sun-core {
          position: absolute;
          top: -60px; right: -60px; width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,204,0,0.5) 50%, rgba(255,255,255,0) 75%);
          border-radius: 50%;
          animation: sunPulse 6s ease-in-out infinite alternate;
        }
        .sun-ray-ring {
          position: absolute;
          top: -90px; right: -90px; width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          animation: sunRotateScale 10s linear infinite;
        }
        @keyframes sunPulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes sunRotateScale {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>

      {/* 2. Metric Gauges Grid */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 p-lg-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between position-relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 position-relative z-1">
              <span className="font-label text-white-50">UV Index</span>
              <Sun size={18} className="text-white" />
            </div>
            <div className="position-relative z-1">
              <div className="h3 font-headline fw-bold mb-1">
                {current.uvIndex} <span className="fs-6 font-body fw-normal text-white-50">Moderate</span>
              </div>
              <div className="progress mt-3 bg-white bg-opacity-25" style={{ height: '6px' }}>
                <div className="progress-bar bg-white" role="progressbar" style={{ width: `${(current.uvIndex / 12) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 p-lg-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between position-relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 position-relative z-1">
              <span className="font-label text-white-50">Air Quality</span>
              <ShieldAlert size={18} className="text-white" />
            </div>
            <div className="position-relative z-1">
              <div className="h3 font-headline fw-bold mb-1">
                {current.airQuality} <span className="fs-6 font-body fw-normal text-white-50">Good</span>
              </div>
              <div className="progress mt-3 bg-white bg-opacity-25" style={{ height: '6px' }}>
                <div className="progress-bar bg-white" role="progressbar" style={{ width: `${current.airQuality}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 p-lg-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between position-relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #2c5364 0%, #203a43 50%, #0f2027 100%)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 position-relative z-1">
              <span className="font-label text-white-50">Humidity</span>
              <Droplets size={18} className="text-white" />
            </div>
            <div className="position-relative z-1">
              <div className="h3 font-headline fw-bold mb-1">{current.humidity}%</div>
              <div className="progress mt-3 bg-white bg-opacity-25" style={{ height: '6px' }}>
                <div className="progress-bar bg-white" role="progressbar" style={{ width: `${current.humidity}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 p-lg-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between position-relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #4ca1af 0%, #2c3e50 100%)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 position-relative z-1">
              <span className="font-label text-white-50">Wind Speed</span>
              <Wind size={18} className="text-white" />
            </div>
            <div className="position-relative z-1">
              <div className="h3 font-headline fw-bold mb-1">
                {current.windSpeed} <span className="fs-6 font-body fw-normal text-white-50">km/h</span>
              </div>
              <span className="small text-white-50 font-body">Northwest</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 7-Day Forecast Overview */}
      <div className="p-4 rounded-4 border shadow-sm w-100" style={cardStyle}>
        <h5 className="font-headline mb-3">7-Day Forecast Overview</h5>
        <div className="d-flex flex-row gap-3 overflow-x-auto pb-2 w-100 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
          {forecast.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3 rounded-4 border shadow-sm flex-shrink-0 text-center transition-all ${isSelected ? 'border-primary ring-2' : ''}`}
                style={{ 
                  flex: '1 0 calc(14.28% - 12px)', 
                  minWidth: '130px', 
                  cursor: 'pointer',
                  scrollSnapAlign: 'start',
                  backgroundColor: isSelected ? (isDarkMode ? '#222' : '#f8f9fa') : (isDarkMode ? '#141414' : '#ffffff'),
                  borderColor: isSelected ? '#0d6efd' : (isDarkMode ? '#262626' : '#dee2e6')
                }}
              >
                <span className="font-label text-muted d-block">{day.day}</span>
                <span className="small text-muted d-block" style={{ fontSize: '11px' }}>{day.dateFormatted}</span>
                <div className="my-2 text-primary">
                  {day.condition.includes('Rain') ? <CloudRain size={22} className="text-info" /> : <Sun size={22} className="text-warning" />}
                </div>
                <div className="fw-bold font-headline">{displayTemp(day.high)}</div>
                <div className="text-muted small font-body">{displayTemp(day.low)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 24-Hour Overview */}
      <div className="p-4 rounded-4 border shadow-sm w-100" style={cardStyle}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="font-headline mb-0">24-Hour Overview ({activeDayData.day} - {activeDayData.dateFormatted})</h5>
        </div>
        <div className="d-flex flex-row gap-4 overflow-x-auto pb-2 w-100 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
          {activeDayData.hourly?.map((hr, idx) => (
            <div key={idx} className="d-flex flex-column align-items-center flex-shrink-0 text-center" style={{ minWidth: '75px', scrollSnapAlign: 'start' }}>
              <span className="font-label text-muted mb-2">{hr.time}</span>
              <div className="my-1">
                {hr.condition.includes('Rain') ? <CloudRain size={20} className="text-info" /> : <Sun size={20} className="text-warning" />}
              </div>
              <span className="font-headline fw-bold mt-2">{displayTemp(hr.temp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}