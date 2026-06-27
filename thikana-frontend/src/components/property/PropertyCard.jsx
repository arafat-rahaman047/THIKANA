import { getMediaUrl, FALLBACK_PROPERTY_IMAGE } from '../../utils/mediaUrl';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { addFavorite, removeFavorite } from '../../services/favoritesService';

const PropertyCard = ({ property, isFavoritedInitially = false, onFavoriteToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showNotification('Please log in to add favorites', 'warning');
      navigate('/login');
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(property.id);
        setIsFavorited(false);
        showNotification('Removed from favorites', 'success');
      } else {
        await addFavorite(property.id);
        setIsFavorited(true);
        showNotification('Added to favorites', 'success');
      }
      if (onFavoriteToggle) {
        onFavoriteToggle(property.id, !isFavorited);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update favorite status', 'error');
    } finally {
      setFavLoading(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(property.price);

  const getListingTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'rent': return 'For Rent';
      case 'sale': return 'For Sale';
      case 'sublet': return 'Sublet';
      case 'office': return 'Commercial';
      case 'bachelor': return 'Bachelor';
      default: return type;
    }
  };

  // Fallback beautiful image if no thumbnail
 const imageSrc = getMediaUrl(property.thumbnail_url, FALLBACK_PROPERTY_IMAGE);
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      {/* Property Image & Badge */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
        <img
          src={imageSrc}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Listing Type Badge */}
        <span className="absolute top-4 left-4 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm tracking-wide capitalize">
          {getListingTypeLabel(property.listing_type)}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          className={`absolute top-4 right-4 p-2.5 rounded-full bg-white/95 text-slate-500 shadow-md hover:text-rose-500 hover:scale-110 active:scale-95 transition-all focus:outline-none ${
            isFavorited ? 'text-rose-500' : ''
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Location & Title */}
        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{property.address?.split(',').slice(-2).join(',').trim() || property.city}</span>
        </div>

        <Link to={`/properties/${property.id}`} className="block mb-2">
          <h3 className="font-display font-bold text-slate-800 text-base leading-tight hover:text-emerald-600 transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        {/* Price & Views */}
        <div className="flex items-baseline justify-between mb-4 border-b border-slate-50 pb-4 shrink-0">
          <span className="text-xl font-extrabold text-emerald-600 font-display">
            {formattedPrice}
            {property.listing_type === 'rent' || property.listing_type === 'sublet' || property.listing_type === 'bachelor' ? (
              <span className="text-xs font-semibold text-slate-400">/mo</span>
            ) : null}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            {property.views_count || 0} views
          </span>
        </div>

        {/* Stats (Beds, Baths, Area) */}
        <div className="grid grid-cols-3 gap-2 text-slate-500 text-xs mt-auto font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg justify-center">
            <Bed className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg justify-center">
            <Bath className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg justify-center col-span-1">
            <Maximize className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{property.area_sqft} sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
