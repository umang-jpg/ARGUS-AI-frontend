import { useState, useEffect } from 'react'
import supabase from '../supabase'
import Navbar from '../components/Navbar'
import './GlassUI.css'

const DEVICE_ID = 'argus-device-01'

export default function Dashboard() {
  const [device, setDevice] = useState(null)
  const [hazards, setHazards] = useState([])
  const [crashes, setCrashes] = useState([])
  const [rides, setRides] = useState([])
  const [form, setForm] = useState({ owner_name: '', phone: '', contact1: '', contact2: '', contact3: '', emergency1: '', emergency2: '' })
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('profile')
  const [reportModal, setReportModal] = useState(null)
  const [reportLoading, setReportLoading] = useState(null)

  const BACKEND_URL = "https://your-railway-app.up.railway.app"
  // This will be replaced after Railway deploy — keep as placeholder for now

  useEffect(() => {
    async function load() {
      const { data: d } = await supabase.from('devices').select('*').eq('device_id', DEVICE_ID).single()
      const { data: h } = await supabase.from('hazards').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false }).limit(50)
      const { data: c } = await supabase.from('crashes').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false }).limit(20)
      const { data: r } = await supabase.from('rides').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false }).limit(10)
      if (d) { setDevice(d); setForm(d) }
      if (h) setHazards(h)
      if (c) setCrashes(c)
      if (r) setRides(r)
    }
    load()
  }, [])

  async function saveDevice() {
    const payload = { ...form, device_id: DEVICE_ID }
    if (device) {
      await supabase.from('devices').update(payload).eq('device_id', DEVICE_ID)
    } else {
      await supabase.from('devices').insert(payload)
    }
    setDevice(payload)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function generateReport(crash) {
    setReportLoading(crash.id)
    try {
      const crashTime = new Date(crash.created_at)
      const nearby = hazards.filter(h => {
        const dist = Math.sqrt(
          Math.pow(h.lat - crash.lat, 2) + Math.pow(h.lng - crash.lng, 2)
        )
        const timeDiff = Math.abs(new Date(h.created_at) - crashTime) / 60000
        return dist < 0.01 && timeDiff < 10
      })

      const res = await fetch(`${BACKEND_URL}/api/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crash_id: crash.id,
          lat: crash.lat,
          lng: crash.lng,
          sms_sent: crash.sms_sent,
          created_at: crash.created_at,
          device_id: crash.device_id,
          nearby_hazards: nearby,
        })
      })
      const data = await res.json()
      if (data.success) {
        setReportModal({ crash, report: data.report })
      } else {
        alert("Report generation failed. Check backend.")
      }
    } catch (err) {
      alert("Could not reach backend. Is Railway deployed?")
      console.error(err)
    }
    setReportLoading(null)
  }

  function downloadReport(reportModal) {
    const content = `
ARGUS AI — INCIDENT REPORT
Generated: ${new Date().toLocaleString()}
Device: ${reportModal.crash.device_id}
=============================

POLICE FIR DRAFT
----------------
${reportModal.report.fir_draft}

=============================

INSURANCE CLAIM SUMMARY
------------------------
${reportModal.report.insurance_summary}

=============================

MEDICAL HANDOFF NOTE
---------------------
${reportModal.report.medical_handoff}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `argus-incident-${reportModal.crash.id?.slice(0, 8) || 'report'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }


  const topZones = hazards.reduce((acc, h) => {
    const key = `${h.lat.toFixed(3)},${h.lng.toFixed(3)}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const sortedZones = Object.entries(topZones).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="page-bg-overlay pt-16">
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="liquid-glass glass-card shimmer" style={{ marginBottom: '30px' }}>
          <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '3px' }}>Rider Dashboard</h2>
          <p style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '5px' }}>Device ID: <span style={{ color: 'var(--racing-red)', fontWeight: 'bold' }}>{DEVICE_ID}</span></p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '25px', flexWrap: 'wrap' }}>
            {['profile', 'hazards', 'crashes', 'rides'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`glass-button ${tab === t ? 'active' : ''}`}
                style={{ background: tab === t ? 'var(--imperial-blue)' : 'rgba(250,250,248,0.05)', flex: 1, minWidth: '100px' }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {tab === 'profile' && (
          <div className="liquid-glass glass-card">
            <h3 style={{ marginTop: 0 }}>Device Registration</h3>
            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '25px' }}>Sync your device with emergency response networks.</p>
            {[
              { key: 'owner_name', label: 'Owner Name', placeholder: 'Full name' },
              { key: 'phone', label: 'Owner Phone', placeholder: '+91 XXXXXXXXXX' },
              { key: 'contact1', label: 'Family Contact 1', placeholder: '+91 XXXXXXXXXX' },
              { key: 'contact2', label: 'Family Contact 2', placeholder: '+91 XXXXXXXXXX' },
              { key: 'contact3', label: 'Family Contact 3', placeholder: '+91 XXXXXXXXXX' },
              { key: 'emergency1', label: 'Emergency Number 1', placeholder: '112 or hospital' },
              { key: 'emergency2', label: 'Emergency Number 2', placeholder: 'Local police' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: '15px' }}>
                <label className="glass-label">{label}</label>
                <input
                  className="glass-input"
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={saveDevice} className="glass-button">
                {device ? 'Update Registration' : 'Register AI Node'}
              </button>
              {saved && <span style={{ color: '#44ff44', fontSize: '0.9rem', fontWeight: 'bold' }}>✓ Securely Synced</span>}
            </div>
          </div>
        )}

        {tab === 'hazards' && (
          <div className="liquid-glass glass-card">
            <h3 style={{ marginTop: 0 }}>Hazard Telemetry</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              {[
                { label: 'Potholes', count: hazards.filter(h => h.hazard_class === 'pothole').length, color: 'var(--racing-red)' },
                { label: 'Pedestrians', count: hazards.filter(h => h.hazard_class === 'pedestrian').length, color: '#FAFAF8' },
                { label: 'Obstacles', count: hazards.filter(h => h.hazard_class === 'obstacle').length, color: '#888888' },
              ].map(({ label, count, color }) => (
                <div key={label} style={{ flex: 1, padding: '20px', background: 'rgba(250,250,248,0.03)', borderRadius: '15px', textAlign: 'center', border: '1px solid rgba(250,250,248,0.05)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: color }}>{count}</div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>{label}</div>
                </div>
              ))}
            </div>

            <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.8 }}>Critical Impact Zones</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedZones.length === 0
                ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Awaiting initial telemetry data...</p>
                : sortedZones.map(([coords, count]) => (
                  <div key={coords} style={{ padding: '12px 18px', borderRadius: '10px', background: 'rgba(237, 28, 36, 0.1)', borderLeft: '4px solid var(--racing-red)', fontSize: '0.85rem' }}>
                    🛰️ {coords} — <b style={{ color: 'var(--racing-red)' }}>{count} ACTIVE HAZARDS</b>
                  </div>
                ))
              }
            </div>

            <h4 style={{ marginTop: '30px', textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.8 }}>Recent Visual Detections</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
              {hazards.slice(0, 15).map(h => (
                <div key={h.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(250,250,248,0.05)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>{h.hazard_class?.toUpperCase()}</b> — <span style={{ opacity: 0.7 }}>{h.confidence ? `${(h.confidence * 100).toFixed(0)}% accuracy` : 'Verified'}</span></span>
                  <span style={{ opacity: 0.5 }}>{new Date(h.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'crashes' && (
          <div className="liquid-glass glass-card">
            <h3 style={{ marginTop: 0 }}>SOS Incident Log</h3>
            {crashes.length === 0
              ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>
                No critical incidents recorded. Safe travels.
              </p>
              : crashes.map(c => (
                <div key={c.id} style={{
                  padding: '20px',
                  border: '1px solid rgba(237,28,36,0.3)',
                  borderRadius: '15px',
                  marginBottom: '15px',
                  background: 'rgba(237,28,36,0.05)'
                }}>
                  <div style={{
                    color: 'var(--racing-red)',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    marginBottom: '10px'
                  }}>
                    🚨 CRITICAL CRASH DETECTED
                  </div>

                  <div style={{
                    fontSize: '0.85rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px'
                  }}>
                    <div>Coordinates: <b>{c.lat.toFixed(4)}, {c.lng.toFixed(4)}</b></div>
                    <div>Dispatch: <b style={{
                      color: c.sms_sent ? '#44ff44' : 'var(--racing-red)'
                    }}>{c.sms_sent ? 'COMPLETED' : 'FAILED'}</b></div>
                    <div style={{ gridColumn: 'span 2', opacity: 0.6 }}>
                      Timestamp: {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => generateReport(c)}
                    className="glass-button"
                    style={{
                      marginTop: '15px',
                      fontSize: '0.8rem',
                      padding: '10px 18px',
                      opacity: reportLoading === c.id ? 0.6 : 1
                    }}
                    disabled={reportLoading === c.id}
                  >
                    {reportLoading === c.id
                      ? '⏳ Generating Report...'
                      : '📄 Generate Incident Report'}
                  </button>
                </div>
              ))
            }

            {/* REPORT MODAL */}
            {reportModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.88)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}>
                <div className="liquid-glass glass-card" style={{
                  maxWidth: '720px',
                  width: '100%',
                  maxHeight: '88vh',
                  overflowY: 'auto',
                  position: 'relative'
                }}>

                  {/* Close button */}
                  <button
                    onClick={() => setReportModal(null)}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '18px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--floral-white)',
                      fontSize: '1.4rem',
                      cursor: 'pointer',
                      opacity: 0.7
                    }}
                  >✕</button>

                  {/* Modal header */}
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{
                      marginTop: 0,
                      color: 'var(--racing-red)',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      fontSize: '1rem'
                    }}>
                      📋 Argus AI — Incident Report
                    </h3>
                    <p style={{ opacity: 0.45, fontSize: '0.75rem', margin: 0 }}>
                      {new Date(reportModal.crash.created_at).toLocaleString()} ·
                      {reportModal.crash.lat.toFixed(4)}, {reportModal.crash.lng.toFixed(4)}
                    </p>
                  </div>

                  {/* Three report sections */}
                  {[
                    { key: 'fir_draft', label: '🚔 Police FIR Draft', color: '#ED1C24' },
                    { key: 'insurance_summary', label: '📋 Insurance Claim Summary', color: '#ffcc44' },
                    { key: 'medical_handoff', label: '🏥 Medical Handoff Note', color: '#44ddff' },
                  ].map(({ key, label, color }) => (
                    <div key={key} style={{
                      marginBottom: '20px',
                      padding: '18px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${color}22`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <b style={{
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                          color: color
                        }}>{label}</b>
                        <button
                          onClick={() => navigator.clipboard.writeText(
                            reportModal.report[key]
                          )}
                          className="glass-button"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.7rem',
                            background: 'rgba(255,255,255,0.06)'
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <p style={{
                        fontSize: '0.82rem',
                        lineHeight: '1.75',
                        opacity: 0.85,
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        color: 'var(--floral-white)'
                      }}>
                        {reportModal.report[key]}
                      </p>
                    </div>
                  ))}

                  {/* Download button */}
                  <button
                    onClick={() => downloadReport(reportModal)}
                    className="glass-button"
                    style={{ width: '100%', marginTop: '8px', letterSpacing: '1px' }}
                  >
                    ⬇ Download Full Report as .txt
                  </button>

                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'rides' && (
          <div className="liquid-glass glass-card">
            <h3 style={{ marginTop: 0 }}>Voyage Analytics</h3>
            {rides.length === 0
              ? <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No telemetry recorded for recent voyages.</p>
              : rides.map(r => (
                <div key={r.id} style={{ padding: '15px', border: '1px solid rgba(250,250,248,0.1)', borderRadius: '12px', marginBottom: '12px', background: 'rgba(250,250,248,0.02)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <b>🏍️ MISSION {r.id.slice(0, 6).toUpperCase()}</b>
                    <span style={{ color: 'var(--floral-white)', fontWeight: 'bold' }}>{r.distance_km ? `${r.distance_km.toFixed(1)} KM` : '--'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                    <span>Hazards Mitigated: <b>{r.hazards_encountered}</b></span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

      </div>
    </div>
  )
}
