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

  const tempInC = weather.current.temperature;
  const isRainy = weather.current.condition.toLowerCase().includes('rain') || weather.current.humidity > 75;

  // Dynamic wardrobe suggestions logic
  const getOutfits = () => {
    if (tempInC < 10) {
      return {
        outerwear: 'Heavy Wool Coat & Scarf',
        layers: 'Thermal Knit Sweater',
        footwear: 'Waterproof Boots',
        accessories: 'Beanie & Gloves',
      };
    } else if (tempInC < 20) {
      return {
        outerwear: 'Light Trench Coat or Denim Jacket',
        layers: 'Cotton Long-Sleeve Shirt',
        footwear: 'Leather Sneakers',
        accessories: 'Sunglasses & Light Scarf',
      };
    } else {
      return {
        outerwear: 'None Required',
        layers: 'Breathable Linen Shirt & Shorts',
        footwear: 'Canvas Shoes or Sandals',
        accessories: 'UV Polarized Sunglasses & Cap',
      };
    }
  };

  const outfit = getOutfits();

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
                {tempInC < 15 ? 'Layered Cold Weather Protection' : 'Lightweight Breathable Apparel'}
              </h3>
              <p className="font-body text-muted mb-4">
                Based on current temperature of {unit === 'F' ? `${Math.round((tempInC * 9) / 5 + 32)}°F` : `${tempInC}°C`} and humidity of {weather.current.humidity}%.
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
                <div className="text-muted extra-small">UV Index is currently {weather.current.uvIndex}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
              <div className={`btn-ae-icon ${isRainy ? 'icon-danger' : 'icon-dark'}`}>
                <Umbrella size={18} />
              </div>
              <div>
                <div className="font-body fw-bold small">Compact Umbrella</div>
                <div className="text-muted extra-small">
                  {isRainy ? 'High chance of precipitation' : 'Unlikely needed today'}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
              <div className="btn-ae-icon icon-tertiary">
                <Shirt size={18} />
              </div>
              <div>
                <div className="font-body fw-bold small">Fabric Care</div>
                <div className="text-muted extra-small">Choose breathable cotton & linen blend</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}