import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MapAndRoute from './pages/MapAndRoute'
import Dashboard from './pages/Dashboard'
import PageTransition from './components/PageTransition'
import RouteFlash from './components/RouteFlash'

export default function App() {
  return (
    <BrowserRouter>
      {/* Surgical Top Progress Wipe */}
      <RouteFlash />

      <Navbar />
      
      <PageTransition>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/map"       element={<MapAndRoute />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </PageTransition>
    </BrowserRouter>
  )
}
