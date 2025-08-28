import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for different severity levels
const createSeverityIcon = (severity) => {
  let color;
  switch (severity) {
    case 'low': color = '#28a745'; break;
    case 'medium': color = '#ffc107'; break;
    case 'high': color = '#fd7e14'; break;
    case 'critical': color = '#dc3545'; break;
    default: color = '#6c757d';
  }
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const HazardsMap = ({ hazards, selectedHazard, onHazardSelect, mapPopupHazardId, onPopupClose }) => {
  const markerRefs = useRef({});

  // Effect to open popup when mapPopupHazardId changes
  useEffect(() => {
    if (mapPopupHazardId && markerRefs.current[mapPopupHazardId]) {
      const marker = markerRefs.current[mapPopupHazardId];
      // Open the popup programmatically
      marker.openPopup();
    }
  }, [mapPopupHazardId]);
  // Calculate center of map based on hazards
  const getMapCenter = () => {
    if (hazards.length === 0) {
      // Default to Israel center if no hazards
      return [31.5, 34.75];
    }
    
    const validHazards = hazards.filter(h => h.latitude && h.longitude);
    if (validHazards.length === 0) {
      return [31.5, 34.75];
    }
    
    const avgLat = validHazards.reduce((sum, h) => sum + h.latitude, 0) / validHazards.length;
    const avgLng = validHazards.reduce((sum, h) => sum + h.longitude, 0) / validHazards.length;
    
    return [avgLat, avgLng];
  };

  const center = getMapCenter();
  const zoom = hazards.length > 0 ? 8 : 7;

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hazards.map((hazard) => {
          if (!hazard.latitude || !hazard.longitude) return null;
          
          const position = [hazard.latitude, hazard.longitude];
          const icon = createSeverityIcon(hazard.severity);
          
          return (
            <React.Fragment key={hazard.id}>
              {/* Hazard marker */}
              <Marker
                position={position}
                icon={icon}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current[hazard.id] = ref;
                  } else {
                    delete markerRefs.current[hazard.id];
                  }
                }}
                eventHandlers={{
                  click: () => onHazardSelect && onHazardSelect(hazard),
                  popupclose: () => onPopupClose && onPopupClose()
                }}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                      {hazard.title || hazard.type || 'Untitled Hazard'}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                      {hazard.description || 'No description available'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        backgroundColor: (() => {
                          switch (hazard.severity) {
                            case 'low': return '#28a745';
                            case 'medium': return '#ffc107';
                            case 'high': return '#fd7e14';
                            case 'critical': return '#dc3545';
                            default: return '#6c757d';
                          }
                        })(),
                        color: 'white'
                      }}>
                        {(hazard.severity || 'medium').toUpperCase()}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        backgroundColor: hazard.status === 'active' ? '#d4edda' : '#f8d7da',
                        color: hazard.status === 'active' ? '#155724' : '#721c24'
                      }}>
                        {hazard.status || 'active'}
                      </span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#999' }}>
                      Reports: {hazard.reportsCount || hazard.reports_count || 0}
                    </p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Hazard radius circle */}
              {hazard.radius && (
                <Circle
                  center={position}
                  radius={hazard.radius}
                  pathOptions={{
                    color: (() => {
                      switch (hazard.severity) {
                        case 'low': return '#28a745';
                        case 'medium': return '#ffc107';
                        case 'high': return '#fd7e14';
                        case 'critical': return '#dc3545';
                        default: return '#6c757d';
                      }
                    })(),
                    fillColor: (() => {
                      switch (hazard.severity) {
                        case 'low': return '#28a745';
                        case 'medium': return '#ffc107';
                        case 'high': return '#fd7e14';
                        case 'critical': return '#dc3545';
                        default: return '#6c757d';
                      }
                    })(),
                    fillOpacity: 0.1,
                    weight: 2,
                    opacity: 0.6
                  }}
                />
              )}
              
              {/* Highlight selected hazard */}
              {selectedHazard && selectedHazard.id === hazard.id && (
                <Circle
                  center={position}
                  radius={Math.max(hazard.radius || 1000, 500)}
                  pathOptions={{
                    color: '#007bff',
                    fillColor: '#007bff',
                    fillOpacity: 0.05,
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '10, 10'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HazardsMap;
