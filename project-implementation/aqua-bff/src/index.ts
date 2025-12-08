import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
const PORT = process.env.PORT || 4000

// =============================================================================
// CORS Configuration - Single origin for frontend
// =============================================================================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role']
}))

app.use(express.json())

// =============================================================================
// RBAC Middleware - Role-Based Access Control
// =============================================================================
interface UserRole {
  role: string
  permissions: string[]
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  'admin': ['*'],
  'team_lead': ['calls:read', 'calls:write', 'teams:read', 'analytics:read', 'overrides:write'],
  'qc_analyst': ['calls:read', 'calls:write', 'overrides:write', 'analytics:read'],
  'agent': ['calls:read:own', 'analytics:read:own']
}

function rbacMiddleware(requiredPermission: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = req.headers['x-user-role'] as string || 'agent'
    const permissions = ROLE_PERMISSIONS[userRole] || []

    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      next()
    } else {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' })
    }
  }
}

// =============================================================================
// PII Sanitization - Remove sensitive data from responses
// =============================================================================
function sanitizePII(data: any): any {
  if (!data) return data
  if (Array.isArray(data)) return data.map(sanitizePII)
  if (typeof data !== 'object') return data

  const sanitized = { ...data }
  const piiFields = ['ssn', 'socialSecurityNumber', 'creditCard', 'bankAccount', 'password']

  for (const field of piiFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***'
    }
  }

  return sanitized
}

// =============================================================================
// Health Check Endpoint
// =============================================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'aqua-bff',
    timestamp: new Date().toISOString(),
    upstreams: {
      jsonServer: 'http://localhost:3000',
      dotnetApi: 'http://localhost:8080'
    }
  })
})

// =============================================================================
// API Aggregation Routes
// =============================================================================

// Proxy to JSON Server (mock data) - /api/*
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  on: {
    proxyRes: (proxyRes, req, res) => {
      proxyRes.headers['x-proxied-by'] = 'aqua-bff'
    }
  }
}))

// Proxy to .NET API (audio processing) - /audio-api/*
app.use('/audio-api', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: { '^/audio-api': '' },
  on: {
    proxyRes: (proxyRes, req, res) => {
      proxyRes.headers['x-proxied-by'] = 'aqua-bff'
    }
  }
}))

// =============================================================================
// Aggregated Endpoints - Combine data from multiple sources
// =============================================================================

// Aggregated call details - combines JSON Server + .NET API data
app.get('/aggregated/calls/:id', rbacMiddleware('calls:read'), async (req, res) => {
  try {
    const callId = req.params.id

    // Fetch from JSON Server
    const jsonServerResponse = await fetch(`http://localhost:3000/calls/${callId}`)
    const callData = await jsonServerResponse.json()

    // Try to fetch additional audio analysis from .NET API (if available)
    let audioAnalysis = null
    try {
      const dotnetResponse = await fetch(`http://localhost:8080/api/calls/${callId}/analysis`)
      if (dotnetResponse.ok) {
        audioAnalysis = await dotnetResponse.json()
      }
    } catch {
      // .NET API may not be available, continue without it
    }

    // Aggregate and sanitize
    const aggregated = sanitizePII({
      ...callData,
      audioAnalysis,
      _meta: {
        aggregatedAt: new Date().toISOString(),
        sources: ['json-server', audioAnalysis ? 'dotnet-api' : null].filter(Boolean)
      }
    })

    res.json(aggregated)
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate call data' })
  }
})

// Aggregated analytics - combines multiple data sources
app.get('/aggregated/analytics', rbacMiddleware('analytics:read'), async (req, res) => {
  try {
    // Fetch calls from JSON Server
    const callsResponse = await fetch('http://localhost:3000/calls')
    const calls = await callsResponse.json()

    // Calculate aggregated metrics
    const totalCalls = calls.length
    const flaggedCalls = calls.filter((c: any) => c.Flagged).length
    const avgScore = calls.reduce((sum: number, c: any) => sum + (c.scoreCard || 0), 0) / totalCalls

    res.json({
      summary: {
        totalCalls,
        flaggedCalls,
        avgScore: Math.round(avgScore),
        flagRate: Math.round((flaggedCalls / totalCalls) * 100)
      },
      _meta: {
        aggregatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate analytics' })
  }
})

// =============================================================================
// Long-Polling Notification Service
// =============================================================================
const pendingNotifications: Map<string, any[]> = new Map()

app.get('/notifications/poll', async (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous'
  const timeout = parseInt(req.query.timeout as string) || 30000

  const startTime = Date.now()

  // Long-poll: wait for notifications or timeout
  const checkNotifications = () => {
    const notifications = pendingNotifications.get(userId) || []

    if (notifications.length > 0) {
      pendingNotifications.set(userId, [])
      return res.json({ notifications })
    }

    if (Date.now() - startTime >= timeout) {
      return res.json({ notifications: [] })
    }

    setTimeout(checkNotifications, 1000)
  }

  checkNotifications()
})

// Endpoint to push notifications (for demo/testing)
app.post('/notifications/push', express.json(), (req, res) => {
  const { userId, notification } = req.body

  if (!pendingNotifications.has(userId)) {
    pendingNotifications.set(userId, [])
  }

  pendingNotifications.get(userId)!.push({
    ...notification,
    timestamp: new Date().toISOString()
  })

  res.json({ success: true })
})

// =============================================================================
// Start Server
// =============================================================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    AQUA BFF Server                            ║
║                                                               ║
║  Backend For Frontend - API Aggregation Layer                 ║
╠═══════════════════════════════════════════════════════════════╣
║  Status:     RUNNING                                          ║
║  Port:       ${PORT}                                            ║
║  Upstreams:                                                   ║
║    - JSON Server:  http://localhost:3000                      ║
║    - .NET API:     http://localhost:8080                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                   ║
║    /health              - Health check                        ║
║    /api/*               - Proxy to JSON Server                ║
║    /audio-api/*         - Proxy to .NET API                   ║
║    /aggregated/calls/:id - Aggregated call data              ║
║    /aggregated/analytics - Aggregated analytics              ║
║    /notifications/poll  - Long-polling notifications          ║
╚═══════════════════════════════════════════════════════════════╝
  `)
})
