'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardView from '@/components/DashboardView';
import ForecastView from '@/components/ForecastView';
import LocalGuideView from '@/components/LocalGuideView';
import AssistantView from '@/components/AssistantView';
import { fetchLocationWeather } from '@/services/weatherService';
import { Search, Moon, Sun, MapPin, Calendar, LayoutDashboard, Compass, Shirt, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Page() {
  const [weather, setWeather] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('Dhaka');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const query = `${position.coords.latitude},${position.coords.longitude}`;
        setSearchTerm('Current Location');
        loadWeather(query);
      },
      () => {
        setLoading(false);
        alert('Location access was denied. Please allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`weather-app d-flex min-vh-100 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ transition: 'background 0.3s ease' }}>
      
      {/* Left Sidebar Navigation Icons */}
      {isSidebarOpen && <div className="weather-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`weather-sidebar d-flex flex-column align-items-center py-4 border-end gap-4 ${isSidebarOpen ? 'is-open' : ''} ${isDarkMode ? 'bg-black border-secondary' : 'bg-white'}`} style={{ width: '70px', minHeight: '100vh', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div className="weather-brand rounded-circle bg-dark p-1 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
          <img src="/images/logo.png" alt="Weather dashboard logo" className="img-fluid" />
        </div>
        <div className="d-flex flex-column gap-3 mt-3 text-muted">
          <button onClick={() => handleTabChange('dashboard')} className={`btn btn-link p-2 ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted'}`} title="Dashboard" aria-label="Dashboard"><LayoutDashboard size={22} /></button>
          <button onClick={() => handleTabChange('forecast')} className={`btn btn-link p-2 ${activeTab === 'forecast' ? 'text-primary' : 'text-muted'}`} title="Forecast" aria-label="Forecast"><Calendar size={22} /></button>
          <button onClick={() => handleTabChange('guide')} className={`btn btn-link p-2 ${activeTab === 'guide' ? 'text-primary' : 'text-muted'}`} title="Local Guide" aria-label="Local Guide"><Compass size={22} /></button>
          <button onClick={() => handleTabChange('assistant')} className={`btn btn-link p-2 ${activeTab === 'assistant' ? 'text-primary' : 'text-muted'}`} title="Wardrobe" aria-label="Wardrobe"><Shirt size={22} /></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="weather-content flex-grow-1 d-flex flex-column align-items-center">
        
        {/* Inner Wrapper constrained to 1440px max-width */}
        <div className="w-100 d-flex flex-column" style={{ maxWidth: '1440px' }}>

          {/* Top Header Bar */}
          <header className={`weather-header px-4 py-3 border-bottom d-flex justify-content-between align-items-center position-relative ${isDarkMode ? 'bg-black border-secondary' : 'bg-white'}`} style={{ zIndex: 1050 }}>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="weather-sidebar-toggle btn btn-outline-secondary d-flex align-items-center justify-content-center p-2 rounded-3"
              title={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
              aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            
            {/* Search Bar & Autocomplete Dropdown */}
            <div className="weather-search position-relative" style={{ width: '320px' }} ref={searchRef}>
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
            <div className="weather-controls d-flex align-items-center gap-3">
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
          <main className="weather-main p-4 flex-grow-1 w-100">
            {activeTab === 'dashboard' && <DashboardView weather={weather} unit={unit} isDarkMode={isDarkMode} />}
            {activeTab === 'forecast' && <ForecastView weather={weather} unit={unit} />}
            {activeTab === 'guide' && <LocalGuideView weather={weather} />}
            {activeTab === 'assistant' && <AssistantView weather={weather} unit={unit} />}
          </main>

        </div>

      </div>
    </div>
  );
}