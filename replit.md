# CyberArena CTF Platform

## Overview

CyberArena is a Capture The Flag (CTF) competition platform built with a modern full-stack architecture. The application provides a comprehensive platform for cybersecurity competitions, featuring challenge management, real-time leaderboards, flag submission systems, and administrative controls.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyber-themed design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (with Neon serverless driver)
- **Authentication**: JWT-based authentication with role-based access control
- **API Design**: RESTful API with structured error handling

### Development Environment
- **Platform**: Replit with integrated PostgreSQL
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Build System**: Vite for frontend bundling, esbuild for backend compilation

## Key Components

### Authentication System
- Pre-generated team credentials (250 teams with TEAM_001 format)
- JWT token-based authentication with 24-hour expiration
- Role-based access control (admin/participant)
- Secure token storage in localStorage

### Challenge Management
- Multiple challenge categories (Web Exploitation, Cryptography, Reverse Engineering, etc.)
- Difficulty-based scoring system (Easy: 100-200, Medium: 300-400, Hard: 500+ points)
- Flag format validation (CTF{...} pattern)
- Hint system for challenge assistance
- Admin challenge CRUD operations

### Scoring and Leaderboard
- Real-time leaderboard with live updates (5-second intervals)
- Dynamic ranking system based on total scores
- Challenge completion tracking
- User statistics and progress monitoring

### Admin Dashboard
- Challenge management interface
- User administration and monitoring
- Event configuration controls
- System statistics and analytics

## Data Flow

### Authentication Flow
1. User submits team ID and access token
2. Server validates credentials against pre-seeded database
3. JWT token generated and returned with user information
4. Client stores token and includes in subsequent API requests
5. Server middleware validates token on protected routes

### Challenge Submission Flow
1. User submits flag through submission form
2. Flag validated against challenge answer
3. Points awarded if correct, submission logged
4. User score and rank updated
5. Leaderboard refreshed across all clients

### Real-time Updates
- Leaderboard polling every 5 seconds
- Live score updates and rank changes
- Toast notifications for submission feedback

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Unstyled, accessible UI components
- **wouter**: Lightweight React router
- **react-hook-form**: Form validation and handling
- **zod**: TypeScript-first schema validation

### Development Dependencies
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution engine
- **tailwindcss**: Utility-first CSS framework
- **@types/***: TypeScript type definitions

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting
- **@replit/vite-plugin-cartographer**: Development tooling integration

## Deployment Strategy

### Development
- Single command startup: `npm run dev`
- Concurrent frontend and backend development
- Hot module replacement for instant feedback
- Automatic database provisioning on Replit

### Production Build
- Frontend: Vite static build to `dist/public`
- Backend: esbuild compilation to `dist/index.js`
- Single-server deployment with static file serving
- Environment-based configuration

### Environment Configuration
- Database URL from Replit environment
- JWT secret configuration
- Development vs production mode detection
- Automatic port configuration (5000 internal, 80 external)

## Changelog

Changelog:
- June 24, 2025. Initial setup
- June 24, 2025. Added 10 additional CTF challenges (22 total)
- June 24, 2025. Fixed authentication system with proper JWT token handling
- June 24, 2025. Admin panel now shows all login credentials and flags
- June 24, 2025. Flags are only visible to admin users in challenge management
- June 24, 2025. Created comprehensive README.md with setup instructions and documentation
- June 24, 2025. Added manual participant creation feature for admins
- June 24, 2025. Added contest start/end time functionality with countdown timers

## User Preferences

Preferred communication style: Simple, everyday language.