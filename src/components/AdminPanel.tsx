import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { useAuth } from './AuthProvider'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { useSupabase } from './SupabaseProvider'
import { ArrowLeft, Users, Trash2, Edit, Save, X, Settings, RefreshCw } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

interface Dustbin {
  id: string
  name: string
  location: string
  fillLevel: number
  isLive: boolean
  lat: number
  lng: number
}

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [dustbins, setDustbins] = useState<Dustbin[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBin, setEditingBin] = useState<Dustbin | null>(null)
  const [message, setMessage] = useState('')
  const supabase = useSupabase()

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8719e5e4/admin/users`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.log('Error fetching users:', error)
    }
  }

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

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8719e5e4/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setMessage('User role updated successfully')
        fetchUsers()
      } else {
        setMessage('Failed to update user role')
      }
    } catch (error) {
      console.log('Error updating user role:', error)
      setMessage('Error updating user role')
    }
  }

  const updateDustbin = async (dustbin: Dustbin) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8719e5e4/admin/dustbins/${dustbin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dustbin),
      })

      if (response.ok) {
        setMessage('Dustbin updated successfully')
        setEditingBin(null)
        fetchDustbins()
      } else {
        setMessage('Failed to update dustbin')
      }
    } catch (error) {
      console.log('Error updating dustbin:', error)
      setMessage('Error updating dustbin')
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchDustbins()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading admin panel...</p>
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
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl">Admin Panel</h1>
              </div>
            </div>
            <Badge variant="default">Administrator</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="dustbins">Dustbin Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">{userItem.name}</TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                            {userItem.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={userItem.role}
                            onValueChange={(newRole) => updateUserRole(userItem.id, newRole)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dustbins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Dustbin Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Fill Level</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dustbins.map((dustbin) => (
                      <TableRow key={dustbin.id}>
                        <TableCell className="font-medium">{dustbin.name}</TableCell>
                        <TableCell>{dustbin.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{dustbin.fillLevel}%</span>
                            <div className={`w-2 h-2 rounded-full ${
                              dustbin.fillLevel >= 80 ? 'bg-red-500' :
                              dustbin.fillLevel >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={dustbin.isLive ? 'default' : 'secondary'}>
                            {dustbin.isLive ? 'Live' : 'Static'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingBin(dustbin)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Edit Dustbin</DialogTitle>
                                <DialogDescription>
                                  Update dustbin information and settings.
                                </DialogDescription>
                              </DialogHeader>
                              {editingBin && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                      Name
                                    </Label>
                                    <Input
                                      id="name"
                                      value={editingBin.name}
                                      onChange={(e) => setEditingBin({
                                        ...editingBin,
                                        name: e.target.value
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="location" className="text-right">
                                      Location
                                    </Label>
                                    <Input
                                      id="location"
                                      value={editingBin.location}
                                      onChange={(e) => setEditingBin({
                                        ...editingBin,
                                        location: e.target.value
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  {!editingBin.isLive && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="fillLevel" className="text-right">
                                        Fill Level
                                      </Label>
                                      <Input
                                        id="fillLevel"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editingBin.fillLevel}
                                        onChange={(e) => setEditingBin({
                                          ...editingBin,
                                          fillLevel: parseInt(e.target.value) || 0
                                        })}
                                        className="col-span-3"
                                      />
                                    </div>
                                  )}
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="lat" className="text-right">
                                      Latitude
                                    </Label>
                                    <Input
                                      id="lat"
                                      type="number"
                                      step="0.0001"
                                      value={editingBin.lat}
                                      onChange={(e) => setEditingBin({
                                        ...editingBin,
                                        lat: parseFloat(e.target.value) || 0
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="lng" className="text-right">
                                      Longitude
                                    </Label>
                                    <Input
                                      id="lng"
                                      type="number"
                                      step="0.0001"
                                      value={editingBin.lng}
                                      onChange={(e) => setEditingBin({
                                        ...editingBin,
                                        lng: parseFloat(e.target.value) || 0
                                      })}
                                      className="col-span-3"
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingBin(null)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => editingBin && updateDustbin(editingBin)}
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Blynk Integration</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Blynk Token Configuration</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        The Blynk token is securely stored in environment variables. This token enables real-time data fetching from your Blynk device for live dustbin monitoring.
                      </p>
                      <Badge variant="default">Token Status: Configured</Badge>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Live Monitoring Settings</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Refresh Interval: 30 seconds</p>
                        <p>• Virtual Pin: V1 (Fill Level)</p>
                        <p>• Data Range: 0-100%</p>
                        <p>• Live Bin: {dustbins.find(bin => bin.isLive)?.name || 'None configured'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Users</span>
                          <span className="text-2xl font-bold">{users.length}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Dustbins</span>
                          <span className="text-2xl font-bold">{dustbins.length}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Live Monitors</span>
                          <span className="text-2xl font-bold text-green-600">
                            {dustbins.filter(bin => bin.isLive).length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Critical Bins</span>
                          <span className="text-2xl font-bold text-red-600">
                            {dustbins.filter(bin => bin.fillLevel >= 80).length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}