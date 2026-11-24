/// <reference types="@types/google.maps" />
import {APILoadingStatus, useApiLoadingStatus, useMapsLibrary} from '@vis.gl/react-google-maps';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Star,
} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';
import {STUDIO_INFO} from '../data/studioData';

export interface LiveGoogleReview {
  id: string;
  authorName: string;
  authorUri?: string;
  authorPhotoUri?: string;
  rating: number;
  text: string;
  relativeTime: string;
  googleMapsUri?: string;
}

export interface LiveStudioPlace {
  displayName: string;
  formattedAddress: string;
  location: {lat: number; lng: number};
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  weekdayDescriptions?: string[];
  reviews: LiveGoogleReview[];
}

interface GoogleReviewsSectionProps {
  hasApiKey: boolean;
  onPlaceLoaded?: (place: LiveStudioPlace) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'G';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function isQuotaError(err: unknown): boolean {
  const text = String(err instanceof Error ? err.message : err ?? '');
  return (
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('OverQuota') ||
    text.includes('QuotaExceeded') ||
    text.includes('429')
  );
}

export function GoogleReviewsSection({hasApiKey, onPlaceLoaded}: GoogleReviewsSectionProps) {
  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();

  const [placeData, setPlaceData] = useState<LiveStudioPlace | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(hasApiKey);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLiveReviews = useCallback(async () => {
    if (!hasApiKey) {
      setLoading(false);
      return;
    }
    if (!placesLib) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const request: google.maps.places.SearchByTextRequest & {
        internalUsageAttributionIds?: string[];
      } = {
        textQuery: `${STUDIO_INFO.mapsPlaceName}, ${STUDIO_INFO.mapsQueryAddress}`,
        locationBias: {
          center: STUDIO_INFO.coordinates,
          radius: 3000,
        },
        maxResultCount: 1,
        fields: [
          'id',
          'displayName',
          'formattedAddress',
          'location',
          'rating',
          'userRatingCount',
          'reviews',
          'googleMapsURI',
          'regularOpeningHours',
        ],
        internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
      };

      const {places} = await placesLib.Place.searchByText(request);
      const matched = places?.[0];

      if (!matched) {
        setPlaceData(null);
        setLoading(false);
        return;
      }

      const rawReviews: google.maps.places.Review[] = Array.isArray(matched.reviews)
        ? matched.reviews
        : [];
      const normalizedReviews: LiveGoogleReview[] = rawReviews.map(
        (rev: google.maps.places.Review, idx: number) => ({
          id: `${matched.id || 'kd'}-review-${idx}`,
          authorName: rev.authorAttribution?.displayName || 'Google Maps reviewer',
          authorUri: rev.authorAttribution?.uri || undefined,
          authorPhotoUri: rev.authorAttribution?.photoURI || undefined,
          rating: typeof rev.rating === 'number' ? rev.rating : 5,
          text: rev.text || rev.originalText || '',
          relativeTime: rev.relativePublishTimeDescription || 'Google Maps review',
          googleMapsUri:
            rev.googleMapsURI || matched.googleMapsURI || STUDIO_INFO.googleMapsShortUrl,
        }),
      );

      const loc = matched.location
        ? {lat: matched.location.lat(), lng: matched.location.lng()}
        : STUDIO_INFO.coordinates;

      const parsed: LiveStudioPlace = {
        displayName: matched.displayName || STUDIO_INFO.mapsPlaceName,
        formattedAddress: matched.formattedAddress || STUDIO_INFO.addressLine,
        location: loc,
        rating: typeof matched.rating === 'number' ? matched.rating : undefined,
        userRatingCount:
          typeof matched.userRatingCount === 'number' ? matched.userRatingCount : undefined,
        googleMapsUri: matched.googleMapsURI || STUDIO_INFO.googleMapsShortUrl,
        weekdayDescriptions: matched.regularOpeningHours?.weekdayDescriptions,
        reviews: normalizedReviews,
      };

      setPlaceData(parsed);
      setActiveIndex(0);
      onPlaceLoaded?.(parsed);
    } catch (err) {
      if (isQuotaError(err)) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      console.error('Google Places review lookup failed:', err);
      setErrorMessage('Live Google Maps reviews are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [hasApiKey, placesLib, onPlaceLoaded]);

  useEffect(() => {
    if (!hasApiKey) {
      setLoading(false);
      return;
    }
    if (
      apiStatus === APILoadingStatus.FAILED ||
      apiStatus === APILoadingStatus.AUTH_FAILURE
    ) {
      setLoading(false);
      setErrorMessage('Unable to connect to Google Maps right now.');
      return;
    }
    if (placesLib) {
      void fetchLiveReviews();
    }
  }, [hasApiKey, placesLib, apiStatus, fetchLiveReviews]);

  const reviews = placeData?.reviews ?? [];
  const activeReview = reviews[activeIndex] ?? null;
  const mapsReviewsHref = placeData?.googleMapsUri || STUDIO_INFO.googleMapsShortUrl;

  const handlePrev = () => {
    if (reviews.length < 2) return;
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    if (reviews.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section
      id="reviews"
      className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-16 sm:py-24 lg:py-28"
    >
      <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d] mb-4">
        <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
        06. Customer Feedbacks from Google Maps
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.35fr] gap-8 lg:gap-12 items-start">
        {/* Left Column: Summary & Google Maps Metrics */}
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#14171c] dark:text-[#f7f4ef] leading-[1.04] text-balance mb-4">
              Experience.
              <br />
              <em className="italic text-[#8c6628] dark:text-[#d9bc89]">In their words.</em>
            </h2>
            <p className="text-sm sm:text-[15px] text-[#525d6b] dark:text-[#b9c1ca] leading-relaxed max-w-md">
              Real customer reviews pulled directly from our Google Maps listing for{' '}
              <span className="text-[#14171c] dark:text-[#f2f3f5] font-medium">
                {placeData?.displayName || STUDIO_INFO.mapsPlaceName}
              </span>
              .
            </p>
          </div>

          {/* Live Google Rating Readout */}
          <div className="kd-glass rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] tracking-[0.14em] text-[#8c6628] dark:text-[#e2c897]">
                Google Maps Rating
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#525d6b] dark:text-[#b9c1ca]">
                <MapPin className="w-3.5 h-3.5 text-[#8c6628] dark:text-[#d3b27b]" aria-hidden="true" />
                <span>Arrah, Bihar</span>
              </span>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 py-3 text-sm text-[#525d6b] dark:text-[#b9c1ca]">
                <Loader2 className="w-4 h-4 animate-spin text-[#8c6628] dark:text-[#d3b27b]" aria-hidden="true" />
                <span>Fetching live Google Maps rating...</span>
              </div>
            ) : placeData?.rating !== undefined ? (
              <div className="flex items-end gap-4">
                <span className="font-mono text-4xl sm:text-5xl font-medium text-[#14171c] dark:text-[#f7f4ef] tabular-nums leading-none">
                  {placeData.rating.toFixed(1)}
                </span>
                <div className="pb-0.5 space-y-1">
                  <div className="flex items-center gap-1" aria-label={`${placeData.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(placeData.rating ?? 0)
                            ? 'fill-[#b88c46] text-[#b88c46] dark:fill-[#d3b27b] dark:text-[#d3b27b]'
                            : 'text-neutral-900/15 dark:text-white/20'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#525d6b] dark:text-[#b9c1ca] tabular-nums">
                    Based on{' '}
                    <span className="text-[#14171c] dark:text-[#f2f3f5] font-medium">
                      {placeData.userRatingCount ?? reviews.length}
                    </span>{' '}
                    Google Maps ratings
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#525d6b] dark:text-[#b9c1ca]">
                View our verified Google Maps profile for the latest ratings and customer feedback.
              </p>
            )}

            <div className="pt-3 border-t border-neutral-900/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <a
                href={mapsReviewsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[40px] text-xs sm:text-sm font-medium text-[#8c6628] dark:text-[#e8c994] hover:text-[#6e4d18] dark:hover:text-[#f6deae] transition-colors"
              >
                <span>Read &amp; write reviews on Google Maps</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
              <span className="font-mono text-[10px] tracking-wider text-[#64707d] dark:text-[#8f9eab]">
                Powered by Google
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Reviews Spotlight + List */}
        <div className="space-y-4">
          <div className="kd-glass rounded-2xl p-5 sm:p-8 flex flex-col justify-between min-h-[300px]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#8c6628] dark:text-[#d3b27b]" aria-hidden="true" />
                <p className="text-sm text-[#525d6b] dark:text-[#c7d1da]">
                  Loading customer feedbacks from Google Maps…
                </p>
              </div>
            ) : errorMessage ? (
              <div className="flex-1 flex flex-col justify-between gap-5">
                <div>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[#8c6628] dark:text-[#e2c897]">
                    Google Maps Feedback
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl text-[#14171c] dark:text-[#f7f4ef] mt-3 leading-snug">
                    {errorMessage}
                  </p>
                  <p className="text-sm text-[#525d6b] dark:text-[#b9c1ca] mt-2">
                    You can still read all customer reviews directly on our Google Maps listing.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void fetchLiveReviews()}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-neutral-900/15 dark:border-white/15 bg-neutral-900/[0.04] dark:bg-white/5 hover:bg-neutral-900/10 dark:hover:bg-white/10 text-xs sm:text-sm font-medium text-[#14171c] dark:text-[#f2f3f5] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>Retry loading reviews</span>
                  </button>
                  <a
                    href={mapsReviewsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Open Google Maps</span>
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ) : activeReview ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-900/10 dark:border-white/10">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[#8c6628] dark:text-[#cdb58c] tabular-nums">
                    Google Review · {activeIndex + 1} of {reviews.length}
                  </span>
                  <div className="flex items-center gap-1" aria-label={`${activeReview.rating} stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(activeReview.rating)
                            ? 'fill-[#b88c46] text-[#b88c46] dark:fill-[#d3b27b] dark:text-[#d3b27b]'
                            : 'text-neutral-900/15 dark:text-white/20'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>

                <blockquote className="my-5 sm:my-6 font-serif text-2xl sm:text-3xl text-[#14171c] dark:text-[#f7f4ef] leading-[1.28] tracking-tight">
                  {activeReview.text
                    ? `“${activeReview.text}”`
                    : `Rated ${activeReview.rating} out of 5 stars on Google Maps.`}
                </blockquote>

                <div className="pt-4 border-t border-neutral-900/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Required Google Maps Author Attribution */}
                  <div className="flex items-center gap-3 min-w-0">
                    {activeReview.authorPhotoUri ? (
                      <img
                        src={activeReview.authorPhotoUri}
                        alt={activeReview.authorName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-neutral-900/15 dark:border-white/15 shrink-0 bg-neutral-200 dark:bg-[#151d26]"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-neutral-900/8 dark:bg-[#1b2633] border border-neutral-900/12 dark:border-white/15 flex items-center justify-center font-mono text-xs text-[#8c6628] dark:text-[#e3c99b] shrink-0">
                        {getInitials(activeReview.authorName)}
                      </span>
                    )}
                    <div className="min-w-0">
                      {activeReview.authorUri ? (
                        <a
                          href={activeReview.authorUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-[#14171c] dark:text-[#f2f3f5] hover:text-[#8c6628] dark:hover:text-[#e8c994] transition-colors truncate block"
                        >
                          {activeReview.authorName}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-[#14171c] dark:text-[#f2f3f5] truncate">
                          {activeReview.authorName}
                        </p>
                      )}
                      <p className="text-xs text-[#5b6673] dark:text-[#9fb0be] flex items-center gap-1.5">
                        <span>{activeReview.relativeTime}</span>
                        <span aria-hidden="true">·</span>
                        <a
                          href={activeReview.googleMapsUri || mapsReviewsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8c6628] dark:text-[#e3c99b] hover:underline"
                        >
                          Google Maps
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Prev / Next Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={reviews.length < 2}
                      aria-label="Previous Google review"
                      className="w-11 h-11 rounded-lg border border-neutral-900/15 dark:border-white/15 bg-neutral-900/[0.04] dark:bg-white/[0.04] hover:bg-neutral-900/10 dark:hover:bg-white/10 disabled:opacity-35 flex items-center justify-center text-[#14171c] dark:text-[#f2f3f5] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={reviews.length < 2}
                      aria-label="Next Google review"
                      className="w-11 h-11 rounded-lg border border-neutral-900/15 dark:border-white/15 bg-neutral-900/[0.04] dark:bg-white/[0.04] hover:bg-neutral-900/10 dark:hover:bg-white/10 disabled:opacity-35 flex items-center justify-center text-[#14171c] dark:text-[#f2f3f5] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-between gap-5">
                <div>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[#8c6628] dark:text-[#cdb58c]">
                    Google Maps Feedback
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl text-[#14171c] dark:text-[#f7f4ef] mt-3 leading-snug">
                    No written reviews were returned for this listing yet.
                  </p>
                  <p className="text-sm text-[#525d6b] dark:text-[#b9c1ca] mt-2">
                    Visit our Google Maps page to read all customer ratings or share your experience
                    with King Detailing Studio.
                  </p>
                </div>
                <a
                  href={mapsReviewsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between sm:justify-start gap-2.5 min-h-[46px] px-5 py-2.5 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold w-full sm:w-fit transition-colors"
                >
                  <span>View on Google Maps</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {/* Quick-Select Review Tabs */}
          {reviews.length > 1 && (
            <div
              role="tablist"
              aria-label="Select Google review"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
            >
              {reviews.map((rev, idx) => {
                const selected = idx === activeIndex;
                return (
                  <button
                    key={rev.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveIndex(idx)}
                    className={`min-h-[48px] px-3 py-2 rounded-lg border text-left transition-colors ${
                      selected
                        ? 'border-[#8c6628]/60 dark:border-[#d3b27b]/70 bg-[#d3b27b]/18 dark:bg-[#d3b27b]/12 text-[#14171c] dark:text-[#f7f4ef]'
                        : 'border-neutral-900/12 dark:border-white/10 bg-white/80 dark:bg-[#10161e]/80 text-[#525d6b] dark:text-[#9fb0be] hover:border-neutral-900/25 dark:hover:border-white/25 hover:text-[#14171c] dark:hover:text-[#e8edf2]'
                    }`}
                  >
                    <span className="block text-xs font-medium truncate">{rev.authorName}</span>
                    <span className="block font-mono text-[10px] text-[#8c6628] dark:text-[#e3c99b] tabular-nums mt-0.5">
                      {rev.rating.toFixed(1)} ★
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
