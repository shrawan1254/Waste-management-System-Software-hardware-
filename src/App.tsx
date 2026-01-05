import React, { useState } from 'react'
import { SupabaseProvider } from './components/SupabaseProvider'
import { AuthProvider, useAuth } from './components/AuthProvider'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { MapView } from './components/MapView'
import { DustbinDetails } from './components/DustbinDetails'
import { AdminPanel } from './components/AdminPanel'

interface Dustbin {
  id: string
  name: string
  location: string
  fillLevel: number
  isLive: boolean
  lastUpdated?: string
  lat: number
  lng: number
}

type View = 'dashboard' | 'map' | 'details' | 'admin'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedDustbin, setSelectedDustbin] = useState<Dustbin | null>(null)
  const [dustbins, setDustbins] = useState<Dustbin[]>([])

  const handleViewDetails = (dustbin: Dustbin) => {
    setSelectedDustbin(dustbin)
    setCurrentView('details')
  }

  const handleViewMap = () => {
    setCurrentView('map')
  }

  const handleViewAdmin = () => {
    setCurrentView('admin')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedDustbin(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Smart Dustbin Monitor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  switch (currentView) {
    case 'map':
      return (
        <MapView
          dustbins={dustbins}
          onBack={handleBackToDashboard}
          onViewDetails={handleViewDetails}
        />
      )
    case 'details':
      return selectedDustbin ? (
        <DustbinDetails
          dustbin={selectedDustbin}
          onBack={handleBackToDashboard}
        />
      ) : (
        <Dashboard
          onViewDetails={handleViewDetails}
          onViewMap={handleViewMap}
          onViewAdmin={handleViewAdmin}
        />
      )
    case 'admin':
      return (
        <AdminPanel
          onBack={handleBackToDashboard}
        />
      )
    default:
      return (
        <Dashboard
          onViewDetails={handleViewDetails}
          onViewMap={handleViewMap}
          onViewAdmin={handleViewAdmin}
        />
      )
  }
}

export default function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SupabaseProvider>
  )
}