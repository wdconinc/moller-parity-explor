# MOLLER Database Explorer

A web-based interface for exploring and querying the MOLLER experimental database hosted on Google Cloud SQL.

## Overview

This application provides a modern, intuitive interface for:
- Browsing database schemas
- Building and executing SQL queries
- Visualizing table relationships
- Exploring example queries
- Managing database connections

## Architecture

**Frontend**: React + TypeScript + Tailwind CSS (this repository)  
**Backend**: Google Cloud Functions (separate repository)  
**Database**: Google Cloud SQL (MySQL/PostgreSQL)

## Current Status

This repository contains the **frontend application only**. To enable actual database connectivity, you need to set up the backend Cloud Functions.

### Frontend Features (Implemented)
✅ Authentication UI  
✅ Database selection interface  
✅ Schema browser with table details  
✅ Visual query builder  
✅ Relationship diagram viewer  
✅ Example queries showcase  
✅ Connection status monitoring  

### Backend Setup (Required for Real Database Access)

The app currently displays a simulated interface using static schema data. To connect to a real Google Cloud SQL database, follow these guides:

📚 **[Complete Setup Guide](./GOOGLE_CLOUD_FUNCTIONS_SETUP.md)** - Comprehensive instructions for setting up Google Cloud Functions backend (60 min)

⚡ **[Quick Start Guide](./QUICK_START_CLOUD_FUNCTIONS.md)** - Condensed setup for experienced users (30 min)

📊 **[Connection Analysis](./CONNECTION_ANALYSIS.md)** - Technical details on why browsers can't connect directly to databases and comparison of backend options

## Repository Structure

```
moller-db-explorer/
├── src/
│   ├── components/          # React components
│   │   ├── AuthLogin.tsx
│   │   ├── DatabaseList.tsx
│   │   ├── SchemaBrowser.tsx
│   │   ├── QueryBuilder.tsx
│   │   ├── Relationships.tsx
│   │   └── ui/             # shadcn components
│   ├── contexts/           # React contexts
│   ├── lib/               # Utilities and helpers
│   │   ├── schema.ts      # Static schema data
│   │   └── api.ts         # API client (needs backend)
│   └── App.tsx            # Main application
├── GOOGLE_CLOUD_FUNCTIONS_SETUP.md  # Backend setup guide
├── QUICK_START_CLOUD_FUNCTIONS.md   # Quick reference
├── CONNECTION_ANALYSIS.md            # Technical architecture docs
└── PRD.md                           # Product requirements
```

## Getting Started (Frontend Only)

This will run the frontend with simulated data:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

**Note**: Without backend setup, the app will:
- Accept any username/password
- Show example databases
- Display static schema from `/src/lib/schema.ts`
- Generate SQL queries but cannot execute them

## Connecting to Real Database

To enable actual database connectivity:

1. **Set up Google Cloud SQL instance** (if you don't have one)
2. **Create and deploy Cloud Functions** (see setup guides)
3. **Update frontend configuration** with your function URLs
4. **Test authentication and queries**

Follow the **[Google Cloud Functions Setup Guide](./GOOGLE_CLOUD_FUNCTIONS_SETUP.md)** for complete instructions.

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Phosphor Icons** - Icon set
- **Vite** - Build tool

### Backend (Separate Repository)
- **Google Cloud Functions** - Serverless API
- **Cloud SQL Connector** - Database connections
- **MySQL2/pg** - Database drivers
- **JWT** - Authentication
- **CORS** - Cross-origin requests

## Key Features

### 🔒 Authentication
- Secure login interface
- JWT token-based auth (when backend is configured)
- Persistent sessions

### 📊 Database Explorer
- List all available databases
- Browse table schemas
- View column details, types, and constraints
- Inspect indexes and foreign keys

### 🔧 Query Builder
- Visual SQL query construction
- Syntax highlighting
- Query execution (requires backend)
- Result visualization

### 🔗 Relationship Viewer
- Visual table relationship diagrams
- Foreign key mapping
- Interactive exploration

### 📖 Example Queries
- Pre-built query templates
- Copy-to-clipboard functionality
- Educational descriptions

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```bash
# Backend API base URL (after deploying Cloud Functions)
VITE_API_BASE_URL=https://us-central1-your-project.cloudfunctions.net
```

## Documentation

- **[PRD.md](./PRD.md)** - Product requirements and design decisions
- **[GOOGLE_CLOUD_FUNCTIONS_SETUP.md](./GOOGLE_CLOUD_FUNCTIONS_SETUP.md)** - Complete backend setup
- **[QUICK_START_CLOUD_FUNCTIONS.md](./QUICK_START_CLOUD_FUNCTIONS.md)** - Quick reference
- **[CONNECTION_ANALYSIS.md](./CONNECTION_ANALYSIS.md)** - Architecture analysis

## Cost Estimate

When connected to Google Cloud:
- **Frontend hosting**: Free (GitHub Pages) or ~$0-5/month (Vercel/Netlify)
- **Cloud Functions**: ~$1-20/month (depending on usage)
- **Cloud SQL**: ~$7-15/month (db-f1-micro instance)
- **Total**: ~$10-40/month for low-moderate traffic

Free tier includes 2M Cloud Function invocations/month.

## Security Considerations

⚠️ **Important**: 
- Never commit database credentials to this repository
- Use Secret Manager for sensitive data in Cloud Functions
- Implement proper authentication before production deployment
- Only SELECT queries are allowed by default (no modifications)
- Enable CORS restrictions in production

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
