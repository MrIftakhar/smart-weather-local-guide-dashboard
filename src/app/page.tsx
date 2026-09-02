'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardView from '@/components/DashboardView';
import { fetchLocationWeather } from '@/services/weatherService';
import { Search, Moon, Sun, MapPin, Calendar, LayoutDashboard, Compass, Shirt, Loader2 } from 'lucide-react';

export default function Page() {
  const [weather, setWeather] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('Dhaka');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch live autocomplete suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=5&format=json`);
        const data = await res.json();
        if (data.results) {
          setSuggestions(data.results);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (err) {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce search request
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadWeather = async (query: string, saveToStorage = true) => {
    try {
      setLoading(true);
      const data = await fetchLocationWeather(query);
      setWeather(data);
      if (saveToStorage) {
        localStorage.setItem('lastWeatherQuery', query);
      }
    } catch (err) {
      alert('Location not found.');
    } finally {
      setLoading(false);
    }
  };

  // On initial mount, check localStorage for a saved location query
  useEffect(() => {
    const savedQuery = localStorage.getItem('lastWeatherQuery');
    if (savedQuery) {
      setSearchTerm(savedQuery);
      loadWeather(savedQuery, false);
    } else {
      loadWeather('Dhaka', false);
    }
  }, []);

  const handleSelectCity = (city: any) => {
    const query = `${city.name}, ${city.country || ''}`;
    setSearchTerm(query);
    setShowDropdown(false);
    loadWeather(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      loadWeather(searchTerm);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const query = `${latitude},${longitude}`;
            const data = await fetchLocationWeather(query);
            setWeather(data);
            if (data?.current?.city) {
              setSearchTerm(data.current.city);
            }
            localStorage.setItem('lastWeatherQuery', query);
          } catch (err) {
            alert('Unable to fetch precise location weather.');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setLoading(false);
          alert('Geolocation permission denied.');
        }
      );
    }
  };

  return (
    <div className={`d-flex min-vh-100 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ transition: 'background 0.3s ease' }}>
      
      {/* Left Sidebar Navigation Icons */}
      <aside className={`d-flex flex-column align-items-center py-4 border-end gap-4 ${isDarkMode ? 'bg-black border-secondary' : 'bg-white'}`} style={{ width: '70px', minHeight: '100vh', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div className="rounded-circle bg-dark text-white p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
          <MapPin size={20} />
        </div>
        <div className="d-flex flex-column gap-3 mt-3 text-muted">
          <button className="btn btn-link text-primary p-2"><LayoutDashboard size={22} /></button>
          <button className="btn btn-link text-muted p-2"><Calendar size={22} /></button>
          <button className="btn btn-link text-muted p-2"><Compass size={22} /></button>
          <button className="btn btn-link text-muted p-2"><Shirt size={22} /></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column align-items-center">
        
        {/* Inner Wrapper constrained to 1440px max-width */}
        <div className="w-100 d-flex flex-column" style={{ maxWidth: '1440px' }}>

          {/* Top Header Bar */}
          <header className={`px-4 py-3 border-bottom d-flex justify-content-between align-items-center position-relative ${isDarkMode ? 'bg-black border-secondary' : 'bg-white'}`} style={{ zIndex: 1050 }}>
            
            {/* Search Bar & Autocomplete Dropdown */}
            <div className="position-relative" style={{ width: '320px' }} ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="d-flex align-items-center gap-2">
                <div className="input-group rounded-pill overflow-hidden border shadow-sm bg-light w-100">
                  <span className="input-group-text bg-transparent border-0 ps-3">
                    {loading ? (
                      <Loader2 size={16} className="text-primary animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Search size={16} className="text-muted" />
                    )}
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 bg-transparent shadow-none small"
                    placeholder="Search city (e.g. Dinajpur)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                  />
                </div>
                <button 
                  type="button"
                  className="btn btn-light border rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center"
                  onClick={handleCurrentLocation}
                  title="Use current location"
                  style={{ width: '38px', height: '38px', flexShrink: 0 }}
                >
                  {loading ? (
                    <Loader2 size={16} className="text-primary animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <MapPin size={16} className="text-muted" />
                  )}
                </button>
              </form>

              {/* Autocomplete Dropdown List */}
              {showDropdown && suggestions.length > 0 && (
                <ul className={`position-absolute w-100 mt-2 shadow-lg rounded-4 overflow-hidden border list-unstyled p-1 ${isDarkMode ? 'bg-dark border-secondary text-white' : 'bg-white text-dark'}`} style={{ top: '100%', left: 0, zIndex: 1100 }}>
                  {suggestions.map((city) => (
                    <li 
                      key={city.id}
                      className={`px-3 py-2 rounded-3 d-flex justify-content-between align-items-center ${isDarkMode ? 'hover-bg-secondary' : 'hover-bg-light'}`}
                      style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => handleSelectCity(city)}
                    >
                      <span className="fw-medium">{city.name}</span>
                      <small className="text-muted">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right Controls: Night-to-Day Mode & Unit Toggle */}
            <div className="d-flex align-items-center gap-3">
              {/* Night / Day Mode Toggle */}
              <button 
                className={`btn btn-sm rounded-circle p-2 border shadow-sm ${isDarkMode ? 'btn-dark text-warning' : 'btn-light text-dark'}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Night/Day Theme"
                style={{ width: '38px', height: '38px' }}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Celsius / Fahrenheit Toggle Control */}
              <div className="btn-group border rounded-pill p-1 shadow-sm bg-light" role="group">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-bold ${unit === 'C' ? 'btn-dark text-white' : 'btn-light text-muted border-0'}`}
                  onClick={() => setUnit('C')}
                >
                  °C
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-bold ${unit === 'F' ? 'btn-dark text-white' : 'btn-light text-muted border-0'}`}
                  onClick={() => setUnit('F')}
                >
                  °F
                </button>
              </div>
            </div>

          </header>

          {/* Dashboard View Component Container */}
          <main className="p-4 flex-grow-1 w-100">
            <DashboardView weather={weather} unit={unit} isDarkMode={isDarkMode} />
          </main>

        </div>

      </div>
    </div>
  );
}