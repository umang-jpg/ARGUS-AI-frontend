import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import supabase from '../supabase'
import 'leaflet/dist/leaflet.css'
import './HazardMap.css'

const COLORS = {
  pothole: '#ED1C24', // Racing Red
  pedestrian: '#FAFAF8', // Floral White
  obstacle: '#888888' // Grey
}

export default function HazardMap() {
  const [hazards, setHazards] = useState([])
  const [crashes, setCrashes] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data: h } = await supabase.from('hazards').select('*').order('created_at', { ascending: false }).limit(500)
      const { data: c } = await supabase.from('crashes').select('*').limit(100)
      if (h) setHazards(h)
      if (c) setCrashes(c)
    }
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'all' ? hazards : hazards.filter(h => h.hazard_class === filter)

  return (
    <div className="hazard-map-container">
      {/* Glassmorphic Control Panel */}
      <div className="map-overlay">
        <div className="glass-panel shimmer">
          <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem', marginBottom: '10px' }}>ArgusAI Intelligence</h2>
          <p style={{ opacity: 0.7, lineHeight: '1.4', marginBottom: '20px', color: 'var(--floral-white)' }}>Live telemetry and multi-agent hazard detection stream.</p>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Detections</span>
              <span className="stat-value">{hazards.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active SOS</span>
              <span className="stat-value" style={{ color: 'var(--racing-red)' }}>{crashes.length}</span>
            </div>
          </div>

          <div className="filter-group" style={{ marginTop: '25px' }}>
            {['all', 'pothole', 'pedestrian', 'obstacle'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Panel */}
      <div className="legend-panel glass-panel" style={{ padding: '12px 18px', bottom: '20px', right: '20px', width: 'auto' }}>
        <div className="legend-item">
          <div className="dot" style={{ backgroundColor: COLORS.pothole }}></div>
          <span>Pothole</span>
        </div>
        <div className="legend-item">
          <div className="dot" style={{ backgroundColor: COLORS.pedestrian }}></div>
          <span>Pedestrian</span>
        </div>
        <div className="legend-item">
          <div className="dot" style={{ backgroundColor: COLORS.obstacle }}></div>
          <span>Obstacle</span>
        </div>
        <div className="legend-item">
          <div className="dot pulse" style={{ backgroundColor: '#0A0A0A', border: '2px solid #ED1C24' }}></div>
          <span>Crash Event</span>
        </div>
      </div>

      <MapContainer
        center={[19.076, 72.877]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {filtered.map((h, i) => (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lng]}
            radius={i === 0 ? 10 : 7}
            fillColor={COLORS[h.hazard_class] || '#666'}
            color="#FAFAF8"
            weight={1.5}
            fillOpacity={0.8}
            className={i === 0 ? 'pulse' : ''}
          >
            <Popup>
              <div style={{ color: '#0A0A0A' }}>
                <b style={{ color: COLORS[h.hazard_class], fontSize: '1.1rem' }}>{h.hazard_class?.toUpperCase()}</b>
                <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
                  Confidence: {h.confidence ? `${(h.confidence * 100).toFixed(0)}%` : 'Verified'}
                  <br />Source: {h.source}
                  <br /><span style={{ opacity: 0.7 }}>{new Date(h.created_at).toLocaleString()}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {crashes.map(c => (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={12}
            fillColor="#0A0A0A"
            color="#ED1C24"
            weight={3}
            fillOpacity={1}
            className="pulse"
          >
            <Popup>
              <div style={{ color: '#0A0A0A' }}>
                <b style={{ color: '#ED1C24', fontSize: '1.1rem' }}>🚨 CRASH DETECTED</b>
                <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
                  Device: {c.device_id}
                  <br />Emergency Contact Alerted: {c.sms_sent ? 'YES' : 'PENDING'}
                  <br /><span style={{ opacity: 0.7 }}>{new Date(c.created_at).toLocaleString()}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
