import React, { useState } from 'react';
import {
  X,
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Sparkles,
  Compass,
  Check,
  RefreshCw
} from 'lucide-react';
import { GroundedPlace } from '../types';
import { queryMapsGrounding } from '../services/aiService';

interface MapsGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachPlacesToStory?: (places: GroundedPlace[], locationText: string) => void;
}

export default function MapsGroundingModal({
  isOpen,
  onClose,
  onAttachPlacesToStory
}: MapsGroundingModalProps) {
  const [query, setQuery] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [places, setPlaces] = useState<GroundedPlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setUseCurrentLocation(true);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('Could not access current location. You can search by place name instead.');
        setIsLocating(false);
        setUseCurrentLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResultText(null);
    setPlaces([]);

    try {
      const res = await queryMapsGrounding(query.trim(), useCurrentLocation ? coords : undefined);
      setResultText(res.text);
      setPlaces(res.places);
    } catch (err: any) {
      setError(err.message || 'Maps Grounding search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const presetQueries = [
    "Cozy historic cafes with quiet courtyard gardens",
    "Scenic coastal viewpoints with hiking trails and sunsets",
    "Atmospheric independent bookstores with reading nooks",
    "Hidden botanical gardens and tranquil reflection benches"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
                  Google Maps Story Grounding
                </h3>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  gemini-3.5-flash + googleMaps
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Ground memoirs and friend meetups in real-world geography and verified place URLs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Search Locations, Memoir Settings or Meetup Spots
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Quiet cafes in Kyoto, serene alpine lakes in Banff, historic libraries..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Geolocation toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Include my nearby coordinates for local discovery:</span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className={`px-3 py-1 rounded-xl font-medium text-xs border transition-all ${
                  useCurrentLocation
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                {isLocating ? 'Locating...' : useCurrentLocation ? 'Location Active ✓' : 'Use My GPS'}
              </button>
            </div>

            {/* Inspiration tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-stone-400 font-medium py-1">Popular queries:</span>
              {presetQueries.map((pq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(pq);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-stone-600 dark:text-stone-300 transition-colors"
                >
                  {pq}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Results View */}
          {resultText && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-xs leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
                {resultText}
              </div>

              {/* Verified Google Maps Grounded Links */}
              {places.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Google Maps Verified Locations ({places.length}):
                    </span>
                    {onAttachPlacesToStory && (
                      <button
                        onClick={() => {
                          onAttachPlacesToStory(places, query);
                          onClose();
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Attach to Story</span>
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2">
                    {places.map((place, idx) => (
                      <a
                        key={idx}
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 flex items-center justify-between transition-all group shadow-xs"
                      >
                        <div className="mr-3">
                          <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {place.title}
                          </h4>
                          {place.snippet && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                              "{place.snippet}"
                            </p>
                          )}
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
                            Open in Google Maps ↗
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
