import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{ padding: '12px 24px', background: '#111', display: 'flex', gap: '24px' }}>
      <Link to="/"          style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
      <Link to="/map"       style={{ color: '#fff', textDecoration: 'none' }}>Hazard Map</Link>
      <Link to="/route"     style={{ color: '#fff', textDecoration: 'none' }}>Safe Route</Link>
      <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
    </nav>
  )
}
