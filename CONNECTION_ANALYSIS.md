# Database Connection Analysis

## Current State

This app **cannot actually connect** to the MOLLER database server at `db.moller12gev.org` as currently built. It's a frontend-only application that simulates database connectivity through the UI, but has no real backend connection capability.

## Why It Can't Connect

### 1. **Browser Security Restrictions**
- Web browsers cannot directly connect to PostgreSQL databases
- PostgreSQL uses a custom binary protocol (wire protocol) on port 5432
- Browsers only support HTTP/HTTPS protocols
- CORS (Cross-Origin Resource Sharing) policies prevent direct database connections

### 2. **Missing Backend API**
The code attempts to connect to:
```typescript
https://db.moller12gev.org/api/databases
```

This endpoint likely **does not exist**. The app would need a REST API or GraphQL backend that:
- Accepts HTTP requests from the browser
- Connects to PostgreSQL on the backend
- Proxies queries and returns results
- Handles authentication securely

### 3. **Credential Security Issues**
The current approach stores credentials in browser storage (`useKV`) and sends them via Basic Auth:
```typescript
'Authorization': 'Basic ' + btoa(`${username}:${password}`)
```

This is **insecure** because:
- Credentials are stored in localStorage (accessible to JavaScript)
- Basic Auth headers can be intercepted
- Database passwords should never be exposed to the frontend

## What Would Be Needed

### Option 1: Backend API Server (Recommended)

Create a Node.js/Python/Go backend service that:

```
Browser App → Backend API → PostgreSQL Database
```

**Backend Requirements:**
- REST or GraphQL API endpoints
- PostgreSQL client library (pg, psycopg2, etc.)
- Authentication middleware (JWT tokens, sessions)
- Query validation and sanitization
- Connection pooling

**Example API Endpoints:**
```
POST /api/auth/login          → Authenticate user
GET  /api/databases           → List available databases
GET  /api/schema/:database    → Get database schema
POST /api/query               → Execute SQL query
GET  /api/tables/:table       → Get table details
```

**Tech Stack Options:**
- **Node.js**: Express + pg (PostgreSQL client)
- **Python**: FastAPI + psycopg2
- **Go**: Gin + pgx
- **Ruby**: Rails + pg gem

### Option 2: PostgREST (Easier Alternative)

[PostgREST](https://postgrest.org/) is a standalone web server that:
- Automatically generates a REST API from PostgreSQL schema
- Handles authentication via JWT
- Supports filtering, joining, and complex queries
- No custom backend code needed

**Setup:**
```bash
# Install PostgREST
docker run -p 3000:3000 postgrest/postgrest

# Configure connection
export PGRST_DB_URI="postgres://user:pass@db.moller12gev.org:5432/dbname"
export PGRST_DB_SCHEMA="public"
export PGRST_JWT_SECRET="your-secret-key"
```

Then the frontend can query:
```typescript
fetch('http://your-server:3000/tables', {
  headers: {
    'Authorization': 'Bearer ' + jwtToken
  }
})
```

### Option 3: Serverless Functions

Use platforms like Vercel, Netlify, or AWS Lambda:

```
Browser → API Gateway → Lambda Function → PostgreSQL
```

**Example (Vercel):**
```typescript
// api/databases.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: 'db.moller12gev.org',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export default async function handler(req, res) {
  const { rows } = await pool.query('SELECT datname FROM pg_database');
  res.json({ databases: rows });
}
```

## What's Currently Implemented

The app **gracefully degrades** when connections fail:

1. **Authentication**: Accepts any username/password and stores them locally
2. **Database List**: Falls back to hardcoded example databases:
   - `moller_parity`
   - `moller_tracking`
   - `moller_slow_controls`
3. **Schema**: Uses static schema data from `/src/lib/schema.ts`
4. **Queries**: Generates SQL but cannot execute it
5. **Status Bar**: Shows simulated connection status

## Recommendation

To make this app **actually functional**, you need one of these approaches:

### Quickest Path (PostgREST):
1. Deploy PostgREST pointing to `db.moller12gev.org`
2. Configure JWT authentication
3. Update frontend to use PostgREST endpoints
4. Add query execution capabilities

### Most Flexible (Custom Backend):
1. Build Express/FastAPI backend
2. Implement authentication (JWT or session-based)
3. Create API endpoints for schema, queries, etc.
4. Deploy backend service (Heroku, Railway, AWS, etc.)
5. Update frontend to consume new API

### Simplest (Read-Only Schema Explorer):
If you don't need query execution, you could:
1. Export the database schema to JSON
2. Serve it as a static file
3. Keep the current frontend with static data
4. Add disclaimer that queries can't be executed

## Security Considerations

**Never expose:**
- Database credentials directly to the frontend
- Direct database ports to the internet
- User passwords in localStorage

**Always implement:**
- Backend authentication layer
- SQL injection prevention
- Rate limiting
- Input validation
- Encrypted connections (SSL/TLS)

## Current Code Locations

- **Connection attempts**: `src/components/DatabaseList.tsx` (line 42)
- **Credential storage**: `src/App.tsx` (line 19)
- **Static fallback data**: `src/lib/schema.ts`
- **Connection context**: `src/contexts/ConnectionContext.tsx`

## Next Steps

1. **Decide on backend approach** (PostgREST, custom API, or serverless)
2. **Set up backend service** with database connection
3. **Implement authentication** (JWT recommended)
4. **Update frontend** to use real API endpoints
5. **Add query execution** functionality
6. **Deploy both frontend and backend**

The current app is a **fully functional UI prototype** that needs a backend to become a real database explorer.
