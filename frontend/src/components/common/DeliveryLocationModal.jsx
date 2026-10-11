import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  X,
  Search,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Home,
  Briefcase,
  Crosshair,
  Loader2
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet marker icon assets in Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default function DeliveryLocationModal({ isOpen, onClose, currentLocation, onLocationSelect }) {
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Active Map Position
  const [coords, setCoords] = useState({ lat: 12.9716, lon: 77.5946 }); // Default Bengaluru MG Road
  const [selectedAddressDetails, setSelectedAddressDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'map'

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Popular quick hubs
  const popularHubs = [
    { name: 'Bengaluru - 560001', area: 'MG Road, Indiranagar, Koramangala', lat: 12.9716, lon: 77.5946, pincode: '560001' },
    { name: 'Mumbai - 400001', area: 'Bandra, Fort, Colaba, Andheri', lat: 18.9388, lon: 72.8354, pincode: '400001' },
    { name: 'Delhi NCR - 110001', area: 'Connaught Place, South Ex, Gurgaon', lat: 28.6315, lon: 77.2167, pincode: '110001' },
    { name: 'Hyderabad - 500001', area: 'Banjara Hills, Hitec City, Jubilee Hills', lat: 17.3850, lon: 78.4867, pincode: '500001' }
  ];

  // Debounced Address Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/settings/geocode?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!isOpen || activeTab !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lon], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lon], { draggable: true }).addTo(map);

      marker.on('dragend', async () => {
        const newPos = marker.getLatLng();
        setCoords({ lat: newPos.lat, lon: newPos.lng });
        await handleReverseGeocode(newPos.lat, newPos.lng);
      });

      map.on('click', async (e) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        await handleReverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lon], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lon]);
      }
      mapInstanceRef.current.invalidateSize();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, activeTab, coords.lat, coords.lon]);

  // Reverse Geocoding helper
  const handleReverseGeocode = async (lat, lon) => {
    try {
      const res = await api.get(`/settings/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (res.data.success && res.data.address) {
        setSelectedAddressDetails(res.data.address);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Browser GPS Geolocation (Zepto-style "Detect Location")
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      notifyError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        
        try {
          const res = await api.get(`/settings/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          if (res.data.success && res.data.address) {
            const addr = res.data.address;
            setSelectedAddressDetails(addr);
            const chosenTitle = addr.shortLocation || `${addr.locality || addr.city} - ${addr.pincode}`;
            
            // Apply location
            onLocationSelect(chosenTitle, addr);
            success(`Detected delivery location: ${chosenTitle}`);
            onClose();
          } else {
            onLocationSelect(`Bengaluru - 560001`, null);
            onClose();
          }
        } catch {
          onLocationSelect(`Bengaluru - 560001`, null);
          onClose();
        } finally {
          setIsLocatingGps(false);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        let msg = 'Unable to fetch your GPS coordinates';
        if (err.code === 1) msg = 'Location permission denied. Please allow location access in your browser.';
        else if (err.code === 2) msg = 'Location position unavailable.';
        else if (err.code === 3) msg = 'Location request timed out.';
        notifyError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSearchResult = (item) => {
    const title = item.name ? `${item.name}, ${item.city}` : item.displayName.split(',')[0];
    const displayLocation = item.pincode ? `${title} - ${item.pincode}` : title;

    setCoords({ lat: item.lat, lon: item.lon });
    setSelectedAddressDetails(item);

    onLocationSelect(displayLocation, item);
    success(`Delivery location updated to: ${displayLocation}`);
    onClose();
  };

  const handleConfirmMapPin = () => {
    if (selectedAddressDetails) {
      const chosenTitle = selectedAddressDetails.shortLocation || selectedAddressDetails.displayName.split(',').slice(0, 2).join(',');
      onLocationSelect(chosenTitle, selectedAddressDetails);
    } else {
      onLocationSelect(`GPS Pin Location (${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)})`, { lat: coords.lat, lon: coords.lon });
    }
    success('Doorstep delivery point confirmed on map!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-cream-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-qcPurple-100 flex items-center justify-center text-qcPurple-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal-950 leading-tight">Choose Delivery Location</h3>
              <p className="text-[11px] text-gray-500">Live doorstep dispatch for freshly roasted makhana</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-cream-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Mode Switcher Bar */}
        <div className="p-4 border-b border-cream-200 space-y-3 bg-white">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for area, apartment, street or pincode..."
              className="w-full pl-9 pr-9 py-2.5 bg-cream-100 border border-cream-300 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:border-qcPurple-700 focus:ring-1 focus:ring-qcPurple-700"
              autoFocus
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-qcPurple-700 animate-spin absolute right-3 top-3" />
            ) : searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-qcPurple-700 text-white shadow-sm'
                  : 'bg-cream-100 text-charcoal-800 hover:bg-cream-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search & Hubs</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('map');
                handleReverseGeocode(coords.lat, coords.lon);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-qcPurple-700 text-white shadow-sm'
                  : 'bg-cream-100 text-charcoal-800 hover:bg-cream-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Interactive Map Pin</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Zepto-Style "Use Current Location" Button */}
          <button
            onClick={handleDetectCurrentLocation}
            disabled={isLocatingGps}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-qcPurple-50 via-white to-amber-50 border-2 border-qcPurple-200 hover:border-qcPurple-600 transition flex items-center justify-between group text-left shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-qcPurple-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                {isLocatingGps ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5 fill-white" />
                )}
              </div>
              <div>
                <p className="font-extrabold text-xs text-qcPurple-950 flex items-center gap-1.5">
                  <span>{isLocatingGps ? 'Acquiring GPS fix...' : 'Use Current Location'}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-qcGreen-100 text-qcGreen-800 text-[9px] font-black uppercase">
                    GPS
                  </span>
                </p>
                <p className="text-[11px] text-gray-500">
                  {isLocatingGps ? 'Connecting to device sensors...' : 'Detects your exact street & pincode automatically'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-qcPurple-700 group-hover:translate-x-0.5 transition-transform">
              Detect
            </span>
          </button>

          {/* TAB 1: SEARCH & ADDRESS LIST */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Autocomplete Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400">Search Results</span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full p-2.5 rounded-xl border border-cream-200 hover:border-qcPurple-400 bg-white hover:bg-qcPurple-50/40 text-left transition flex items-start gap-2.5"
                      >
                        <MapPin className="w-4 h-4 text-qcPurple-700 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-charcoal-950 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{item.displayName}</p>
                        </div>
                        {item.pincode && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-800 font-mono">
                            {item.pincode}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved User Addresses (if logged in) */}
              {user?.addresses && user.addresses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400">Saved Addresses</span>
                  <div className="space-y-2">
                    {user.addresses.map((addr) => (
                      <button
                        key={addr._id}
                        onClick={() => {
                          const title = `${addr.city} - ${addr.pincode}`;
                          onLocationSelect(title, addr);
                          success(`Delivering to saved address: ${addr.fullName}`);
                          onClose();
                        }}
                        className="w-full p-3 rounded-2xl border border-cream-300 hover:border-qcPurple-600 bg-cream-50/50 hover:bg-qcPurple-50/40 text-left transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-charcoal-700">
                            <Home className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-charcoal-900">{addr.fullName} ({addr.city})</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-xs">{addr.addressLine1 || addr.street}, {addr.pincode}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-qcPurple-700">Deliver</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Popular Hubs */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400">Popular Delivery Hubs</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularHubs.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        onLocationSelect(loc.name, loc);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                        currentLocation === loc.name
                          ? 'border-qcPurple-700 bg-qcPurple-50/60 ring-1 ring-qcPurple-700'
                          : 'border-cream-300 hover:border-gray-400 bg-cream-50/60 hover:bg-cream-100'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-charcoal-900">{loc.name}</p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{loc.area}</p>
                      </div>
                      <span className="text-[10px] font-extrabold text-qcGreen-700 bg-qcGreen-100 px-1.5 py-0.5 rounded-full shrink-0">
                        ⚡ Express
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE MAP PIN PICKER */}
          {activeTab === 'map' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-cream-300 shadow-inner">
                <div ref={mapContainerRef} className="h-64 w-full z-0" />
                <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-cream-300 text-[10px] font-bold text-charcoal-800 shadow-sm flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-qcPurple-700" />
                  <span>Click or drag pin to exact doorstep</span>
                </div>
              </div>

              {/* Pin Address Preview */}
              <div className="bg-cream-100 p-3 rounded-2xl border border-cream-300 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-qcPurple-700 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-charcoal-950">
                    {selectedAddressDetails?.shortLocation || 'Pin Selected'}
                  </p>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    {selectedAddressDetails?.displayName || `Coordinates: ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfirmMapPin}
                className="w-full py-3 rounded-2xl bg-qcPurple-700 hover:bg-qcPurple-800 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Doorstep Location</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
