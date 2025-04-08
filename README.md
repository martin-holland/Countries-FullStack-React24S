# Countries Fullstack

A full-stack application with NestJS backend and React frontend.

## Project Structure

```shell
project-root/
├── backend/   # NestJS application
└── frontend/  # React application
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:

```bash
git clone <your-repository-url>
cd <project-directory>
```

2. Install all dependencies (both frontend and backend):

```bash
npm run install:all
```

## Development

Start both frontend and backend development servers:

```bash
npm run dev
```

The applications will be available at:

- Frontend: http://localhost:5180
- Backend: http://localhost:3000

### Available Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run install:all` - Install dependencies for both projects
- `npm run install:frontend` - Install frontend dependencies
- `npm run install:backend` - Install backend dependencies
- `npm run build` - Build both projects
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

## Environment Setup

1. Create a `.env` file in the backend directory:

```env
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Vite
- **Backend:**
  - NestJS
  - TypeScript
  - Supabase

## Development Notes

- The backend includes CORS configuration for the frontend port (5180)
- TypeScript is configured for both frontend and backend
- ESLint and Prettier are set up for code formatting
- Both applications include hot-reload functionality for development

Change to readme.
