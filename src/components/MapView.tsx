import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react'

interface Dustbin {
  id: string
  name: string
  location: string
  fillLevel: number
  isLive: boolean
  lat: number
  lng: number
}

interface MapViewProps {
  dustbins: Dustbin[]
  onBack: () => void
  onViewDetails: (dustbin: Dustbin) => void
}

export function MapView({ dustbins, onBack, onViewDetails }: MapViewProps) {
  const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null)

  const getStatusColor = (fillLevel: number) => {
    if (fillLevel >= 80) return 'red'
    if (fillLevel >= 50) return 'orange'
    return 'green'
  }

  const getStatusVariant = (fillLevel: number): "default" | "secondary" | "destructive" | "outline" => {
    if (fillLevel >= 80) return 'destructive'
    if (fillLevel >= 50) return 'secondary'
    return 'default'
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
                <MapPin className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl">Map View</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Dustbin Locations</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="w-full h-full bg-gray-100 rounded-lg relative overflow-hidden">
                  {/* Simulated Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-50" />
                  
                  {/* Map Pins */}
                  {dustbins.map((dustbin, index) => {
                    const x = 10 + (index % 4) * 20 + Math.random() * 10
                    const y = 15 + Math.floor(index / 4) * 25 + Math.random() * 10
                    
                    return (
                      <div
                        key={dustbin.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => setSelectedBin(dustbin)}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center`}
                             style={{ backgroundColor: getStatusColor(dustbin.fillLevel) }}>
                          <Trash2 className="w-3 h-3 text-white" />
                        </div>
                        
                        {/* Tooltip */}
                        {selectedBin?.id === dustbin.id && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-3 min-w-[200px] z-10">
                            <div className="text-sm font-medium">{dustbin.name}</div>
                            <div className="text-xs text-gray-600">{dustbin.location}</div>
                            <div className="text-xs mt-1">Fill Level: {dustbin.fillLevel}%</div>
                            <Badge variant={getStatusVariant(dustbin.fillLevel)} className="mt-1">
                              {dustbin.fillLevel >= 80 ? 'Critical' : dustbin.fillLevel >= 50 ? 'Medium' : 'Low'}
                            </Badge>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Map Labels */}
                  <div className="absolute top-4 left-4 bg-white rounded-lg shadow p-3">
                    <h3 className="font-medium mb-2">Legend</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-xs">Low (0-49%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span className="text-xs">Medium (50-79%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-xs">Critical (80-100%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Bins</span>
                  <span className="font-medium">{dustbins.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <span className="font-medium text-red-600">
                    {dustbins.filter(bin => bin.fillLevel >= 80).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Medium</span>
                  <span className="font-medium text-orange-600">
                    {dustbins.filter(bin => bin.fillLevel >= 50 && bin.fillLevel < 80).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Low</span>
                  <span className="font-medium text-green-600">
                    {dustbins.filter(bin => bin.fillLevel < 50).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Bin Details */}
            {selectedBin && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Bin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedBin.name}</h3>
                    <p className="text-sm text-gray-600">{selectedBin.location}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Fill Level</span>
                      <span className="font-medium">{selectedBin.fillLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all`}
                        style={{
                          width: `${selectedBin.fillLevel}%`,
                          backgroundColor: getStatusColor(selectedBin.fillLevel)
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={getStatusVariant(selectedBin.fillLevel)}>
                      {selectedBin.fillLevel >= 80 ? 'Critical' : selectedBin.fillLevel >= 50 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Type</span>
                    <span className="text-sm">{selectedBin.isLive ? 'Live Monitor' : 'Static Data'}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => onViewDetails(selectedBin)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Bin List */}
            <Card>
              <CardHeader>
                <CardTitle>All Bins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {dustbins.map((dustbin) => (
                    <div
                      key={dustbin.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedBin?.id === dustbin.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedBin(dustbin)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{dustbin.name}</div>
                          <div className="text-xs text-gray-600">{dustbin.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{dustbin.fillLevel}%</div>
                          <Badge variant={getStatusVariant(dustbin.fillLevel)} className="text-xs">
                            {dustbin.fillLevel >= 80 ? 'Critical' : dustbin.fillLevel >= 50 ? 'Medium' : 'Low'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}