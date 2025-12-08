# AQUA Hackathon - Architecture Decisions

## Executive Summary

This document defines the technical architecture for the AQUA frontend application, optimized for:
- **2-day hackathon timeline**
- **Pixel-perfect Figma matching**
- **Code quality for judging criteria (15 points)**
- **Desktop-optimized web experience**

---

## 1. Framework Selection: React 18 + Vite

**Decision: React 18 with Vite (NOT Next.js)**

### Justification

| Factor | React + Vite | Next.js |
|--------|--------------|---------|
| Setup Time | 2 minutes | 5 minutes |
| HMR Speed | Instant | Fast |
| SSR Needed? | No (desktop app) | Adds complexity |
| Learning Curve | Low | Medium (App Router) |
| Audio Libraries | Best ecosystem | Same |
| BFF Conflict | None | API routes duplicate BFF |

**Why Not Vue/Svelte:**
- Smaller ecosystem for audio visualization
- shadcn/ui is React-only
- Team velocity favors React familiarity

---

## 2. Technology Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Framework** | React + Vite | 18.x / 5.x | Fastest dev experience |
| **Language** | TypeScript | 5.x | Type safety required |
| **UI Library** | shadcn/ui + Radix | Latest | Pixel-perfect Figma matching |
| **Styling** | Tailwind CSS | 3.x | Rapid styling |
| **State (Server)** | TanStack Query | 5.x | Caching, loading states |
| **State (Client)** | Zustand | 4.x | Simple, performant |
| **Routing** | React Router | 6.x | Standard, declarative |
| **HTTP** | Axios | 1.x | Interceptors, error handling |
| **Audio** | WaveSurfer.js | 7.x | Best waveform visualization |
| **Charts** | Recharts | 2.x | Simple, React-native |
| **Tables** | TanStack Table | 8.x | Sorting, filtering, pagination |
| **Forms** | React Hook Form + Zod | Latest | Validation, performance |
| **Icons** | Lucide React | Latest | Consistent icon set |

---

## 3. Project Structure (Feature-First Architecture)

```
aqua-frontend/
src/
├── components/           # Shared UI components
│   ├── ui/               # shadcn/ui components (button, card, dialog, etc.)
│   ├── layout/           # Sidebar, Header, MainLayout, PageContainer
│   ├── audio/            # AudioPlayer, Waveform, PlaybackControls
│   ├── data-display/     # DataTable, StatusBadge, ScoreIndicator
│   └── feedback/         # LoadingSpinner, ErrorBoundary, EmptyState
│
├── features/             # Feature modules (self-contained)
│   ├── dashboard/        # DashboardPage + components + hooks
│   ├── calls/            # CallsPage, CallsList, CallFilters
│   ├── call-detail/      # CallDetailPage, TranscriptionPanel, ScorecardPanel
│   ├── upload/           # UploadPage, UploadDropzone, ProcessingStatus
│   ├── users/            # UsersPage, UserTable, UserForm
│   └── auth/             # LoginPage, ProtectedRoute
│
├── services/             # API layer
│   └── api/              # Axios client, calls.api.ts, users.api.ts, etc.
│
├── stores/               # Zustand stores
│   ├── auth-store.ts     # User, permissions, login/logout
│   ├── app-store.ts      # UI state, filters, sidebar
│   └── audio-store.ts    # Playback state, current time
│
├── types/                # TypeScript interfaces
├── hooks/                # Global hooks (useDebounce, useNotifications)
├── utils/                # Formatters, validators, helpers
├── lib/                  # Third-party configs
└── styles/               # globals.css
```

---

## 4. UI Component Library: shadcn/ui

### Why shadcn/ui (not MUI, Chakra, or Ant Design)

1. **Copy-paste components** - We own the code, full customization
2. **Pixel-perfect Figma matching** - No fighting framework defaults
3. **Radix primitives** - Accessibility built-in (ARIA, keyboard nav)
4. **Tailwind integration** - Consistent with our styling approach

### Components to Install

```bash
npx shadcn@latest add button card dialog dropdown-menu table tabs badge
npx shadcn@latest add progress accordion avatar toast skeleton select input
npx shadcn@latest add separator scroll-area sheet popover command checkbox
```

---

## 5. State Management Strategy

### Pattern: Server/Client State Separation

```
┌────────────────────────┐    ┌────────────────────┐
│   TanStack Query       │    │     Zustand        │
│   (Server State)       │    │   (Client State)   │
├────────────────────────┤    ├────────────────────┤
│ - API data             │    │ - UI state         │
│ - Caching              │    │ - Auth/user        │
│ - Loading/error states │    │ - Audio playback   │
│ - Background refetch   │    │ - Filters/search   │
│ - Optimistic updates   │    │ - Sidebar open     │
└────────────────────────┘    └────────────────────┘
```

### TanStack Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 30 * 60 * 1000,      // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## 6. API Integration Pattern

### Service Layer Architecture

```typescript
// services/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
})

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// services/api/calls.api.ts
export const callsApi = {
  getAll: (filters?: CallFilters) =>
    apiClient.get<Call[]>('/calls', { params: filters }),
  getById: (id: string) =>
    apiClient.get<Call>(`/calls/${id}`),
  getSummary: () =>
    apiClient.get<CallSummary[]>('/calls/summary'),
}

// Used in hooks
export const useCallsQuery = (filters?: CallFilters) => {
  return useQuery({
    queryKey: ['calls', filters],
    queryFn: () => callsApi.getAll(filters).then(r => r.data),
  })
}
```

---

## 7. Audio Playback: WaveSurfer.js

### Why WaveSurfer.js
- Most mature waveform visualization library
- Supports regions/markers for speaker diarization
- Timeline plugin for timestamp navigation
- Works with audio Blobs

### Component Architecture

```
AudioPlayer/
├── Waveform.tsx           # WaveSurfer canvas
├── PlaybackControls.tsx   # Play/pause, speed, volume
├── TimelineMarkers.tsx    # Sentiment/speaker color regions
└── TranscriptSync.tsx     # Highlight current transcript turn
```

### Key Features
- Speaker regions colored by sentiment (green/yellow/red)
- Click-to-seek on waveform
- Sync with transcription panel
- Playback speed control (0.5x, 1x, 1.5x, 2x)

---

## 8. BFF Layer Architecture - IMPLEMENTED

### Decision: Express.js BFF (Node.js) - COMPLETE

**Implementation Location:** `/project-implementation/aqua-bff/`

**Status:** Fully implemented and operational on Port 4000

### Why BFF is Required
1. **API Aggregation** - Combine JSON Server + .NET API via single entry point
2. **Security** - RBAC enforcement, PII sanitization
3. **Long-Polling** - NotificationService requirement
4. **CORS** - Single origin for frontend (ports 5173, 5174)

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.21.0 | HTTP server framework |
| http-proxy-middleware | 3.0.0 | API request proxying |
| cors | 2.8.5 | Cross-origin configuration |
| TypeScript | 5.6.0 | Type safety |
| tsx | 4.19.0 | Development server |

### BFF Endpoints (Implemented)

| Endpoint | Method | Target | Description |
|----------|--------|--------|-------------|
| `/health` | GET | BFF | Health check with upstream status |
| `/api/*` | ALL | JSON Server (:3000) | Proxy all JSON Server requests |
| `/audio-api/*` | ALL | .NET API (:8080) | Proxy all audio API requests |
| `/aggregated/calls/:id` | GET | Both | Combined call data + audio analysis |
| `/aggregated/analytics` | GET | JSON Server | Computed analytics metrics |
| `/notifications/poll` | GET | BFF | Long-polling (30s timeout) |
| `/notifications/push` | POST | BFF | Push notifications (demo/testing) |

### RBAC Middleware Implementation

```typescript
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'admin': ['*'],
  'team_lead': ['calls:read', 'calls:write', 'teams:read', 'analytics:read', 'overrides:write'],
  'qc_analyst': ['calls:read', 'calls:write', 'overrides:write', 'analytics:read'],
  'agent': ['calls:read:own', 'analytics:read:own']
}

function rbacMiddleware(requiredPermission: string) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] as string || 'agent'
    const permissions = ROLE_PERMISSIONS[userRole] || []
    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      next()
    } else {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' })
    }
  }
}
```

### PII Sanitization

```typescript
function sanitizePII(data: any): any {
  const piiFields = ['ssn', 'socialSecurityNumber', 'creditCard', 'bankAccount', 'password']
  // Recursively removes/redacts PII fields from API responses
}
```

### Long-Polling Implementation

```typescript
app.get('/notifications/poll', async (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous'
  const timeout = parseInt(req.query.timeout as string) || 30000
  const startTime = Date.now()

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
```

### Plug-and-Play Configuration

The BFF is designed for easy environment switching:

**Frontend (client.ts):**
```typescript
const BFF_URL = import.meta.env.VITE_BFF_URL || 'http://localhost:4000'
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${BFF_URL}/api`,
})
export const audioApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUDIO_API_URL || `${BFF_URL}/audio-api`,
})
```

**BFF (index.ts) - Upstream targets:**
```typescript
// Easily configurable proxy targets
app.use('/api', createProxyMiddleware({ target: 'http://localhost:3000' }))
app.use('/audio-api', createProxyMiddleware({ target: 'http://localhost:8080' }))
```

---

## 9. Authentication and RBAC

### Authentication Flow
1. User selects profile (mock login with userId)
2. BFF returns user + role + permissions
3. Store in Zustand (memory) + sessionStorage (persist tab)
4. PermissionGate component for conditional rendering

### RBAC Implementation

```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null
  role: Role | null
  permissions: string[]
  login: (profileId: number) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

// components/PermissionGate.tsx
export const PermissionGate = ({
  permission,
  children,
  fallback = null
}: Props) => {
  const hasPermission = useAuthStore(s => s.hasPermission)
  return hasPermission(permission) ? children : fallback
}

// Usage
<PermissionGate permission="upload">
  <UploadButton />
</PermissionGate>
```

---

## 10. Design System (From Figma)

### Typography
- Font Family: Inter
- Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)

### Font Sizes
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
```

### Colors
```css
/* Primary */
--slate-900: #0F172A;
--slate-800: #1E293B;
--slate-700: #334155;
--slate-600: #475569;
--slate-500: #64748B;
--slate-400: #94A3B8;
--slate-300: #CBD5E1;
--slate-200: #E2E8F0;
--slate-100: #F1F5F9;
--slate-50: #F8FAFC;

/* Sentiment */
--green-500: #22C55E;
--yellow-500: #EAB308;
--red-500: #EF4444;

/* Accent */
--blue-500: #3B82F6;
--blue-600: #2563EB;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 4px 6px rgba(0, 0, 0, 0.09);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

---

## 11. Setup Commands

### Frontend Setup

```bash
# Create project
npm create vite@latest aqua-frontend -- --template react-ts
cd aqua-frontend

# Core dependencies
npm install react-router-dom @tanstack/react-query zustand axios

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn@latest init

# Additional UI
npm install @tanstack/react-table recharts lucide-react
npm install class-variance-authority clsx tailwind-merge

# Audio
npm install wavesurfer.js

# Forms
npm install react-hook-form @hookform/resolvers zod

# Dev tools
npm install -D @types/node
```

### BFF Setup

```bash
mkdir bff && cd bff
npm init -y
npm install express cors helmet axios
npm install -D typescript @types/express @types/node @types/cors ts-node-dev
npx tsc --init
```

---

## 12. TypeScript Interfaces

```typescript
// types/call.ts
export interface Call {
  transactionId: string
  callId: string
  companyId: number
  projectId: number
  agentName: string
  audioName: string
  transcription: Transcription
  scoreCard: ScoreCard
  sentimentAnalisys: SentimentAnalysis
  anomaly: Anomaly
}

export interface Transcription {
  transcriptionText: string
  diarization: DiarizationEntry[]
}

export interface DiarizationEntry {
  turnIndex: number
  speaker: 'Agent' | 'Customer'
  text: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
}

export interface ScoreCard {
  groups: ScorecardGroup[]
}

export interface ScorecardGroup {
  groupId: number
  groupName: string
  questions: Question[]
}

export interface Question {
  id: number
  text: string
  score: number
  maxPoint: number
  result: 'Pass' | 'Fail'
  evidences: Evidence[]
  justification: string
}

export interface Evidence {
  turn: number
  text: string
}

export interface Anomaly {
  flag: 'Red' | 'Yellow' | 'Green'
  justification: string[]
}

// types/user.ts
export interface User {
  id: number
  name: string
  email: string
  roleId: number
}

export interface Role {
  id: number
  name: string
  permissions: string[]
}

export type Permission =
  | 'users'
  | 'scorecard'
  | 'teams'
  | 'companies'
  | 'projects'
  | 'roles'
  | 'monitor'
  | 'reports'
  | 'exportinfo'
  | 'upload'
  | 'reviewcalls'
  | 'score'
  | 'notes'
  | 'coachingcalls'
```

---

## 13. Architectural Principles

1. **Feature-First Organization** - Group by feature, not by file type
2. **Server/Client State Separation** - TanStack Query for API, Zustand for UI
3. **Colocation** - Keep hooks next to their components
4. **Single Responsibility** - One component, one job
5. **Type Everything** - No `any` types
6. **Fail Gracefully** - Loading, error, and empty states everywhere
7. **Document Shortcuts** - Mark hackathon compromises with TODO comments

---

## 14. Running All Services

### Service Architecture Flow

```
Frontend (5173) → BFF (4000) → JSON Server (3000)
                            → .NET API (8080)
```

### Startup Commands

```bash
# Terminal 1: JSON Server (port 3000) - Mock data API
cd project-resources/JSON\ Server/json-server
npx json-server db.json --port 3000

# Terminal 2: .NET Mock API (port 8080) - Audio processing
docker run -d -p 8080:8080 kevinricar24/api-core-ai:latest

# Terminal 3: BFF (port 4000) - API Aggregation Layer
cd project-implementation/aqua-bff
npm install    # First time only
npm run dev

# Terminal 4: Frontend (port 5173) - React SPA
cd project-implementation/aqua-frontend
npm run dev
```

### Verifying BFF is Running

```bash
# Health check
curl http://localhost:4000/health

# Test API proxy
curl http://localhost:4000/api/Calls

# Test aggregated endpoint
curl http://localhost:4000/aggregated/analytics
```

### Environment Variables (Optional)

```bash
# Frontend (.env)
VITE_BFF_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000/api
VITE_AUDIO_API_URL=http://localhost:4000/audio-api

# BFF
PORT=4000
```

---

This architecture is optimized for the hackathon timeline while maintaining code quality standards for the judging criteria.
