'use client';

import React from 'react';
import { WeatherData } from '@/types/weather';
import { Shirt, Glasses, Umbrella, Sparkles, CheckCircle2 } from 'lucide-react';

interface AssistantViewProps {
  weather: WeatherData | null;
  unit: 'C' | 'F';
}

export default function AssistantView({ weather, unit }: AssistantViewProps) {
  if (!weather) return null;

  const { current } = weather;
  const tempInC = current.apparentTemperature ?? current.temperature;
  const condition = current.condition.toLowerCase();
  const isWet = ['rain', 'shower', 'thunderstorm', 'snow'].some((weatherType) => condition.includes(weatherType)) || (current.precipitation ?? 0) > 0;
  const isWindy = current.windSpeed >= 25;
  const isHumid = current.humidity >= 75;

  const getOutfits = () => {
    const outerwear = isWet
      ? 'Water-resistant jacket or rain shell'
      : tempInC < 10
        ? 'Heavy coat with a warm scarf'
        : tempInC < 20
          ? 'Light jacket or cardigan'
          : isWindy
            ? 'Light windbreaker'
            : 'No outer layer needed';
    const layers = tempInC < 10
      ? 'Thermal base layer and knit sweater'
      : tempInC < 20
        ? 'Cotton long-sleeve shirt'
        : isHumid
          ? 'Loose, moisture-wicking shirt'
          : 'Breathable linen or cotton shirt';
    const footwear = isWet
      ? 'Waterproof shoes or boots'
      : tempInC >= 25
        ? 'Breathable sneakers or sandals'
        : 'Closed-toe walking shoes';
    const accessories = current.uvIndex >= 6
      ? 'Sunglasses, hat, and SPF protection'
      : isWindy
        ? 'Secure hat and light scarf'
        : 'Light everyday accessories';

    return {
      title: isWet
        ? 'Rain-Ready Outdoor Protection'
        : tempInC < 10
          ? 'Layered Cold Weather Protection'
          : tempInC < 20
            ? 'Comfortable Mid-Weather Layers'
            : 'Lightweight Breathable Apparel',
      outerwear,
      layers,
      footwear,
      accessories,
    };
  };

  const outfit = getOutfits();
  const temperatureLabel = unit === 'F' ? `${Math.round((tempInC * 9) / 5 + 32)}°F` : `${Math.round(tempInC)}°C`;

  const getComfortSummary = () => {
    if (isWet) return 'Rain and precipitation are driving today’s waterproof recommendations.';
    if (isWindy) return `Wind is currently ${current.windSpeed} km/h, so a secure outer layer is recommended.`;
    if (isHumid) return `Humidity is ${current.humidity}%, so breathable moisture-wicking fabrics are recommended.`;
    return 'Current conditions are comfortable for lightweight everyday clothing.';
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div>
        <span className="font-label">Style & Comfort</span>
        <h2 className="font-headline mb-0">Atmospheric Wardrobe Assistant</h2>
      </div>

      <div className="row g-4">
        {/* Main Recommendation Card */}
        <div className="col-12 col-lg-8">
          <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="btn-ae-square-accent" style={{ width: '36px', height: '36px' }}>
                  <Sparkles size={18} />
                </span>
                <span className="font-label">Today's Outfit Recommendation</span>
              </div>

              <h3 className="font-headline display-6 mb-3">
                {outfit.title}
              </h3>
              <p className="font-body text-muted mb-4">
                {getComfortSummary()} Current feels-like temperature is {temperatureLabel} with {current.condition.toLowerCase()} conditions.
              </p>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 bg-light border">
                    <span className="font-label d-block mb-1 text-muted">Outerwear</span>
                    <span className="font-body fw-bold">{outfit.outerwear}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 bg-light border">
                    <span className="font-label d-block mb-1 text-muted">Base Layers</span>
                    <span className="font-body fw-bold">{outfit.layers}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 bg-light border">
                    <span className="font-label d-block mb-1 text-muted">Footwear</span>
                    <span className="font-body fw-bold">{outfit.footwear}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 bg-light border">
                    <span className="font-label d-block mb-1 text-muted">Essential Accessories</span>
                    <span className="font-body fw-bold">{outfit.accessories}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex align-items-center gap-2 text-success font-body small">
              <CheckCircle2 size={16} />
              <span>Optimized for current outdoor comfort index</span>
            </div>
          </div>
        </div>

        {/* Essential Gear Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="bg-white p-4 rounded-4 border shadow-sm h-100 d-flex flex-column gap-3">
            <h5 className="font-headline mb-2">Essential Carry Gear</h5>

            <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
              <div className="btn-ae-icon icon-secondary">
                <Glasses size={18} />
              </div>
              <div>
                <div className="font-body fw-bold small">UV Protection</div>
                <div className="text-muted extra-small">
                  {current.uvIndex >= 6 ? 'High UV: use SPF, sunglasses, and a hat.' : `UV index is ${current.uvIndex}; basic sun protection is advised.`}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
              <div className={`btn-ae-icon ${isWet ? 'icon-danger' : 'icon-dark'}`}>
                <Umbrella size={18} />
              </div>
              <div>
                <div className="font-body fw-bold small">Compact Umbrella</div>
                <div className="text-muted extra-small">
                  {isWet ? 'Precipitation is present; keep it with you.' : 'No current precipitation; optional carry.'}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
              <div className="btn-ae-icon icon-tertiary">
                <Shirt size={18} />
              </div>
              <div>
                <div className="font-body fw-bold small">Fabric Care</div>
                <div className="text-muted extra-small">
                  {isWet ? 'Choose quick-dry layers and protect shoes from water.' : isHumid ? 'Choose breathable moisture-wicking fabrics.' : 'Choose breathable cotton and linen blends.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}