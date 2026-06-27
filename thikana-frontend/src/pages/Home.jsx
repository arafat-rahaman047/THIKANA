import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, SlidersHorizontal, AlertCircle } from 'lucide-react';

import useAuth from '../hooks/useAuth';
import HeroSearch from '../components/property/HeroSearch';
import PropertyCard from '../components/property/PropertyCard';
import { getProperties } from '../services/propertyService';
import { getFavorites } from '../services/favoritesService';

const Home = () => {
  const { user, loading: authLoading } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 9,
    sortBy: 'created_at'
  });

  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    isError: propertiesError
  } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => getProperties(filters),
    keepPreviousData: true,
    enabled: !!user && !authLoading
  });

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!user && !authLoading
  });

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const favoritesList = favoritesData?.data || [];
  const favoritedIds = new Set(
    favoritesList.map((fav) => fav.property_id || fav.id)
  );

  const handleSearch = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      ...newFilters
    }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      sortBy: e.target.value
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 9,
      sortBy: 'created_at'
    });
  };

  const properties = propertiesData?.data || [];
  const meta = propertiesData?.meta || {
    page: 1,
    totalPages: 1,
    total: 0
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden py-20 px-6 sm:px-12 md:px-20 text-center bg-gradient-to-tr from-emerald-800 to-sky-950 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
            Smart Rental & Real Estate
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Find Your Perfect{' '}
            <span className="text-emerald-400">Thikana</span> in Bangladesh
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Search verified apartments, sublets, bachelor messes, offices, and houses with secure agreements and instant payments.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="-mt-20 relative z-10 px-4">
        <HeroSearch onSearch={handleSearch} />
      </section>

      {/* Listings Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-800">
              Available Properties
            </h2>
            <p className="text-sm text-slate-400">
              Found {meta.total} properties matching your filters
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
            <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              Sort By:
            </span>

            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="created_at">Latest Listings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {propertiesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white border border-slate-100 rounded-2xl overflow-hidden h-[380px]"
              >
                <div className="bg-slate-200 aspect-[4/3] w-full"></div>
                <div className="p-5 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-10 bg-slate-200 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : propertiesError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3 max-w-xl mx-auto">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold">Error loading properties</p>
              <p className="text-sm text-red-600">
                Please verify your server connection and try again.
              </p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl max-w-md mx-auto p-8 shadow-sm">
            <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No Properties Found
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find any listings matching your criteria. Try adjusting your search filters.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Clear filters and search again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                isFavoritedInitially={favoritedIds.has(prop.id)}
              />
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm font-bold text-slate-500 px-3">
              Page {meta.page} of {meta.totalPages}
            </span>

            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => handlePageChange(meta.page + 1)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;