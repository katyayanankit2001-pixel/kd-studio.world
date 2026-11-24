import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import {ArrowUpRight, MapPin, Star} from 'lucide-react';
import {useState} from 'react';
import {STUDIO_INFO} from '../data/studioData';
import type {LiveStudioPlace} from './GoogleReviewsSection';

interface StudioMapProps {
  hasApiKey: boolean;
  livePlace: LiveStudioPlace | null;
}

export function StudioMap({hasApiKey, livePlace}: StudioMapProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState<boolean>(true);

  const position = livePlace?.location ?? STUDIO_INFO.coordinates;
  const placeName = livePlace?.displayName ?? STUDIO_INFO.mapsPlaceName;
  const placeAddress = STUDIO_INFO.addressLine;
  const mapsHref = livePlace?.googleMapsUri ?? STUDIO_INFO.googleMapsShortUrl;

  if (!hasApiKey) {
    return (
      <div className="h-[320px] sm:h-[380px] w-full rounded-xl border border-neutral-900/12 dark:border-[#dbe8f6]/18 bg-white dark:bg-[#0e151d] p-6 flex flex-col items-center justify-center text-center gap-4">
        <MapPin className="w-8 h-8 text-[#8c6628] dark:text-[#d3b27b]" aria-hidden="true" />
        <div>
          <p className="font-serif text-2xl text-[#14171c] dark:text-[#f7f4ef]">{placeName}</p>
          <p className="text-sm text-[#525d6b] dark:text-[#b9c1ca] mt-1">{placeAddress}</p>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#d3b27b] text-[#17120c] text-sm font-semibold"
        >
          <span>Open in Google Maps</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-[320px] sm:h-[380px] lg:h-[420px] w-full rounded-xl overflow-hidden border border-neutral-900/12 dark:border-[#dbe8f6]/18 bg-neutral-200 dark:bg-[#0d131a]">
      <GoogleMap
        defaultCenter={position}
        center={position}
        defaultZoom={16}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={true}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{width: '100%', height: '100%'}}
      >
        <AdvancedMarker
          ref={markerRef}
          position={position}
          title={placeName}
          onClick={() => setInfoOpen((prev) => !prev)}
        >
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-black border-2 border-[#d3b27b] shadow-[0_8px_22px_rgba(0,0,0,0.65)] overflow-hidden p-1 flex items-center justify-center">
              <img
                src={STUDIO_INFO.logoPath}
                alt={placeName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-2.5 h-2.5 bg-[#d3b27b] rotate-45 -mt-1.5 border-r border-b border-black/40" />
          </div>
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)}>
            <div className="text-[#111827] max-w-[230px] p-0.5 space-y-1.5 font-sans">
              <p className="font-semibold text-sm leading-tight text-[#0f172a]">{placeName}</p>
              {livePlace?.rating !== undefined && (
                <div className="flex items-center gap-1 text-xs text-[#334155]">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                  <span className="font-semibold tabular-nums">{livePlace.rating.toFixed(1)}</span>
                  {livePlace.userRatingCount !== undefined && (
                    <span className="text-[#64748b] tabular-nums">
                      ({livePlace.userRatingCount})
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-[#475569] leading-snug">{placeAddress}</p>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d4ed8] hover:underline pt-0.5"
              >
                <span>Directions on Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
