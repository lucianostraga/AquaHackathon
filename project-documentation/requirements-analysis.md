# AQUA Hackathon - Requirements Analysis

## Project Overview
Building UI for an AI-powered call center audit and audio evaluation system (AQUA).
- Backend already built - need Frontend + BFF (Backend for Frontend)
- Desktop-optimized web app, English only
- **Deadline: December 8th, 2025 - 2:00 PM GMT**

---

## Judging Criteria (100 points total)

| Category | Criteria | Points |
|----------|----------|--------|
| **AQUA Application (50 pts)** | Completeness & Functionality | 20 |
| | Code Quality & Architecture | 15 |
| | Creativity & "Wow" Factor | 15 |
| **AI Tool Usage (50 pts)** | Impact & Effectiveness | 20 |
| | Knowledge Transfer | 20 |
| | Breadth of Tooling | 10 |

---

## Technical Constraints

1. **Desktop-optimized** web app only (no mobile-responsive needed)
2. **English only** (no i18n)
3. **Open-source stack only**
4. **RESTful APIs only** (NO GraphQL)
5. **Long-polling** for notifications (not WebSockets)
6. **No PII in unencrypted client storage**
7. **Frontend displays data only** - backend handles all score calculations
8. **Manual file upload only** for MVP
9. **Role-Based Access Control** required
10. **100% Figma design match** required

---

## Available APIs

### .NET Mock API (Port 8080)
- `POST /IngestAudio` - Upload audio files
- `GET /Audios` - Retrieve audio data

### JSON Server (Port 3000)
| Endpoint | Description |
|----------|-------------|
| `/Calls` | Full call details with transcription, scores, sentiment |
| `/CallSummary` | Summary list of calls for the queue |
| `/Notifications` | For long-polling |
| `/Companies` | Company management |
| `/Projects` | Project management |
| `/Teams` | Team management |
| `/Users` | User management |
| `/Roles` | Role definitions with permissions |
| `/Agents` | Agent data |
| `/Profiles` | User profiles for auth |
| `/Configurations` | System configurations |

---

## Feature Prioritization

### P0 - Critical (MVP Must-Haves)

| Feature | Screen | Acceptance Criteria |
|---------|--------|---------------------|
| **Call Library** | Call Library | Display call list with table, search, filters, pagination |
| **Call Detail View** | Call Detail | Show Summary, Transcript, Overrides tabs |
| **Transcription Panel** | Call Detail - Transcript | Speaker diarization, sentiment colors, timestamps |
| **Scorecard Panel** | Call Detail - Summary | 5 groups (Opening, Paraphrasing, Solving, Closing, Interaction Health), collapsible, pass/fail indicators |
| **Audio Player** | Call Detail | Waveform, playback controls, sync with transcript |
| **Navigation/Layout** | All | Sidebar with menu items, header |
| **Role Selection/Login** | Login | Profile/role selection for mock auth |

### P1 - High Priority

| Feature | Screen | Acceptance Criteria |
|---------|--------|---------------------|
| **Upload Audio** | Upload Modals | Drag-and-drop, file list, progress |
| **Analytics Dashboard** | Dashboard | KPIs, charts, team performance |
| **Filter Modals** | Various | Date range, score filters, agent filters |
| **Notifications** | Header | Long-polling, badge count |

### P2 - Medium Priority (If Time Permits)

| Feature | Screen | Acceptance Criteria |
|---------|--------|---------------------|
| **Team Management** | Team Management | List, detail, create agent |
| **Companies** | Companies | List, add, detail with tabs |
| **Roles Management** | Roles | List, edit permissions |
| **Project Detail** | Project Detail | Overview, agents |

---

## Data Model Summary

### Call Object Structure
```
Call
├── transactionId: string
├── callId: string
├── companyId: number
├── projectId: number
├── agentName: string
├── audioName: string
├── transcription
│   ├── transcriptionText: string
│   └── diarization[]
│       ├── turnIndex: number
│       ├── speaker: "Agent" | "Customer"
│       ├── text: string
│       └── sentiment: "Positive" | "Neutral" | "Negative"
├── scoreCard
│   └── groups[]
│       ├── groupId: number
│       ├── groupName: string
│       └── questions[]
│           ├── id: number
│           ├── text: string
│           ├── score: number
│           ├── maxPoint: number
│           ├── result: "Pass" | "Fail"
│           ├── evidences[]
│           └── justification: string
├── sentimentAnalisys
│   ├── sentiment[] (per speaker)
│   └── summary: string
└── anomaly
    ├── flag: "Red" | "Yellow" | "Green"
    └── justification: string[]
```

### Scorecard Groups
1. Opening
2. Paraphrasing and Assurance
3. Solving the Issue
4. Closing
5. Interaction Health

---

## Role Permissions (RBAC)

| Role | Permissions |
|------|-------------|
| Entity Administrator | users, scorecard |
| Super Admin | teams, companies, projects, roles |
| Client side Stakeholder | monitor, reports |
| Customer Support Supervisor | monitor, reports, exportinfo |
| Customer Support Agent | reviewcalls, coachingcalls |
| Quality Control Analyst | upload, reviewcalls, score, notes, coachingcalls |

---

## Figma Screens (35 Total)

### Authentication
- [ ] Role Selection / Login

### Call Management
- [ ] Call Library (main dashboard with table)
- [ ] Call Detail - Summary Tab
- [ ] Call Detail - Transcript Tab
- [ ] Call Detail - Overrides Tab

### Upload Flow
- [ ] Upload Modal - Empty State
- [ ] Upload Modal - With Files
- [ ] Upload Modal - From Provider

### Administration
- [ ] Team Management - List
- [ ] Team Management - Member Detail
- [ ] Team Management - Create Agent
- [ ] Companies - List
- [ ] Companies - Add Modal
- [ ] Companies - Detail (Overview/Projects/Agents tabs)
- [ ] Project Detail
- [ ] Roles Management - List
- [ ] Roles Management - Edit Permissions

### Analytics
- [ ] Analytics Dashboard (KPIs, charts)
- [ ] Team Performance View

### Modals & Dialogs
- [ ] Date Range Filter
- [ ] Score Filter
- [ ] Success Confirmation

---

## Key Risks

| Risk | Mitigation |
|------|------------|
| Time constraint (2 days) | Focus strictly on P0 features |
| Figma complexity | Prioritize core screens, use design system |
| Audio player integration | Use proven library (WaveSurfer.js) |
| API connectivity | Test connections early |
| RBAC complexity | Implement simple permission gate pattern |

---

## Final Deliverables

1. Code repository with read access
2. Screencast/Demo video (max 5 minutes)
3. AI Tools Usage Presentation
4. Booked pitch slot

---

## Recommended Implementation Order

### Day 1: Foundation + Core
1. Project scaffolding and design system
2. Navigation/layout components
3. Call Library page with table
4. Call Detail page structure

### Day 2: Features + Polish
1. Audio player with waveform
2. Transcription panel with sync
3. Scorecard panel
4. Upload functionality
5. Polish and "wow" factor

### Before Deadline
1. Final testing
2. Demo video recording
3. Submission
