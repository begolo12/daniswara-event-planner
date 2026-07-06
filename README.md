# Daniswara Event Planner AI

PWA web/mobile application for corporate event planning powered by AI.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand
- **Backend**: Node.js + Express.js + Sequelize
- **Database**: MySQL 8
- **AI**: OpenAI-compatible API (configurable)

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Setup database (create tables + seed data)
npm run setup

# Start development (both client + server)
npm run dev
```

## Default Login
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@daniswara.com | password123 |
| Admin Event | event@daniswara.com | password123 |
| PIC Event | pic@daniswara.com | password123 |
| Viewer/Direksi | direksi@daniswara.com | password123 |

## Environment Variables

### Server (.env)
Copy `server/.env.example` to `server/.env` and configure:
- Database connection
- JWT secrets
- AI encryption key

### Client (.env)
Copy `client/.env.example` to `client/.env`:
- `VITE_API_URL=http://localhost:5000/api`

## Features
- AI-powered event generation (themes, timelines, rundowns, checklists, budgets, documents)
- Multi-role system (Super Admin, Admin Event, PIC Event, Viewer)
- 10+ event types with templates
- Document export (PDF/Word)
- Approval flow
- Calendar view
- Budget tracking
- Risk management
- PWA support
