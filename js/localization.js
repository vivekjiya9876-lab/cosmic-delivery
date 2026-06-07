// GloboCrust Localization Service

export const LOCATIONS = [
  {
    code: 'US-NYC',
    name: 'New York City, USA',
    shortName: 'New York, US',
    currency: 'USD',
    symbol: '$',
    exchangeRate: 1.0,
    phonePrefix: '+1',
    phonePlaceholder: '(555) 000-0000',
    postalRegex: '^\\d{5}(-\\d{4})?$',
    postalPlaceholder: '10001',
    kitchen: 'Manhattan Copper-Dome Hearth (0.8 mi away)',
    etd: 22
  },
  {
    code: 'GB-LON',
    name: 'London, United Kingdom',
    shortName: 'London, UK',
    currency: 'GBP',
    symbol: '£',
    exchangeRate: 0.80,
    phonePrefix: '+44',
    phonePlaceholder: '7911 123456',
    postalRegex: '^[A-Za-z]{1,2}\\d[A-Za-z\\d]?\\s*\\d[A-Za-z]{2}$',
    postalPlaceholder: 'EC1A 1BB',
    kitchen: 'Soho High-Temp Brick Oven (1.2 mi away)',
    etd: 28
  },
  {
    code: 'JP-TYO',
    name: 'Tokyo, Japan',
    shortName: 'Tokyo, JP',
    currency: 'JPY',
    symbol: '¥',
    exchangeRate: 155.0,
    phonePrefix: '+81',
    phonePlaceholder: '090-1234-5678',
    postalRegex: '^\\d{3}-\\d{4}$',
    postalPlaceholder: '100-0001',
    kitchen: 'Shinjuku Basalt Dome (0.6 km away)',
    etd: 15
  },
  {
    code: 'IT-ROM',
    name: 'Rome, Italy',
    shortName: 'Rome, IT',
    currency: 'EUR',
    symbol: '€',
    exchangeRate: 0.92,
    phonePrefix: '+39',
    phonePlaceholder: '333 123 4567',
    postalRegex: '^\\d{5}$',
    postalPlaceholder: '00118',
    kitchen: 'Trastevere Wood-Fired Vault (0.3 km away)',
    etd: 18
  },
  {
    code: 'FR-PAR',
    name: 'Paris, France',
    shortName: 'Paris, FR',
    currency: 'EUR',
    symbol: '€',
    exchangeRate: 0.92,
    phonePrefix: '+33',
    phonePlaceholder: '06 12 34 56 78',
    postalRegex: '^\\d{5}$',
    postalPlaceholder: '75001',
    kitchen: 'Le Marais Volcanic Fireplace (1.4 km away)',
    etd: 25
  },
  {
    code: 'AU-SYD',
    name: 'Sydney, Australia',
    shortName: 'Sydney, AU',
    currency: 'AUD',
    symbol: 'A$',
    exchangeRate: 1.50,
    phonePrefix: '+61',
    phonePlaceholder: '0412 345 678',
    postalRegex: '^\\d{4}$',
    postalPlaceholder: '2000',
    kitchen: 'Darling Harbour Coastal Roaster (2.1 km away)',
    etd: 32
  }
];

export function getLocations() {
  return LOCATIONS;
}

export function getLocationByCode(code) {
  return LOCATIONS.find(loc => loc.code === code) || LOCATIONS[0];
}

// Simulates auto-detection of location
export function autoDetectLocation() {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // In a real environment, this might use navigator.geolocation
      // We will randomly pick a location that is NOT the first one to make the toggle obvious, 
      // or choose based on timezone. Since local time is often Asia/Kolkata or other, we can pick randomly.
      const randomIndex = Math.floor(Math.random() * (LOCATIONS.length - 1)) + 1;
      resolve(LOCATIONS[randomIndex]);
    }, 1200);
  });
}
