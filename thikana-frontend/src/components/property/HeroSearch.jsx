import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../common/Button';

const CITIES = ['Dhaka', 'Chittagong'];
const PROPERTY_TYPES = [
  { id: 1, name: 'Apartment' },
  { id: 2, name: 'House' },
  { id: 3, name: 'Sublet' },
  { id: 4, name: 'Office' },
  { id: 5, name: 'Bachelor Mess' }
];

const ZONES = [
  { id: 1, name: 'Gulshan', city: 'Dhaka' },
  { id: 2, name: 'Banani', city: 'Dhaka' },
  { id: 3, name: 'Dhanmondi', city: 'Dhaka' },
  { id: 4, name: 'Uttara', city: 'Dhaka' },
  { id: 5, name: 'Mirpur', city: 'Dhaka' },
  { id: 6, name: 'Halishahar', city: 'Chittagong' },
  { id: 7, name: 'GEC Circle', city: 'Chittagong' }
];

const LISTING_TYPES = [
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Buy' },
  { value: 'sublet', label: 'Sublet' },
  { value: 'office', label: 'Office' },
  { value: 'bachelor', label: 'Bachelor Mess' }
];

const HeroSearch = ({ onSearch }) => {
  const [search, setSearch] = useState('');
  const [listingType, setListingType] = useState('rent');
  const [city, setCity] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [isFurnished, setIsFurnished] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter zones dynamically based on selected city
  const filteredZones = city 
    ? ZONES.filter(zone => zone.city.toLowerCase() === city.toLowerCase())
    : ZONES;

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {};
    if (search) filters.search = search;
    if (listingType) filters.listingType = listingType;
    if (city) filters.city = city;
    if (zoneId) filters.zoneId = parseInt(zoneId, 10);
    if (typeId) filters.typeId = parseInt(typeId, 10);
    if (priceMin) filters.priceMin = parseFloat(priceMin);
    if (priceMax) filters.priceMax = parseFloat(priceMax);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms, 10);
    if (bathrooms) filters.bathrooms = parseInt(bathrooms, 10);
    if (isFurnished !== '') filters.isFurnished = parseInt(isFurnished, 10);
    
    onSearch(filters);
  };

  const handleReset = () => {
    setSearch('');
    setListingType('rent');
    setCity('');
    setZoneId('');
    setTypeId('');
    setPriceMin('');
    setPriceMax('');
    setBedrooms('');
    setBathrooms('');
    setIsFurnished('');
    onSearch({});
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Selectors for Listing Type */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl max-w-lg mb-4">
        {LISTING_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setListingType(type.value)}
            className={`flex-1 min-w-[70px] text-center text-xs font-semibold py-2 px-3 rounded-lg transition-all ${
              listingType === type.value
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Main Search Panel */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Keyword Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Properties</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter keywords (flat, room, sublet...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* City Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setZoneId(''); // reset zone if city changes
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none transition-all"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1 py-3 text-sm rounded-xl">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 shrink-0"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            {/* Zone Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Area / Zone</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Zones</option>
                {filteredZones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name} ({z.city})</option>
                ))}
              </select>
            </div>

            {/* Property Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Property Type</label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Price (BDT)</label>
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Price (BDT)</label>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Rooms */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Beds</label>
              <input
                type="number"
                placeholder="Beds"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Baths</label>
              <input
                type="number"
                placeholder="Baths"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Furnished */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Furnishing</label>
              <select
                value={isFurnished}
                onChange={(e) => setIsFurnished(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any</option>
                <option value="1">Furnished</option>
                <option value="0">Unfurnished</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-slate-700"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default HeroSearch;
