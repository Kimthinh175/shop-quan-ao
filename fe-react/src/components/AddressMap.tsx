'use client';

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressMapProps {
  onLocationSelect: (address: string) => void;
}

export default function AddressMap({ onLocationSelect }: AddressMapProps) {
  const fallbackLngLat: [number, number] = [10.8231, 106.6297]; // Ho Chi Minh City [lat, lng]
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent double initialization

    let isMounted = true;

    // 1. Init map
    const map = L.map(mapContainerRef.current).setView(fallbackLngLat, 16);
    mapRef.current = map;

    // 2. Add OSM TileLayer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // 3. Add Draggable Marker
    const marker = L.marker(fallbackLngLat, { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Helper: Reverse Geocoding
    const getAddressFromCoords = async (lat: number, lng: number) => {
      if (!isMounted) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
          headers: { "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8" }
        });
        const data = await res.json();
        if (!isMounted) return;
        
        if (data && data.display_name) {
          onLocationSelect(data.display_name);
        } else {
          onLocationSelect("Không tìm thấy địa chỉ cụ thể.");
        }
      } catch (err) {
        console.error("Lỗi reverse geocoding:", err);
      }
    };

    // 4. Map Events
    map.on('click', (e) => {
      onLocationSelect("Đang tìm địa chỉ...");
      marker.setLatLng(e.latlng);
      getAddressFromCoords(e.latlng.lat, e.latlng.lng);
    });

    marker.on('dragend', () => {
      onLocationSelect("Đang tìm địa chỉ...");
      const position = marker.getLatLng();
      getAddressFromCoords(position.lat, position.lng);
    });

    // 5. Auto Geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return; // Prevent updating destroyed map
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 17);
          marker.setLatLng([latitude, longitude]);
          getAddressFromCoords(latitude, longitude);
        },
        (err) => {
          if (!isMounted) return;
          console.warn("Lỗi định vị:", err);
          getAddressFromCoords(fallbackLngLat[0], fallbackLngLat[1]);
        }
      );
    } else {
      getAddressFromCoords(fallbackLngLat[0], fallbackLngLat[1]);
    }

    // 6. Fix Modal 0x0 size issue
    const timeout = setTimeout(() => {
      if (isMounted && mapRef.current) {
        map.invalidateSize();
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&countrycodes=vn`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo([lat, lon], 17);
          markerRef.current.setLatLng([lat, lon]);
          
          // Fetch exact address for consistency
          const resRev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
            headers: { "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8" }
          });
          const dataRev = await resRev.json();
          if (dataRev && dataRev.display_name) {
            onLocationSelect(dataRev.display_name);
          }
        }
      } else {
        alert("Không tìm thấy địa chỉ này!");
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input Box */}
      <div className="flex gap-2 relative z-[400]">
        <input 
          type="text"
          placeholder="Tìm vị trí trên bản đồ..."
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-600 dark:bg-slate-800 dark:text-white relative z-[400]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button 
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 relative z-[400]"
        >
          {isSearching ? '...' : 'Tìm'}
        </button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef}
        className="w-full h-[300px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-[0]" 
      />
    </div>
  );
}
