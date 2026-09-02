'use client';

import React from 'react';
import { WeatherData } from '@/types/weather';
import { CloudRain, Sun, CloudSun, Compass } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ForecastViewProps {
  weather: WeatherData | null;
  unit: 'C' | 'F';
}

export default function ForecastView({ weather, unit }: ForecastViewProps) {
  if (!weather) return null;

  const { forecast } = weather;

  // Temperature conversion helper
  const convertTemp = (celsius: number) => {
    return unit === 'F' ? Math.round((celsius * 9) / 5 + 32) : celsius;
  };

  // Format data specifically for Recharts AreaChart
  const chartData = forecast.map((item) => ({
    day: item.day,
    High: convertTemp(item.high),
    Low: convertTemp(item.low),
  }));

  return (
    <div className="d-flex flex-column gap-4">
      {/* View Header */}
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span className="font-label">Atmospheric Outlook</span>
          <h2 className="font-headline mb-0">5-Day Temperature & Rain Forecast</h2>
        </div>
        <span className="badge bg-white text-dark border px-3 py-2 rounded-pill font-body shadow-sm">
          Updated Live
        </span>
      </div>

      {/* Temperature Trend Area Chart */}
      <div className="bg-white p-4 rounded-4 border shadow-sm">
        <h5 className="font-headline mb-4">Temperature Trend (°{unit})</h5>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="highColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lowColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4D6B8C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4D6B8C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1C1E',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                }}
              />
              <Area type="monotone" dataKey="High" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#highColor)" />
              <Area type="monotone" dataKey="Low" stroke="#4D6B8C" strokeWidth={3} fillOpacity={1} fill="url(#lowColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Breakdown Cards */}
      <div className="row g-3">
        {forecast.map((item, idx) => (
          <div key={idx} className="col-12 col-md-6 col-lg">
            <div className="bg-white p-3 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold font-headline">{item.day}</span>
                {item.pop > 30 ? (
                  <CloudRain size={20} className="text-secondary" />
                ) : (
                  <CloudSun size={20} className="text-warning" />
                )}
              </div>

              <div className="my-2">
                <div className="fs-4 font-headline fw-bold">
                  {convertTemp(item.high)}° <span className="fs-6 font-body text-muted fw-normal">/ {convertTemp(item.low)}°</span>
                </div>
                <span className="small text-muted font-body">{item.condition}</span>
              </div>

              {/* Rain Chance Bar */}
              <div className="mt-2">
                <div className="d-flex justify-content-between extra-small text-muted font-body mb-1">
                  <span>Rain Chance</span>
                  <span>{item.pop}%</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-secondary"
                    role="progressbar"
                    style={{ width: `${item.pop}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}