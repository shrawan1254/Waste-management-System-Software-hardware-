import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Apply middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Initialize sample dustbin data
async function initializeSampleData() {
  try {
    const existingBins = await kv.getByPrefix('dustbin:')
    if (existingBins.length === 0) {
      const sampleBins = [
        { id: 'bin_001', name: 'Campus Main Gate', location: 'Main Entrance', lat: 40.7589, lng: -73.9851, fillLevel: 85, isLive: true },
        { id: 'bin_002', name: 'Library Corner', location: 'Central Library', lat: 40.7614, lng: -73.9776, fillLevel: 42, isLive: false },
        { id: 'bin_003', name: 'Cafeteria East', location: 'Student Cafeteria', lat: 40.7505, lng: -73.9934, fillLevel: 78, isLive: false },
        { id: 'bin_004', name: 'Parking Lot A', location: 'North Parking', lat: 40.7829, lng: -73.9654, fillLevel: 23, isLive: false },
        { id: 'bin_005', name: 'Science Building', location: 'Lab Complex', lat: 40.7484, lng: -73.9857, fillLevel: 91, isLive: false },
        { id: 'bin_006', name: 'Sports Complex', location: 'Gymnasium', lat: 40.7690, lng: -73.9782, fillLevel: 55, isLive: false },
        { id: 'bin_007', name: 'Admin Block', location: 'Administration', lat: 40.7549, lng: -73.9840, fillLevel: 12, isLive: false },
        { id: 'bin_008', name: 'Student Union', location: 'Activity Center', lat: 40.7505, lng: -73.9857, fillLevel: 67, isLive: false },
        { id: 'bin_009', name: 'Engineering Wing', location: 'Tech Building', lat: 40.7614, lng: -73.9857, fillLevel: 34, isLive: false },
        { id: 'bin_010', name: 'Medical Center', location: 'Health Services', lat: 40.7589, lng: -73.9776, fillLevel: 89, isLive: false }
      ]
      
      for (const bin of sampleBins) {
        await kv.set(`dustbin:${bin.id}`, bin)
      }
      console.log('Sample dustbin data initialized')
    }
    
    // Initialize admin user
    const adminExists = await kv.get('user_role:admin@dustbin.com')
    if (!adminExists) {
      await kv.set('user_role:admin@dustbin.com', 'admin')
      console.log('Admin user role initialized')
    }
  } catch (error) {
    console.log('Error initializing sample data:', error)
  }
}

// Initialize on startup
initializeSampleData()

// Auth middleware for protected routes
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return c.json({ error: 'Authorization required' }, 401)
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return c.json({ error: 'Invalid authorization' }, 401)
  }
  
  c.set('user', user)
  await next()
}

// Admin middleware
async function requireAdmin(c: any, next: any) {
  const user = c.get('user')
  const userRole = await kv.get(`user_role:${user.email}`)
  
  if (userRole !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  await next()
}

// Routes
app.get('/make-server-8719e5e4/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// User signup
app.post('/make-server-8719e5e4/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since email server isn't configured
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Set default user role
    await kv.set(`user_role:${email}`, 'user')
    
    return c.json({ message: 'User created successfully', user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Get dustbin data
app.get('/make-server-8719e5e4/dustbins', requireAuth, async (c) => {
  try {
    const dustbins = await kv.getByPrefix('dustbin:')
    return c.json(dustbins)
  } catch (error) {
    console.log('Error fetching dustbins:', error)
    return c.json({ error: 'Failed to fetch dustbins' }, 500)
  }
})

// Get live dustbin data (with Blynk integration)
app.get('/make-server-8719e5e4/dustbins/live/:id', requireAuth, async (c) => {
  try {
    const binId = c.req.param('id')
    const blynkToken = Deno.env.get('BLYNK_TOKEN')
    
    if (!blynkToken) {
      return c.json({ error: 'Blynk token not configured' }, 500)
    }
    
    // Get current bin data
    const binData = await kv.get(`dustbin:${binId}`)
    if (!binData) {
      return c.json({ error: 'Dustbin not found' }, 404)
    }
    
    try {
      // Fetch live data from Blynk (using virtual pin V1 for fill level)
      const blynkResponse = await fetch(`https://blynk.cloud/external/api/get?token=${########}&V1`)
      
      if (blynkResponse.ok) {
        const fillLevel = await blynkResponse.text()
        const numericFillLevel = parseInt(fillLevel) || binData.fillLevel
        
        // Update the bin with live data
        const updatedBin = {
          ...binData,
          fillLevel: Math.min(Math.max(numericFillLevel, 0), 100), // Clamp between 0-100
          lastUpdated: new Date().toISOString()
        }
        
        await kv.set(`dustbin:${binId}`, updatedBin)
        return c.json(updatedBin)
      } else {
        console.log('Blynk API error:', blynkResponse.status)
        return c.json(binData) // Return cached data if Blynk fails
      }
    } catch (blynkError) {
      console.log('Blynk connection error:', blynkError)
      return c.json(binData) // Return cached data if Blynk fails
    }
  } catch (error) {
    console.log('Error fetching live dustbin data:', error)
    return c.json({ error: 'Failed to fetch live dustbin data' }, 500)
  }
})

// Get historical data for a dustbin
app.get('/make-server-8719e5e4/dustbins/:id/history', requireAuth, async (c) => {
  try {
    const binId = c.req.param('id')
    const historyData = await kv.get(`dustbin_history:${binId}`)
    
    if (!historyData) {
      // Generate sample historical data
      const sampleHistory = []
      const now = new Date()
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
        sampleHistory.push({
          timestamp: timestamp.toISOString(),
          fillLevel: Math.floor(Math.random() * 100)
        })
      }
      
      await kv.set(`dustbin_history:${binId}`, sampleHistory)
      return c.json(sampleHistory)
    }
    
    return c.json(historyData)
  } catch (error) {
    console.log('Error fetching dustbin history:', error)
    return c.json({ error: 'Failed to fetch dustbin history' }, 500)
  }
})

// Admin: Get all users
app.get('/make-server-8719e5e4/admin/users', requireAuth, requireAdmin, async (c) => {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    if (error) {
      return c.json({ error: error.message }, 500)
    }
    
    // Get user roles
    const usersWithRoles = await Promise.all(
      users.users.map(async (user) => {
        const role = await kv.get(`user_role:${user.email}`) || 'user'
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'N/A',
          role,
          created_at: user.created_at
        }
      })
    )
    
    return c.json(usersWithRoles)
  } catch (error) {
    console.log('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Admin: Update user role
app.put('/make-server-8719e5e4/admin/users/:id/role', requireAuth, requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id')
    const { role } = await c.req.json()
    
    const { data: user, error } = await supabase.auth.admin.getUserById(userId)
    if (error || !user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    await kv.set(`user_role:${user.user.email}`, role)
    return c.json({ message: 'User role updated successfully' })
  } catch (error) {
    console.log('Error updating user role:', error)
    return c.json({ error: 'Failed to update user role' }, 500)
  }
})

// Admin: Update dustbin
app.put('/make-server-8719e5e4/admin/dustbins/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const binId = c.req.param('id')
    const updates = await c.req.json()
    
    const currentBin = await kv.get(`dustbin:${binId}`)
    if (!currentBin) {
      return c.json({ error: 'Dustbin not found' }, 404)
    }
    
    const updatedBin = { ...currentBin, ...updates }
    await kv.set(`dustbin:${binId}`, updatedBin)
    
    return c.json(updatedBin)
  } catch (error) {
    console.log('Error updating dustbin:', error)
    return c.json({ error: 'Failed to update dustbin' }, 500)
  }
})

// Admin: Get current user role
app.get('/make-server-8719e5e4/user/role', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const role = await kv.get(`user_role:${user.email}`) || 'user'
    return c.json({ role })
  } catch (error) {
    console.log('Error fetching user role:', error)
    return c.json({ error: 'Failed to fetch user role' }, 500)
  }
})

Deno.serve(app.fetch)