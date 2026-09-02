'use client';

import React from 'react';
import { WeatherData } from '@/types/weather';
import { Compass, MapPin, ExternalLink, ShieldCheck, Sun, Umbrella } from 'lucide-react';

interface LocalGuideViewProps {
  weather: WeatherData | null;
}

export default function LocalGuideView({ weather }: LocalGuideViewProps) {
  if (!weather) return null;

  const { current } = weather;
  const isRainy = current.condition.toLowerCase().includes('rain') || current.humidity > 80;

  // Recommendations tailored to current weather
  const places = isRainy
    ? [
        {
          name: 'The Metropolitan Museum of Art',
          category: 'Art & Culture',
          dist: '0.8 miles away',
          badge: 'Indoor / Climate Controlled',
          image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&q=80',
          desc: 'Perfect indoor sanctuary during rainy weather. World-class galleries spanning 5,000 years.',
        },
        {
          name: 'Central Library Atrium',
          category: 'Cozy Reading',
          dist: '1.2 miles away',
          badge: 'Indoor Quiet Space',
          image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
          desc: 'Enjoy coffee and light reading with expansive skylight views of falling rain.',
        },
      ]
    : [
        {
          name: 'Skyline Terrace & Garden',
          category: 'Dining & Views',
          dist: '0.5 miles away',
          badge: 'Outdoor Scenic Spot',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          desc: 'Open rooftop seating with clear panoramic city views and optimal sunshine.',
        },
        {
          name: 'Botanical Promenade',
          category: 'Outdoor Adventure',
          dist: '1.8 miles away',
          badge: 'Great Sunshine Spot',
          image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
          desc: 'Lush walking paths ideal for morning strolls under clear skies.',
        },
      ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span className="font-label">Curated Spots</span>
          <h2 className="font-headline mb-0">Weather-Adaptive Local Guide</h2>
        </div>
        <div className="d-flex align-items-center gap-2 bg-white border px-3 py-2 rounded-pill shadow-sm">
          {isRainy ? (
            <>
              <Umbrella size={16} className="text-secondary" />
              <span className="small font-body">Rainy Day Suggestions</span>
            </>
          ) : (
            <>
              <Sun size={16} className="text-warning" />
              <span className="small font-body">Clear Sky Suggestions</span>
            </>
          )}
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="row g-4">
        {places.map((place, idx) => (
          <div key={idx} className="col-12 col-md-6">
            <div className="bg-white rounded-4 border shadow-sm overflow-hidden h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="position-relative" style={{ height: '200px' }}>
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge bg-white text-dark shadow-sm rounded-pill px-3 py-2 font-body">
                    {place.badge}
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex align-items-center gap-2 text-muted extra-small font-label mb-1">
                    <Compass size={14} />
                    <span>{place.category}</span>
                    <span>•</span>
                    <MapPin size={14} />
                    <span>{place.dist}</span>
                  </div>

                  <h4 className="font-headline fw-bold mb-2">{place.name}</h4>
                  <p className="font-body text-muted small mb-0">{place.desc}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button className="btn-ae-outlined w-100 d-flex align-items-center justify-content-center gap-2">
                  <span>Explore Venue</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}