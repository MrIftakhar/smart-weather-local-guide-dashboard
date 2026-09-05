# Smart Weather Local Guide Dashboard

A responsive weather dashboard that combines live weather data with a forecast chart, weather-aware local suggestions, and clothing recommendations.

## Features

- Search for a city with live autocomplete suggestions.
- Use the browser's current location.
- Display current conditions, temperature, humidity, wind, UV index, and precipitation.
- View a five-day temperature and rain forecast.
- Switch between Celsius and Fahrenheit.
- Switch between light and dark presentation modes.
- Save and restore the last searched location with `localStorage`.
- Generate weather-based local guide and wardrobe recommendations.

## Technology Stack

- **Languages:** TypeScript, TSX, SCSS, and CSS
- **Framework:** Next.js `16.3.4` with the App Router
- **UI library:** React `19.2.8`
- **Styling:** Bootstrap `5.3.8` and custom Sass
- **Icons:** `lucide-react`
- **Charts:** `recharts`
- **Fonts:** Hanken Grotesk and Playfair Display
- **Type checking:** TypeScript in strict mode
- **Linting:** ESLint

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Other available commands:

```bash
npm run build   # Create a production build
npm start       # Start the production server
npm run lint    # Run ESLint
```

## Project Structure

```text
src/
	app/
		page.tsx                 Main client page and application state
		layout.tsx               Root layout and global styles
		globals.scss             Global responsive styles
	components/
		DashboardView.tsx        Current weather dashboard
		ForecastView.tsx         Forecast chart and daily cards
		LocalGuideView.tsx       Weather-based place suggestions
		AssistantView.tsx        Weather-based clothing suggestions
		AppLayout.tsx            Alternate layout implementation
	services/
		weatherService.ts        Active geocoding and forecast service
	lib/
		weather.ts               Older weather service implementation
	types/
		weather.ts               Shared weather data types
	styles/
		main.scss                Bootstrap and custom Sass entry point
		_variables.scss          Colors, fonts, theme variables, and mixins
```

The active application entry point is [src/app/page.tsx](src/app/page.tsx). It imports the weather service and the four active view components.

## API Sources

This project does not currently use an API key, database, or custom backend. The browser calls public HTTPS endpoints directly.

### Open-Meteo Geocoding API

Used for city search and autocomplete:

```text
https://geocoding-api.open-meteo.com/v1/search
```

It returns city names, countries, regions, latitudes, and longitudes.

### Open-Meteo Forecast API

Used for current, hourly, and daily weather:

```text
https://api.open-meteo.com/v1/forecast
```

The active service requests temperature, humidity, apparent temperature, precipitation, weather code, wind speed, UV index, daily highs and lows, rain probability, and hourly temperatures.

### Nominatim OpenStreetMap API

Used to convert browser GPS coordinates into a readable location:

```text
https://nominatim.openstreetmap.org/reverse
```

### Google Maps Search URL

The local guide creates links to Google Maps searches. This is a URL integration, not a Google Maps API integration:

```text
https://www.google.com/maps/search/?api=1&query=...
```

### Unsplash Images

Local guide cards use remote Unsplash image URLs for their visual content.

## Weather Data Flow

1. The page starts with `Dhaka` as the default location.
2. A city search calls the Open-Meteo geocoding endpoint.
3. The selected city or typed query is passed to `fetchLocationWeather()`.
4. [src/services/weatherService.ts](src/services/weatherService.ts) resolves the location to coordinates.
5. The service calls Open-Meteo Forecast and converts the response into the local `WeatherData` shape.
6. `page.tsx` stores the result in React state.
7. The selected view receives the same weather object through props.

The shared data contract is defined in [src/types/weather.ts](src/types/weather.ts).

## React and Frontend Techniques

### State and effects

React state manages the active tab, weather data, loading state, theme, unit, search text, and suggestions. `useEffect` handles initial loading, autocomplete requests, outside-click detection, and cleanup.

### Debounced search

Autocomplete waits 300 milliseconds after typing before making a request. The pending timer is cleared when the search text changes, reducing unnecessary API calls.

### Controlled inputs

The search field is controlled by React state. Every input change updates `searchTerm`, which drives the autocomplete effect.

### Browser APIs

- `navigator.geolocation` provides the current coordinates.
- `localStorage` remembers the last searched location.
- `document.addEventListener` closes the suggestions list when the user clicks outside it.

### Conditional rendering and recommendations

The dashboard renders one active view at a time. Rain, humidity, wind, UV index, apparent temperature, and precipitation are used to generate local guide and wardrobe recommendations.

### Responsive styling

Bootstrap grid and utility classes provide the layout. Custom Sass adds theme variables, typography, responsive sidebar behavior, and weather animations.

### Data visualization

Recharts renders the five-day high and low temperature area chart in [src/components/ForecastView.tsx](src/components/ForecastView.tsx).

## Applying This Pattern To Another API

1. Define a TypeScript interface for the data your UI needs.
2. Create a service module for API requests.
3. Convert the external response into your own stable data shape.
4. Call the service from a client component.
5. Store the result in React state.
6. Pass the typed data to smaller presentation components.
7. Add loading, empty, and error states.
8. Debounce search inputs when they trigger network requests.
9. Add caching or local storage where repeated requests are expected.
10. Move private API calls into Next.js server routes when authentication or secret keys are required.

## Known Limitations

- No API key or server-side proxy is configured.
- Air quality is currently represented by a hardcoded value.
- Some UV values in the alternate dashboard path are hardcoded.
- Local guide locations and distances are static examples rather than live nearby places.
- Weather-condition mapping logic exists in more than one file.
- [src/lib/weather.ts](src/lib/weather.ts) and [src/components/AppLayout.tsx](src/components/AppLayout.tsx) appear to be older alternate implementations; the active page uses `weatherService.ts` and its own layout.

## Verification

The project currently passes:

```bash
npm run build
```
