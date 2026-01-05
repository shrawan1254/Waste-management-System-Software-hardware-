import React, { useState, useEffect } from 'react'
import { DustbinCard } from './DustbinCard'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { useAuth } from './AuthProvider'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { useSupabase } from './SupabaseProvider'
import { Trash2, MapPin, BarChart3, Users, RefreshCw, AlertTriangle } from 'lucide-react'

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

interface DashboardProps {
  onViewDetails: (dustbin: Dustbin) => void
  onViewMap: () => void
  onViewAdmin: () => void
}

export function Dashboard({ onViewDetails, onViewMap, onViewAdmin }: DashboardProps) {
  const { user, signOut, isAdmin } = useAuth()
  const [dustbins, setDustbins] = useState<Dustbin[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = useSupabase()

  const fetchDustbins = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8719e5e4/dustbins`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDustbins(data)
      }
    } catch (error) {
      console.log('Error fetching dustbins:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const liveBin = dustbins.find(bin => bin.isLive)
      if (!liveBin) return

      setRefreshing(true)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8719e5e4/dustbins/live/${liveBin.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const updatedBin = await response.json()
        setDustbins(prev => 
          prev.map(bin => bin.id === liveBin.id ? updatedBin : bin)
        )
      }
    } catch (error) {
      console.log('Error fetching live data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDustbins()
  }, [])

  useEffect(() => {
    // Auto-refresh live data every 30 seconds
    const interval = setInterval(fetchLiveData, 30000)
    return () => clearInterval(interval)
  }, [dustbins])

  const criticalBins = dustbins.filter(bin => bin.fillLevel >= 80)
  const averageFillLevel = dustbins.length > 0 
    ? Math.round(dustbins.reduce((sum, bin) => sum + bin.fillLevel, 0) / dustbins.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Smart Dustbin Monitor</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchLiveData}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm" onClick={onViewMap}>
                <MapPin className="w-4 h-4 mr-2" />
                Map View
              </Button>
              
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={onViewAdmin}>
                  <Users className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Bins</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{dustbins.length}</div>
              <p className="text-xs text-muted-foreground">Active monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Critical Bins</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">{criticalBins.length}</div>
              <p className="text-xs text-muted-foreground">≥80% full</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Average Fill</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{averageFillLevel}%</div>
              <p className="text-xs text-muted-foreground">Across all bins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Live Monitoring</CardTitle>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{dustbins.filter(bin => bin.isLive).length}</div>
              <p className="text-xs text-muted-foreground">Real-time bins</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalBins.length > 0 && (
          <div className="mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {criticalBins.map(bin => (
                    <Badge key={bin.id} variant="destructive" className="cursor-pointer" onClick={() => onViewDetails(bin)}>
                      {bin.name} - {bin.fillLevel}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dustbin Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Dustbin Status</h2>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dustbins.map((dustbin) => (
              <DustbinCard
                key={dustbin.id}
                dustbin={dustbin}
                onClick={() => onViewDetails(dustbin)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}