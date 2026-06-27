import { getMediaUrl } from '../utils/mediaUrl';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bed, Bath, Maximize, MapPin, Heart, Share2, MessageSquare, AlertTriangle, 
  Star, Send, Trash, Shield, Check, Info, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/common/Button';
import { getPropertyById, deleteProperty } from '../services/propertyService';
import { addFavorite, removeFavorite, getFavorites } from '../services/favoritesService';
import { startConversation } from '../services/messageService';
import { getReviews, createReview, deleteReview } from '../services/reviewService';
import { submitReport } from '../services/reportService';

const AMENITY_ICONS = {
  'Lift': Shield,
  'Generator': Info,
  'Security': ShieldCheck,
  'WiFi': Info,
  'Parking': Info,
  'Gas': Info,
  'CCTV': Shield,
  'Balcony': Info,
  'Gym': Info
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // 1. Fetch Property Details
  const { 
    data: propertyRes, 
    isLoading: propertyLoading, 
    isError: propertyError 
  } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id)
  });

  const property = propertyRes?.data;

  // 2. Fetch User Favorites
  const { data: favoritesRes } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!user
  });

  const isFavorited = favoritesRes?.data?.some(fav => fav.property_id === parseInt(id, 10)) || false;

  // 3. Fetch Property Reviews
  const { data: reviewsRes } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviews(id)
  });

  const reviews = reviewsRes?.data || [];
  const averageRating = reviewsRes?.meta?.averageRating || '0.0';
  const reviewsCount = reviewsRes?.meta?.reviewsCount || 0;

  // Mutate Favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => isFavorited ? removeFavorite(id) : addFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      showNotification(isFavorited ? 'Removed from favorites' : 'Added to favorites', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to update favorite', 'error');
    }
  });

  // Mutate Submit Review
  const submitReviewMutation = useMutation({
    mutationFn: () => createReview(id, newRating, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setNewComment('');
      setNewRating(5);
      showNotification('Review submitted successfully!', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to submit review', 'error');
    }
  });

  // Mutate Delete Review
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      showNotification('Review deleted', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to delete review', 'error');
    }
  });

  // Mutate Start Chat
  const startChatMutation = useMutation({
    mutationFn: () => startConversation(id, chatMessage),
    onSuccess: (res) => {
      setShowChatModal(false);
      setChatMessage('');
      const conversationId = res?.data?.conversationId;
      showNotification('Conversation started!', 'success');
      navigate(conversationId ? `/tenant?tab=messages&chat=${conversationId}` : '/tenant?tab=messages');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to start chat', 'error');
    }
  });

  // Mutate Submit Report
  const submitReportMutation = useMutation({
    mutationFn: () => submitReport({ 
      reportedPropertyId: parseInt(id, 10), 
      reason: reportReason, 
      description: reportDesc 
    }),
    onSuccess: () => {
      setShowReportModal(false);
      setReportReason('');
      setReportDesc('');
      showNotification('Report submitted to moderation', 'warning');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to submit report', 'error');
    }
  });

  if (propertyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent shadow-md"></div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Property Listing Not Found</h2>
        <p className="text-slate-500">This property might have been deleted, or is pending administrative moderation.</p>
        <Button variant="primary" onClick={() => navigate('/')}>Return to Listings</Button>
      </div>
    );
  }

  const isOwner = user?.id === property.owner_id;
  const formattedPrice = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(property.price);

const images = property.media?.length > 0
  ? property.media.map(m => getMediaUrl(m.url))
  : [getMediaUrl(null)];
  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs / Header Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span className="capitalize">{property.listing_type}</span>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-[200px]">{property.title}</span>
        </div>
        <div className="flex gap-2">
          {!isOwner && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleFavoriteMutation.mutate()}
              className={isFavorited ? 'text-rose-500 border-rose-200 bg-rose-50' : 'text-slate-500'}
            >
              <Heart className={`w-4 h-4 mr-1.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isFavorited ? 'Favorited' : 'Add to Favorites'}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showNotification('Link copied to clipboard', 'success');
            }}
            className="text-slate-500"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Image Slider + Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-100">
              <img 
                src={images[activeImage]} 
                alt={property.title} 
                className="w-full h-full object-cover transition-all duration-300"
              />
              <span className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-semibold">
                Image {activeImage + 1} of {images.length}
              </span>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                      activeImage === idx ? 'border-emerald-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase">
                  For {property.listing_type}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-800 leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-right">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Listing Price</p>
                <p className="text-2xl font-extrabold text-emerald-600 font-display">
                  {formattedPrice}
                  {(property.listing_type === 'rent' || property.listing_type === 'sublet' || property.listing_type === 'bachelor') && (
                    <span className="text-sm font-semibold text-emerald-500">/month</span>
                  )}
                </p>
              </div>
            </div>

            {/* Room Features */}
            <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6 text-center text-slate-600">
              <div className="space-y-1.5">
                <Bed className="w-6 h-6 mx-auto text-emerald-500" />
                <p className="text-xs text-slate-400 uppercase font-bold">Bedrooms</p>
                <p className="text-base font-extrabold text-slate-700">{property.bedrooms} Beds</p>
              </div>
              <div className="space-y-1.5 border-x border-slate-100">
                <Bath className="w-6 h-6 mx-auto text-emerald-500" />
                <p className="text-xs text-slate-400 uppercase font-bold">Bathrooms</p>
                <p className="text-base font-extrabold text-slate-700">{property.bathrooms} Baths</p>
              </div>
              <div className="space-y-1.5">
                <Maximize className="w-6 h-6 mx-auto text-emerald-500" />
                <p className="text-xs text-slate-400 uppercase font-bold">Square Feet</p>
                <p className="text-base font-extrabold text-slate-700">{property.area_sqft} sqft</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800">Description</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Property Amenities</h2>
              {property.amenities?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity.name] || Check;
                    return (
                      <div key={amenity.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Icon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-slate-700">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No amenities specified for this listing.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Owner Panel + Contact actions */}
        <div className="space-y-6">
          {/* Owner Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Listed By</h3>
            {property.owner_id ? (
              <Link to={`/users/${property.owner_id}/profile`} className="flex flex-col items-center group">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(property.owner_name || 'Owner')}`} 
                  alt={property.owner_name} 
                  className="w-20 h-20 rounded-full border-2 border-slate-100 object-cover shadow-sm mb-3 group-hover:scale-105 transition-transform"
                />
                <h4 className="text-lg font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors">{property.owner_name || 'Landlord'}</h4>
                <p className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-md font-semibold mt-1">
                  Property Owner
                </p>
              </Link>
            ) : (
              <div className="flex flex-col items-center">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(property.owner_name || 'Owner')}`} 
                  alt={property.owner_name} 
                  className="w-20 h-20 rounded-full border-2 border-slate-100 object-cover shadow-sm mb-3"
                />
                <h4 className="text-lg font-extrabold text-slate-800">{property.owner_name || 'Landlord'}</h4>
                <p className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-md font-semibold mt-1">
                  Property Owner
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2">
              {!isOwner ? (
                <>
                  <Button 
                    variant="primary" 
                    className="w-full py-3 rounded-xl justify-center font-semibold"
                    onClick={() => {
                      if (!user) {
                        showNotification('Log in to contact the owner', 'warning');
                        navigate('/login');
                      } else {
                        setShowChatModal(true);
                      }
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Owner
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full py-3 rounded-xl text-slate-500 justify-center border-slate-200 hover:bg-slate-50 font-semibold"
                    onClick={() => {
                      if (!user) {
                        showNotification('Log in to report a listing', 'warning');
                        navigate('/login');
                      } else {
                        setShowReportModal(true);
                      }
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                    Report Listing
                  </Button>
                </>
              ) : (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-xl text-sm font-medium">
                  This is your property listing. You can manage it from the Owner Dashboard.
                </div>
              )}
            </div>
          </div>

          {/* Rating Summary Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Reviews & Rating</h3>
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-center flex-col shrink-0 min-w-[70px]">
                <span className="text-3xl font-extrabold text-amber-600 font-display">{parseFloat(averageRating).toFixed(1)}</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">rating</span>
              </div>
              <div>
                <div className="flex text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(parseFloat(averageRating)) ? 'fill-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-700">{reviewsCount} customer reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm max-w-4xl space-y-8">
        <h2 className="text-xl font-bold font-display text-slate-800 border-b border-slate-50 pb-4">
          Customer Reviews ({reviews.length})
        </h2>

        {/* Review list */}
        {reviews.length > 0 ? (
          <div className="space-y-6 divide-y divide-slate-100">
            {reviews.map((rev) => {
              const isAuthor = user?.id === rev.reviewer_id;
              const revAvatar = rev.reviewer_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.reviewer_name || 'U')}`;
              return (
                <div key={rev.review_id} className="pt-6 first:pt-0 flex gap-4">
                  {rev.reviewer_id ? (
                    <Link to={`/users/${rev.reviewer_id}/profile`} className="shrink-0 group">
                      <img 
                        src={revAvatar} 
                        alt={rev.reviewer_name} 
                        className="w-10 h-10 rounded-full border border-slate-100 object-cover group-hover:opacity-85 transition-opacity" 
                      />
                    </Link>
                  ) : (
                    <img 
                      src={revAvatar} 
                      alt={rev.reviewer_name} 
                      className="w-10 h-10 rounded-full border border-slate-100 object-cover shrink-0" 
                    />
                  )}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        {rev.reviewer_id ? (
                          <Link to={`/users/${rev.reviewer_id}/profile`} className="font-extrabold text-slate-800 text-sm hover:text-emerald-600 transition-colors truncate block">
                            {rev.reviewer_name}
                          </Link>
                        ) : (
                          <h4 className="font-extrabold text-slate-800 text-sm truncate">{rev.reviewer_name}</h4>
                        )}
                        <div className="flex text-amber-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Review Management Action */}
                      {(isAuthor || user?.role === 'admin') && (
                        <button
                          onClick={() => deleteReviewMutation.mutate(rev.review_id)}
                          disabled={deleteReviewMutation.isPending}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete review"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">{rev.comment}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No reviews yet. Be the first to leave feedback!
          </div>
        )}

        {/* Add Review Form */}
        {user && !isOwner && (
          <form 
            onSubmit={(e) => { e.preventDefault(); submitReviewMutation.mutate(); }}
            className="border-t border-slate-100 pt-6 space-y-4"
          >
            <h3 className="font-bold text-slate-800 text-base">Write a Review</h3>
            
            {/* Star selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase">Your Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`w-7 h-7 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} transition-transform active:scale-95`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase">Review Description</label>
              <textarea
                placeholder="Share your experience about the location, property condition, or landlord response..."
                rows="4"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              ></textarea>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={submitReviewMutation.isPending}
              className="py-2.5 px-6 rounded-xl font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </form>
        )}
      </section>

      {/* Start Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-zoomIn border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Send Message</h3>
              <button onClick={() => setShowChatModal(false)} className="text-slate-400 hover:text-slate-600">
                <Check className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form 
              onSubmit={(e) => { e.preventDefault(); startChatMutation.mutate(); }}
              className="p-6 space-y-4"
            >
              <p className="text-sm text-slate-500 leading-relaxed">
                Send an initial message to start a conversation about <span className="font-semibold text-slate-800">{property.title}</span>.
              </p>
              <textarea
                placeholder="Hi, is this property still available for booking? I'd like to schedule a visit..."
                rows="4"
                required
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              ></textarea>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowChatModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={startChatMutation.isPending}>
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-zoomIn border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Report Listing</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <Check className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form 
              onSubmit={(e) => { e.preventDefault(); submitReportMutation.mutate(); }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Reason for Report</label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-750 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a reason</option>
                  <option value="fake_listing">Fake Listing / Address</option>
                  <option value="wrong_pricing">Incorrect Pricing / Details</option>
                  <option value="spam">Spam / Duplicate Posting</option>
                  <option value="unavailable">Property Rented/Sold already</option>
                  <option value="offensive">Offensive Content / Media</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Additional Comments</label>
                <textarea
                  placeholder="Provide details to help administrators review this listing..."
                  rows="3"
                  required
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
                <Button type="submit" variant="danger" loading={submitReportMutation.isPending}>
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetail;
