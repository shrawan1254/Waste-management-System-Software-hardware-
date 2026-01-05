import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { useAuth } from './AuthProvider'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { useSupabase } from './SupabaseProvider'
import { ArrowLeft, MapPin, Trash2, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

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

interface HistoryData {
  timestamp: string
  fillLevel: number
}

interface DustbinDetailsProps {
  dustbin: Dustbin
  onBack: () => void
}

export function DustbinDetails({ dustbin, onBack }: DustbinDetailsProps) {
  const { user } = useAuth()
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentBin, setCurrentBin] = useState(dustbin)
  const supabase = useSupabase()

  const fetchHistoryData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8719e5e4/dustbins/${dustbin.id}/history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHistoryData(data)
      }
    } catch (error) {
      console.log('Error fetching history data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshLiveData = async () => {
    if (!dustbin.isLive) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      setRefreshing(true)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8719e5e4/dustbins/live/${dustbin.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const updatedBin = await response.json()
        setCurrentBin(updatedBin)
      }
    } catch (error) {
      console.log('Error refreshing live data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHistoryData()
  }, [dustbin.id])

  useEffect(() => {
    if (dustbin.isLive) {
      // Auto-refresh live data every 30 seconds
      const interval = setInterval(refreshLiveData, 30000)
      return () => clearInterval(interval)
    }
  }, [dustbin.isLive])

  const getStatusColor = (fillLevel: number) => {
    if (fillLevel >= 80) return 'bg-red-500'
    if (fillLevel >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = (fillLevel: number) => {
    if (fillLevel >= 80) return 'Critical'
    if (fillLevel >= 50) return 'Medium'
    return 'Low'
  }

  const getStatusVariant = (fillLevel: number): "default" | "secondary" | "destructive" | "outline" => {
    if (fillLevel >= 80) return 'destructive'
    if (fillLevel >= 50) return 'secondary'
    return 'default'
  }

  const formatChartData = (data: HistoryData[]) => {
    return data.map(item => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl">Dustbin Details</h1>
              </div>
            </div>
            
            {currentBin.isLive && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshLiveData}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentBin.name}</CardTitle>
                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {currentBin.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentBin.isLive ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Wifi className="w-4 h-4" />
                        <span className="text-sm">Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <WifiOff className="w-4 h-4" />
                        <span className="text-sm">Static</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fill Level Display */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{currentBin.fillLevel}%</div>
                  <Badge variant={getStatusVariant(currentBin.fillLevel)} className="mb-4">
                    {getStatusText(currentBin.fillLevel)}
                  </Badge>
                  <Progress value={currentBin.fillLevel} className="h-4" />
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(currentBin.fillLevel)} mr-2`} />
                  <span className="text-sm text-gray-600">
                    {currentBin.fillLevel >= 80 ? 'Requires immediate attention' :
                     currentBin.fillLevel >= 50 ? 'Monitor closely' : 'Operating normally'}
                  </span>
                </div>

                {/* Last Updated */}
                {currentBin.lastUpdated && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Last updated: {new Date(currentBin.lastUpdated).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-sm">{currentBin.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Coordinates</label>
                  <p className="text-sm">{currentBin.lat.toFixed(4)}, {currentBin.lng.toFixed(4)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Bin ID</label>
                  <p className="text-sm font-mono">{currentBin.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Schedule Collection
                </Button>
                <Button className="w-full" variant="outline">
                  Report Issue
                </Button>
                <Button className="w-full" variant="outline">
                  View on Map
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            {currentBin.isLive ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Fill Level Trend (24 Hours)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={formatChartData(historyData)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            label={{ value: 'Fill Level (%)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            labelFormatter={(value) => `Time: ${value}`}
                            formatter={(value) => [`${value}%`, 'Fill Level']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="fillLevel" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formatChartData(historyData)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            label={{ value: 'Fill Level (%)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            labelFormatter={(value) => `Time: ${value}`}
                            formatter={(value) => [`${value}%`, 'Fill Level']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="fillLevel" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Historical Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Static Data Source</h3>
                    <p className="text-gray-500">
                      This dustbin uses static data values. Historical trending is only available for live-monitored bins.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentBin.isLive ? 'Real-time' : 'Static'}
                    </div>
                    <div className="text-sm text-gray-600">Data Source</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentBin.fillLevel < 80 ? 'Normal' : 'Alert'}
                    </div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {100 - currentBin.fillLevel}%
                    </div>
                    <div className="text-sm text-gray-600">Capacity Remaining</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}