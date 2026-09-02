'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Compass,
  Shirt,
  Search,
  MapPin,
  LocateFixed,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { searchCity } from '@/lib/weather';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unit: 'C' | 'F';
  setUnit: (u: 'C' | 'F') => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  onSelectCity: (lat: number, lon: number, cityName: string) => void;
  onUseCurrentLocation: () => void;
}

interface SearchResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export default function AppLayout({
  children,
  activeTab,
  setActiveTab,
  unit,
  setUnit,
  theme,
  setTheme,
  onSelectCity,
  onUseCurrentLocation,
}: AppLayoutProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync theme with DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
    { id: 'guide', label: 'Local Guide', icon: Compass },
    { id: 'assistant', label: 'Wardrobe', icon: Shirt },
  ];

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const searchResults = await searchCity(query);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    const locationName = `${item.name}, ${item.country}`;
    onSelectCity(item.latitude, item.longitude, locationName);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="d-flex vh-100 overflow-hidden position-relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`theme-card border-end d-flex flex-column align-items-center py-4 px-2 sidebar-drawer ${
          isSidebarOpen ? 'show' : ''
        } position-lg-relative`}
        style={{ width: '80px', height: '100vh' }}
      >
        <div className="btn-ae-icon icon-dark mb-4 fw-bold">☁️</div>

        <nav className="d-flex flex-column gap-3 w-100 align-items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`btn-ae-icon ${
                  isActive ? 'icon-dark' : 'bg-transparent theme-text-muted'
                }`}
                title={item.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto w-100">
        {/* Header */}
        <header className="theme-card border-bottom px-3 px-md-4 py-3 position-relative z-3">
          <div className="d-flex align-items-center justify-content-between gap-2">
            
            {/* Drawer Toggle (Mobile) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="btn btn-outline-secondary p-2 rounded-3 d-lg-none flex-shrink-0"
              style={{ width: '38px', height: '38px' }}
            >
              {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {/* Search + GPS */}
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '360px' }}>
              <div className="position-relative flex-grow-1">
                <div className="input-search-group">
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    className="input-ae-search form-control ps-5 text-truncate"
                    placeholder="Search city..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Suggestions Dropdown */}
                {results.length > 0 && (
                  <div className="position-absolute top-100 start-0 end-0 theme-card border rounded-3 shadow-lg mt-1 overflow-hidden z-3">
                    {results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-100 text-start px-3 py-2 border-0 bg-transparent text-reset d-flex align-items-center gap-2 hover-bg-light small"
                      >
                        <MapPin size={14} className="theme-text-muted flex-shrink-0" />
                        <span className="text-truncate">
                          <strong>{item.name}</strong>
                          {item.admin1 ? `, ${item.admin1}` : ''}, <em>{item.country}</em>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS Button */}
              <button
                onClick={onUseCurrentLocation}
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center p-2 rounded-3 flex-shrink-0"
                title="Current Location"
                style={{ width: '38px', height: '38px' }}
              >
                <LocateFixed size={18} />
              </button>
            </div>

            {/* Right Controls: Theme Toggle & Unit Switcher */}
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {/* Day / Night Theme Button */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center p-2 rounded-3"
                title={`Switch to ${theme === 'light' ? 'Night' : 'Day'} mode`}
                style={{ width: '38px', height: '38px' }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-warning" />}
              </button>

              {/* Unit Switcher */}
              <div className="btn-group p-1 bg-light rounded-2">
                <button
                  onClick={() => setUnit('C')}
                  className={`btn btn-sm ${
                    unit === 'C'
                      ? 'btn-ae-primary py-1 px-2 px-sm-3'
                      : 'btn-link text-muted text-decoration-none py-1 px-2'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setUnit('F')}
                  className={`btn btn-sm ${
                    unit === 'F'
                      ? 'btn-ae-primary py-1 px-2 px-sm-3'
                      : 'btn-link text-muted text-decoration-none py-1 px-2'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Views */}
        <main className="p-3 p-md-4 container-fluid max-width-xl">{children}</main>
      </div>
    </div>
  );
}