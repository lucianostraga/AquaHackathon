# AQUA - AI-Powered Call Center Audit System

AQUA is a modern web application for AI-powered call center audio evaluation and audit. Built with React, TypeScript, and Vite, it provides a comprehensive interface for managing and analyzing call center interactions.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Radix UI Components
- **State Management:** Zustand, TanStack Query
- **Audio Processing:** WaveSurfer.js
- **Charts:** Recharts
- **Testing:** Vitest, Testing Library

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Project Structure

```
AquaHackathon/
├── project-implementation/
│   └── aqua-frontend/          # React frontend application
├── project-resources/
│   ├── JSON Server/            # Mock API data server
│   ├── Documents/              # Project documents
│   └── Test Audio/             # Sample audio files
├── project-documentation/      # Architecture and requirements docs
├── start-servers.sh            # Script to start all services
└── README.md
```

## Quick Start

### Option 1: Using the Start Script (Recommended)

Run all services with a single command:

```bash
chmod +x start-servers.sh
./start-servers.sh
```

This will start:
- Docker Desktop
- Audio API (Docker container on port 8080)
- JSON Server (port 3000)
- Frontend dev server (port 5173)

### Option 2: Manual Setup

#### 1. Start the Audio API (Docker)

```bash
# Start Docker Desktop first, then run:
docker run -d --platform linux/amd64 -p 8080:8080 kevinricar24/api-core-ai:latest
```

#### 2. Start the JSON Server

```bash
cd project-resources/JSON\ Server/json-server
npx json-server db.json --port 3000
```

#### 3. Start the Frontend

```bash
cd project-implementation/aqua-frontend
npm install
npm run dev
```

## Available Services

| Service      | URL                     | Description                    |
|--------------|-------------------------|--------------------------------|
| Frontend     | http://localhost:5173   | Main web application           |
| JSON API     | http://localhost:3000   | Mock data API                  |
| Audio API    | http://localhost:8080   | Audio processing API (Docker)  |

## Frontend Scripts

Navigate to `project-implementation/aqua-frontend` and run:

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## API Documentation

A Postman collection is available at:
```
project-resources/JSON Server/Hackaton Collection.postman_collection.json
```

Import this collection into [Postman](https://www.postman.com/) to explore all available API endpoints.

## Stopping Services

If you used the start script, press `Ctrl+C` to stop all services.

To stop the Docker container manually:

```bash
docker ps                    # Find the container ID
docker stop <container_id>   # Stop the container
```

## Troubleshooting

### Port Conflicts

If a port is already in use, you can change the port mapping:

```bash
# For Docker (change 8080 to another port)
docker run -d -p 8081:8080 kevinricar24/api-core-ai:latest

# For JSON Server
npx json-server db.json --port 3001
```

### Docker Issues on Apple Silicon

If running on an M1/M2 Mac and encountering issues, ensure you're using the platform flag:

```bash
docker run -d --platform linux/amd64 -p 8080:8080 kevinricar24/api-core-ai:latest
```

## License

This project was created for the AQUA Hackathon.
