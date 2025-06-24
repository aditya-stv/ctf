# CyberArena CTF Platform

A modern, full-stack Capture The Flag (CTF) competition platform built with React, Node.js, and PostgreSQL. Features real-time leaderboards, challenge management, and a cyberpunk-themed interface.

## 🚀 Features

- **250 Pre-defined Login Credentials** - Ready for immediate event deployment
- **22 CTF Challenges** across 5 categories (Web Exploitation, Cryptography, Reverse Engineering, Forensics, Binary Exploitation)
- **Real-time Leaderboard** with live updates every 5 seconds
- **Admin Panel** with full challenge and user management
- **JWT Authentication** with secure token-based access
- **Responsive Cyberpunk UI** with terminal-style design
- **Flag Submission System** with instant feedback
- **Role-based Access Control** (Admin/Participant)

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **Tailwind CSS** with custom cyberpunk theme
- **shadcn/ui** component library
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js 18+** installed
- **PostgreSQL 14+** installed and running
- **npm** or **yarn** package manager
- **Git** for cloning the repository

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cyberarena-ctf
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using Local PostgreSQL

1. Create a PostgreSQL database:
```sql
CREATE DATABASE cyberarena_ctf;
```

2. Set environment variables:
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/cyberarena_ctf"
```

#### Option B: Using Docker (Optional)

```bash
docker run --name ctf-postgres -e POSTGRES_DB=cyberarena_ctf -e POSTGRES_USER=ctf -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
export DATABASE_URL="postgresql://ctf:password@localhost:5432/cyberarena_ctf"
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/cyberarena_ctf

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
NODE_ENV=development
PORT=5000
```

### 5. Database Migration

Push the schema to your database:

```bash
npm run db:push
```

### 6. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔐 Login Credentials

### Admin Account
- **Team ID**: `TEAM_001`
- **Access Token**: `CTF{RqdRTtQNhnZ016B2_1}` (auto-generated)

### Participant Accounts
- **Team IDs**: `TEAM_002` to `TEAM_250`
- **Access Tokens**: Auto-generated in CTF{...} format
- View all credentials in the Admin Panel → Users tab

## 📁 Project Structure

```
cyberarena-ctf/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   └── index.html
├── server/                 # Backend Express application
│   ├── auth.ts             # Authentication middleware
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── seedData.ts         # Database seeding
│   └── storage.ts          # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
├── components.json         # shadcn/ui configuration
├── drizzle.config.ts       # Database ORM configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 🎮 Usage Guide

### For Participants

1. **Login**: Use your assigned Team ID and Access Token
2. **Dashboard**: View your stats, recent activity, and leaderboard
3. **Challenges**: Browse and attempt challenges by category
4. **Submit Flags**: Use the flag submission form (format: `CTF{...}`)
5. **Leaderboard**: Track your rank and progress in real-time

### For Administrators

1. **Login**: Use admin credentials (`TEAM_001`)
2. **Challenge Management**: 
   - Create, edit, and delete challenges
   - View flags (visible only to admins)
   - Manage challenge categories and difficulty
3. **User Management**: 
   - View all registered teams
   - Add new participants manually
   - Monitor participant activity
   - Access login credentials
   - Grant admin privileges to users
4. **Event Configuration**: Manage event settings and parameters

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push          # Push schema changes
npm run db:generate      # Generate migrations
npm run db:studio        # Open Drizzle Studio

# Type checking
npm run type-check
```

### Development Workflow

1. **Frontend Development**: Hot reload available at `http://localhost:5000`
2. **Backend Development**: Server restarts automatically on changes
3. **Database Changes**: Use Drizzle ORM migrations
4. **Styling**: Modify Tailwind classes and custom CSS variables

### Adding New Challenges

1. **Via Admin Panel**: Use the web interface (recommended)
2. **Via Database**: Add to `server/seedData.ts` and re-seed
3. **Via SQL**: Direct database insertion

Example challenge structure:
```typescript
{
  title: "Challenge Name",
  description: "Challenge description and instructions",
  category: "Web Exploitation", // or Cryptography, etc.
  difficulty: "Medium", // Easy, Medium, Hard
  points: 300,
  flag: "CTF{your_flag_here}",
  hints: ["Hint 1", "Hint 2"],
  isActive: true
}
```

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_production_secret
PORT=80
```

### Build Process

```bash
# Install dependencies
npm ci

# Build frontend
npm run build

# Start production server
npm start
```

### Security Considerations

1. **JWT Secret**: Use a strong, random secret in production
2. **Database**: Enable SSL and use connection pooling
3. **HTTPS**: Deploy behind a reverse proxy with SSL
4. **Environment**: Never commit secrets to version control
5. **Access**: Restrict admin panel access by IP if needed

## 🎯 Challenge Categories

The platform includes challenges across these categories:

### Web Exploitation
- SQL Injection attacks
- Cross-Site Scripting (XSS)
- Command Injection
- Directory Traversal
- JWT Token Manipulation

### Cryptography
- Caesar and ROT13 ciphers
- Vigenère cipher
- Base64 encoding
- Hash collisions
- RSA attacks

### Reverse Engineering
- Binary analysis
- Assembly code review
- APK decompilation
- Simple crackmes

### Forensics
- Image steganography
- Network packet analysis
- Memory dump examination

### Binary Exploitation
- Buffer overflows
- Format string vulnerabilities
- Race conditions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string
psql $DATABASE_URL
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**Authentication Issues**
- Clear browser localStorage
- Check JWT_SECRET environment variable
- Verify token format in network requests

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

- Check the logs: `npm run dev` shows detailed error messages
- Database issues: Use `npm run db:studio` to inspect data
- Frontend issues: Check browser console for errors
- Backend issues: Check server logs for API errors

## 📊 Monitoring and Analytics

The platform includes built-in monitoring:

- **Real-time leaderboard updates**
- **Submission tracking and validation**
- **User activity monitoring**
- **Challenge completion statistics**
- **Admin dashboard with comprehensive metrics**

---

**Ready to host your CTF event? Follow the setup guide above and you'll be running in minutes!**