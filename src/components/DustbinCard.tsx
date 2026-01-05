import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { MapPin, Trash2, Wifi, WifiOff } from 'lucide-react'

interface DustbinCardProps {
  dustbin: {
    id: string
    name: string
    location: string
    fillLevel: number
    isLive: boolean
    lastUpdated?: string
  }
  onClick?: () => void
}

export function DustbinCard({ dustbin, onClick }: DustbinCardProps) {
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

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-gray-600" />
              {dustbin.name}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              {dustbin.location}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              {dustbin.isLive ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-500">
                {dustbin.isLive ? 'Live' : 'Static'}
              </span>
            </div>
            <Badge variant={getStatusVariant(dustbin.fillLevel)}>
              {getStatusText(dustbin.fillLevel)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Fill Level</span>
            <span className="text-2xl">{dustbin.fillLevel}%</span>
          </div>
          
          <Progress 
            value={dustbin.fillLevel} 
            className="h-3"
          />
          
          <div className={`w-3 h-3 rounded-full ${getStatusColor(dustbin.fillLevel)} ml-auto`} />
          
          {dustbin.lastUpdated && (
            <div className="text-xs text-gray-500 mt-2">
              Last updated: {new Date(dustbin.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}