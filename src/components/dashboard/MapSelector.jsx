import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for Leaflet's default marker icon issue in React builds
delete L.Icon.Default.prototype._getIconUrl

// Custom DivIcons for styling markers using theme tokens
const bloodDropIcon = L.divIcon({
  html: `<div style="background-color: var(--color-blood); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px var(--color-blood);"></div>`,
  className: 'custom-blood-drop-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
})

const userPinIcon = L.divIcon({
  html: `<div style="background-color: var(--color-info); width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--color-info);"></div>`,
  className: 'custom-user-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
})

// Sub-component to dynamically fly/pan the map when the center query updates
function ChangeView({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: false })
    }
  }, [center, zoom, map])
  return null
}

export default function MapSelector({ center, markers = [], userLocation, radius, zoom = 12 }) {
  const mapCenter = center && center[0] && center[1] ? center : [20.5937, 78.9629] // Fallback to center of India

  return (
    <div className="map-container" style={{ height: '100%', minHeight: '350px' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        
        {/* Premium CartoDB Dark Matter tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Highlight search radius circle around user location */}
        {userLocation && userLocation[0] && userLocation[1] && radius && (
          <Circle
            center={userLocation}
            radius={radius * 1000} // Radius in meters
            pathOptions={{ 
              color: 'var(--color-blood)', 
              fillColor: 'var(--color-blood)', 
              fillOpacity: 0.05,
              weight: 1
            }}
          />
        )}

        {/* Current user marker */}
        {userLocation && userLocation[0] && userLocation[1] && (
          <Marker position={userLocation} icon={userPinIcon}>
            <Popup>
              <div>
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dynamic Markers (Donors or Requests) */}
        {markers.map((marker) => {
          // Check if coordinates exist and follow GeoJSON [longitude, latitude] ordering
          const coords = marker.location?.coordinates
          if (!coords || coords.length < 2 || (coords[0] === 0 && coords[1] === 0)) return null

          // Leaflet expects [latitude, longitude] order
          const position = [coords[1], coords[0]]

          return (
            <Marker key={marker._id} position={position} icon={bloodDropIcon}>
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <h4>{marker.patientName ? `Patient: ${marker.patientName}` : marker.fullName}</h4>
                  
                  <div style={{ marginTop: '6px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <span className="badge badge-blood">{marker.bloodGroup}</span>
                    </div>
                    {marker.hospitalName && (
                      <div style={{ color: 'var(--color-text-primary)' }}>
                        🏥 {marker.hospitalName}
                      </div>
                    )}
                    {marker.unitsRequired && (
                      <div>
                        💧 Units needed: <strong>{marker.unitsRequired}</strong>
                      </div>
                    )}
                    {marker.totalDonations !== undefined && (
                      <div>
                        🤝 Donations: <strong>{marker.totalDonations}</strong>
                      </div>
                    )}
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                      📍 {marker.city}, {marker.state}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
