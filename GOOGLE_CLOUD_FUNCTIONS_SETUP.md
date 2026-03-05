# Google Cloud Functions Setup Guide

This guide provides step-by-step instructions for setting up Google Cloud Functions to enable your MOLLER Database Explorer app to connect to a Google Cloud SQL database.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Repository Setup](#repository-setup)
4. [Google Cloud Project Setup](#google-cloud-project-setup)
5. [Cloud SQL Configuration](#cloud-sql-configuration)
6. [Function Implementation](#function-implementation)
7. [Deployment](#deployment)
8. [Frontend Integration](#frontend-integration)
9. [Security & Authentication](#security--authentication)
10. [Testing](#testing)
11. [Monitoring & Debugging](#monitoring--debugging)
12. [Cost Optimization](#cost-optimization)

---

## Overview

### Architecture

```
Browser (MOLLER App) → Cloud Functions → Cloud SQL Database
                           ↓
                     Secret Manager
```

### What You'll Build

A set of serverless Cloud Functions that provide REST API endpoints for:
- User authentication
- Database listing
- Schema exploration
- SQL query execution
- Table inspection

### Why Google Cloud Functions?

- ✅ Native Cloud SQL integration
- ✅ Automatic scaling (pay only for usage)
- ✅ No server management
- ✅ Built-in HTTPS
- ✅ Easy deployment from repository
- ✅ Private IP support via VPC connector

---

## Prerequisites

### Required Accounts & Tools

1. **Google Cloud Account**
   - Free tier available (12 months + $300 credit)
   - Credit card required for verification

2. **Install Google Cloud CLI**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Linux
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Windows
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

3. **Authenticate CLI**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

4. **Node.js** (v18 or v20 recommended)
   ```bash
   node --version  # Should be 18.x or 20.x
   ```

### Knowledge Requirements

- Basic SQL knowledge
- Basic JavaScript/Node.js
- Git basics
- Command line familiarity

---

## Repository Setup

### Step 1: Create Functions Repository

Create a new Git repository to hold your Cloud Functions code separately from your frontend app.

```bash
# Create a new directory for your functions
mkdir moller-cloud-functions
cd moller-cloud-functions

# Initialize Git repository
git init

# Create basic structure
mkdir -p functions/{auth,databases,schema,query,tables}
touch functions/package.json
touch .gcloudignore
touch README.md
```

### Step 2: Project Structure

Your functions repository should follow this structure:

```
moller-cloud-functions/
├── .gcloudignore           # Files to ignore when deploying
├── .gitignore              # Git ignore patterns
├── README.md               # Repository documentation
├── package.json            # Shared dependencies
├── functions/
│   ├── shared/             # Shared utilities
│   │   ├── db.js          # Database connection utilities
│   │   ├── auth.js        # Authentication helpers
│   │   └── errors.js      # Error handling
│   │
│   ├── auth/              # Authentication function
│   │   └── index.js
│   │
│   ├── databases/         # List databases function
│   │   └── index.js
│   │
│   ├── schema/            # Get database schema function
│   │   └── index.js
│   │
│   ├── query/             # Execute SQL queries function
│   │   └── index.js
│   │
│   └── tables/            # Get table details function
│       └── index.js
│
└── deployment/
    ├── deploy.sh          # Deployment script
    └── .env.template      # Environment variables template
```

### Step 3: Initialize Package.json

```bash
cd moller-cloud-functions
```

Create `package.json`:

```json
{
  "name": "moller-cloud-functions",
  "version": "1.0.0",
  "description": "Cloud Functions for MOLLER Database Explorer",
  "main": "index.js",
  "scripts": {
    "deploy": "bash deployment/deploy.sh",
    "test": "echo \"Tests coming soon\""
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "@google-cloud/cloud-sql-connector": "^1.3.0",
    "mysql2": "^3.6.5",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "eslint": "^8.54.0"
  }
}
```

### Step 4: Create .gitignore

```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
*.log
.DS_Store
*.swp
coverage/
.gcp-service-account.json
EOF
```

### Step 5: Create .gcloudignore

```bash
cat > .gcloudignore << 'EOF'
.git/
.gitignore
node_modules/
.env
.env.local
README.md
*.log
.DS_Store
deployment/.env.template
EOF
```

---

## Google Cloud Project Setup

### Step 1: Create a New Project

```bash
# Set your project ID (must be globally unique)
export PROJECT_ID="moller-db-explorer"
export REGION="us-central1"

# Create the project
gcloud projects create $PROJECT_ID --name="MOLLER Database Explorer"

# Set as current project
gcloud config set project $PROJECT_ID
```

### Step 2: Enable Required APIs

```bash
# Enable Cloud Functions API
gcloud services enable cloudfunctions.googleapis.com

# Enable Cloud SQL Admin API
gcloud services enable sqladmin.googleapis.com

# Enable Cloud Build API (for deploying functions)
gcloud services enable cloudbuild.googleapis.com

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Enable Serverless VPC Access API (for private IP)
gcloud services enable vpcaccess.googleapis.com

# Enable Compute Engine API
gcloud services enable compute.googleapis.com
```

### Step 3: Enable Billing

⚠️ **Important**: Billing must be enabled for Cloud Functions to work.

```bash
# Link billing account (get billing account ID from console)
gcloud billing accounts list

# Set billing account
gcloud billing projects link $PROJECT_ID \
  --billing-account=XXXXXX-XXXXXX-XXXXXX
```

Or via Console: https://console.cloud.google.com/billing

---

## Cloud SQL Configuration

### Option A: Create New Cloud SQL Instance

#### For MySQL:

```bash
# Set variables
export INSTANCE_NAME="moller-db"
export DB_ROOT_PASSWORD="$(openssl rand -base64 32)"
export DB_REGION="us-central1"

# Create Cloud SQL instance (MySQL 8.0)
gcloud sql instances create $INSTANCE_NAME \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=$DB_REGION \
  --root-password="$DB_ROOT_PASSWORD" \
  --backup \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --retained-backups-count=7

# Save the root password securely
echo "Root password: $DB_ROOT_PASSWORD" >> db-credentials.txt
echo "⚠️  SAVE THIS PASSWORD! Stored in db-credentials.txt"

# Create application database
gcloud sql databases create moller_parity \
  --instance=$INSTANCE_NAME

# Create application user
export DB_USER="moller_app"
export DB_PASSWORD="$(openssl rand -base64 24)"

gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password="$DB_PASSWORD"

echo "App user: $DB_USER" >> db-credentials.txt
echo "App password: $DB_PASSWORD" >> db-credentials.txt
```

#### For PostgreSQL:

```bash
# Create Cloud SQL instance (PostgreSQL 15)
gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$DB_REGION \
  --backup \
  --backup-start-time=03:00 \
  --enable-bin-log=false \
  --retained-backups-count=7

# Set postgres user password
gcloud sql users set-password postgres \
  --instance=$INSTANCE_NAME \
  --password="$DB_ROOT_PASSWORD"

# Create application database
gcloud sql databases create moller_parity \
  --instance=$INSTANCE_NAME

# Create application user
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password="$DB_PASSWORD"
```

### Option B: Use Existing Cloud SQL Instance

If you already have a Cloud SQL instance:

```bash
# List existing instances
gcloud sql instances list

# Set your instance name
export INSTANCE_NAME="your-existing-instance"

# Get connection name
export INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
  --format='value(connectionName)')

echo "Instance connection name: $INSTANCE_CONNECTION_NAME"
```

### Configure VPC Connector (for Private IP)

**Optional but recommended for production:**

```bash
# Create VPC connector for serverless access to private IP
gcloud compute networks vpc-access connectors create moller-connector \
  --region=$REGION \
  --range=10.8.0.0/28

# Configure Cloud SQL to use private IP
gcloud sql instances patch $INSTANCE_NAME \
  --network=projects/$PROJECT_ID/global/networks/default
```

### Store Credentials in Secret Manager

```bash
# Store database password
echo -n "$DB_PASSWORD" | gcloud secrets create db-password \
  --data-file=-

# Store database user
echo -n "$DB_USER" | gcloud secrets create db-user \
  --data-file=-

# Grant Cloud Functions access to secrets
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding db-user \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Function Implementation

### Step 1: Shared Utilities

Create `functions/shared/db.js`:

```javascript
const { Connector } = require('@google-cloud/cloud-sql-connector');
const mysql = require('mysql2/promise');

const connector = new Connector();
let pool = null;

async function getPool() {
  if (pool) return pool;

  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'information_schema';

  const clientOpts = await connector.getOptions({
    instanceConnectionName,
    ipType: 'PUBLIC',
  });

  pool = await mysql.createPool({
    ...clientOpts,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    await connector.close();
    pool = null;
  }
}

module.exports = { getPool, closePool };
```

Create `functions/shared/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

function generateToken(username) {
  return jwt.sign(
    { username, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  hashPassword,
  comparePassword,
};
```

Create `functions/shared/errors.js`:

```javascript
class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class DatabaseError extends Error {
  constructor(message = 'Database error', originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.originalError = originalError;
  }
}

class ValidationError extends Error {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function handleError(error, res) {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      type: error.name,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        originalError: error.originalError,
      }),
    },
  });
}

module.exports = {
  AuthenticationError,
  DatabaseError,
  ValidationError,
  handleError,
};
```

### Step 2: Authentication Function

Create `functions/auth/index.js`:

```javascript
const functions = require('@google-cloud/functions-framework');
const cors = require('cors')({ origin: true });
const { generateToken } = require('../shared/auth');
const { handleError, AuthenticationError } = require('../shared/errors');
const { getPool } = require('../shared/db');

functions.http('authenticate', async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const { username, password } = req.body;

      if (!username || !password) {
        throw new AuthenticationError('Username and password required');
      }

      const pool = await getPool();
      const [rows] = await pool.query('SELECT 1 as test');
      
      if (!rows || rows.length === 0) {
        throw new AuthenticationError('Database connection failed');
      }

      const token = generateToken(username);

      res.status(200).json({
        success: true,
        token,
        username,
        expiresIn: '24h',
      });
    } catch (error) {
      handleError(error, res);
    }
  });
});
```

### Step 3: List Databases Function

Create `functions/databases/index.js`:

```javascript
const functions = require('@google-cloud/functions-framework');
const cors = require('cors')({ origin: true });
const { verifyToken, extractToken } = require('../shared/auth');
const { handleError, AuthenticationError, DatabaseError } = require('../shared/errors');
const { getPool } = require('../shared/db');

functions.http('getDatabases', async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        throw new AuthenticationError('Invalid or missing token');
      }

      const pool = await getPool();
      
      const [databases] = await pool.query('SHOW DATABASES');

      const filteredDatabases = databases
        .map(db => Object.values(db)[0])
        .filter(name => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(name));

      res.status(200).json({
        success: true,
        databases: filteredDatabases,
        count: filteredDatabases.length,
      });
    } catch (error) {
      handleError(error, res);
    }
  });
});
```

### Step 4: Get Schema Function

Create `functions/schema/index.js`:

```javascript
const functions = require('@google-cloud/functions-framework');
const cors = require('cors')({ origin: true });
const { verifyToken, extractToken } = require('../shared/auth');
const { handleError, AuthenticationError, ValidationError } = require('../shared/errors');
const { getPool } = require('../shared/db');

functions.http('getSchema', async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        throw new AuthenticationError('Invalid or missing token');
      }

      const database = req.query.database;
      if (!database) {
        throw new ValidationError('Database parameter required');
      }

      const pool = await getPool();

      const [tables] = await pool.query(
        `SELECT TABLE_NAME, TABLE_TYPE, ENGINE, TABLE_ROWS, 
                CREATE_TIME, UPDATE_TIME, TABLE_COMMENT
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ?
         ORDER BY TABLE_NAME`,
        [database]
      );

      const schemaData = await Promise.all(
        tables.map(async (table) => {
          const [columns] = await pool.query(
            `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, 
                    COLUMN_KEY, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT
             FROM information_schema.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
             ORDER BY ORDINAL_POSITION`,
            [database, table.TABLE_NAME]
          );

          return {
            name: table.TABLE_NAME,
            type: table.TABLE_TYPE,
            engine: table.ENGINE,
            rowCount: table.TABLE_ROWS,
            createdAt: table.CREATE_TIME,
            updatedAt: table.UPDATE_TIME,
            comment: table.TABLE_COMMENT,
            columns: columns.map(col => ({
              name: col.COLUMN_NAME,
              type: col.DATA_TYPE,
              fullType: col.COLUMN_TYPE,
              nullable: col.IS_NULLABLE === 'YES',
              key: col.COLUMN_KEY,
              default: col.COLUMN_DEFAULT,
              extra: col.EXTRA,
              comment: col.COLUMN_COMMENT,
            })),
          };
        })
      );

      res.status(200).json({
        success: true,
        database,
        tables: schemaData,
        count: schemaData.length,
      });
    } catch (error) {
      handleError(error, res);
    }
  });
});
```

### Step 5: Execute Query Function

Create `functions/query/index.js`:

```javascript
const functions = require('@google-cloud/functions-framework');
const cors = require('cors')({ origin: true });
const { verifyToken, extractToken } = require('../shared/auth');
const { handleError, AuthenticationError, ValidationError } = require('../shared/errors');
const { getPool } = require('../shared/db');

functions.http('executeQuery', async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        throw new AuthenticationError('Invalid or missing token');
      }

      const { database, query, limit = 100 } = req.body;

      if (!database || !query) {
        throw new ValidationError('Database and query required');
      }

      const sanitizedQuery = query.trim();
      const upperQuery = sanitizedQuery.toUpperCase();
      
      if (!upperQuery.startsWith('SELECT')) {
        throw new ValidationError('Only SELECT queries are allowed');
      }

      if (upperQuery.includes('DROP') || upperQuery.includes('DELETE') || 
          upperQuery.includes('UPDATE') || upperQuery.includes('INSERT') ||
          upperQuery.includes('ALTER') || upperQuery.includes('CREATE')) {
        throw new ValidationError('Modification queries not allowed');
      }

      const pool = await getPool();

      await pool.query(`USE ${database}`);

      const limitedQuery = sanitizedQuery.includes('LIMIT') 
        ? sanitizedQuery 
        : `${sanitizedQuery} LIMIT ${limit}`;

      const startTime = Date.now();
      const [rows, fields] = await pool.query(limitedQuery);
      const executionTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        database,
        query: limitedQuery,
        rows,
        rowCount: rows.length,
        columns: fields.map(f => ({
          name: f.name,
          type: f.type,
        })),
        executionTime,
      });
    } catch (error) {
      handleError(error, res);
    }
  });
});
```

### Step 6: Get Table Details Function

Create `functions/tables/index.js`:

```javascript
const functions = require('@google-cloud/functions-framework');
const cors = require('cors')({ origin: true });
const { verifyToken, extractToken } = require('../shared/auth');
const { handleError, AuthenticationError, ValidationError } = require('../shared/errors');
const { getPool } = require('../shared/db');

functions.http('getTableDetails', async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        throw new AuthenticationError('Invalid or missing token');
      }

      const { database, table } = req.query;

      if (!database || !table) {
        throw new ValidationError('Database and table parameters required');
      }

      const pool = await getPool();

      const [indexes] = await pool.query(
        `SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX
         FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
        [database, table]
      );

      const [foreignKeys] = await pool.query(
        `SELECT 
           CONSTRAINT_NAME,
           COLUMN_NAME,
           REFERENCED_TABLE_NAME,
           REFERENCED_COLUMN_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [database, table]
      );

      await pool.query(`USE ${database}`);
      const [preview] = await pool.query(`SELECT * FROM ${table} LIMIT 10`);

      res.status(200).json({
        success: true,
        database,
        table,
        indexes: indexes.map(idx => ({
          name: idx.INDEX_NAME,
          column: idx.COLUMN_NAME,
          unique: idx.NON_UNIQUE === 0,
          position: idx.SEQ_IN_INDEX,
        })),
        foreignKeys: foreignKeys.map(fk => ({
          name: fk.CONSTRAINT_NAME,
          column: fk.COLUMN_NAME,
          referencedTable: fk.REFERENCED_TABLE_NAME,
          referencedColumn: fk.REFERENCED_COLUMN_NAME,
        })),
        preview,
        previewCount: preview.length,
      });
    } catch (error) {
      handleError(error, res);
    }
  });
});
```

---

## Deployment

### Step 1: Create Deployment Script

Create `deployment/deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Deploying MOLLER Cloud Functions..."

PROJECT_ID=${GCP_PROJECT_ID:-"moller-db-explorer"}
REGION=${GCP_REGION:-"us-central1"}
INSTANCE_CONNECTION_NAME=${INSTANCE_CONNECTION_NAME}

if [ -z "$INSTANCE_CONNECTION_NAME" ]; then
  echo "❌ Error: INSTANCE_CONNECTION_NAME environment variable not set"
  echo "   Set it like: export INSTANCE_CONNECTION_NAME='project:region:instance'"
  exit 1
fi

gcloud config set project $PROJECT_ID

echo "📦 Deploying authenticate function..."
gcloud functions deploy authenticate \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./functions/auth \
  --entry-point=authenticate \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME \
  --set-secrets DB_USER=db-user:latest,DB_PASSWORD=db-password:latest

echo "📦 Deploying getDatabases function..."
gcloud functions deploy getDatabases \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./functions/databases \
  --entry-point=getDatabases \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME \
  --set-secrets DB_USER=db-user:latest,DB_PASSWORD=db-password:latest

echo "📦 Deploying getSchema function..."
gcloud functions deploy getSchema \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./functions/schema \
  --entry-point=getSchema \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME \
  --set-secrets DB_USER=db-user:latest,DB_PASSWORD=db-password:latest

echo "📦 Deploying executeQuery function..."
gcloud functions deploy executeQuery \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./functions/query \
  --entry-point=executeQuery \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME \
  --set-secrets DB_USER=db-user:latest,DB_PASSWORD=db-password:latest

echo "📦 Deploying getTableDetails function..."
gcloud functions deploy getTableDetails \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./functions/tables \
  --entry-point=getTableDetails \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME \
  --set-secrets DB_USER=db-user:latest,DB_PASSWORD=db-password:latest

echo "✅ All functions deployed successfully!"
echo ""
echo "📋 Function URLs:"
gcloud functions describe authenticate --gen2 --region=$REGION --format='value(serviceConfig.uri)'
gcloud functions describe getDatabases --gen2 --region=$REGION --format='value(serviceConfig.uri)'
gcloud functions describe getSchema --gen2 --region=$REGION --format='value(serviceConfig.uri)'
gcloud functions describe executeQuery --gen2 --region=$REGION --format='value(serviceConfig.uri)'
gcloud functions describe getTableDetails --gen2 --region=$REGION --format='value(serviceConfig.uri)'
```

Make it executable:

```bash
chmod +x deployment/deploy.sh
```

### Step 2: Set Environment Variables

```bash
# Get your instance connection name
gcloud sql instances describe $INSTANCE_NAME --format='value(connectionName)'

# Set for deployment
export INSTANCE_CONNECTION_NAME="your-project:region:instance-name"
export GCP_PROJECT_ID="moller-db-explorer"
export GCP_REGION="us-central1"
```

### Step 3: Install Dependencies

Each function needs its dependencies installed:

```bash
cd functions/auth && npm install && cd ../..
cd functions/databases && npm install && cd ../..
cd functions/schema && npm install && cd ../..
cd functions/query && npm install && cd ../..
cd functions/tables && npm install && cd ../..
```

Or create a script to do this automatically.

### Step 4: Deploy Functions

```bash
# From the root of your functions repository
./deployment/deploy.sh
```

This will take 3-5 minutes. You'll see output like:

```
Deploying function (may take a while - up to 2 minutes)...done.
availableMemoryMb: 256
buildId: ...
entryPoint: authenticate
httpsTrigger:
  url: https://us-central1-moller-db-explorer.cloudfunctions.net/authenticate
```

### Step 5: Save Function URLs

After deployment, save your function URLs:

```bash
# Save to a file for easy reference
cat > function-urls.txt << EOF
AUTHENTICATE_URL=$(gcloud functions describe authenticate --gen2 --region=$REGION --format='value(serviceConfig.uri)')
GET_DATABASES_URL=$(gcloud functions describe getDatabases --gen2 --region=$REGION --format='value(serviceConfig.uri)')
GET_SCHEMA_URL=$(gcloud functions describe getSchema --gen2 --region=$REGION --format='value(serviceConfig.uri)')
EXECUTE_QUERY_URL=$(gcloud functions describe executeQuery --gen2 --region=$REGION --format='value(serviceConfig.uri)')
GET_TABLE_DETAILS_URL=$(gcloud functions describe getTableDetails --gen2 --region=$REGION --format='value(serviceConfig.uri)')
EOF

cat function-urls.txt
```

---

## Frontend Integration

### Step 1: Create API Configuration

In your frontend app, create `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://us-central1-moller-db-explorer.cloudfunctions.net';

export const API_ENDPOINTS = {
  authenticate: `${API_BASE_URL}/authenticate`,
  getDatabases: `${API_BASE_URL}/getDatabases`,
  getSchema: `${API_BASE_URL}/getSchema`,
  executeQuery: `${API_BASE_URL}/executeQuery`,
  getTableDetails: `${API_BASE_URL}/getTableDetails`,
};

export async function authenticateUser(username: string, password: string) {
  const response = await fetch(API_ENDPOINTS.authenticate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  return response.json();
}

export async function fetchDatabases(token: string) {
  const response = await fetch(API_ENDPOINTS.getDatabases, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch databases');
  }

  return response.json();
}

export async function fetchSchema(token: string, database: string) {
  const url = `${API_ENDPOINTS.getSchema}?database=${encodeURIComponent(database)}`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schema');
  }

  return response.json();
}

export async function executeQuery(token: string, database: string, query: string, limit = 100) {
  const response = await fetch(API_ENDPOINTS.executeQuery, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ database, query, limit }),
  });

  if (!response.ok) {
    throw new Error('Query execution failed');
  }

  return response.json();
}

export async function fetchTableDetails(token: string, database: string, table: string) {
  const url = `${API_ENDPOINTS.getTableDetails}?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch table details');
  }

  return response.json();
}
```

### Step 2: Update Context to Use Real API

Update `src/contexts/ConnectionContext.tsx`:

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';

interface ConnectionContextType {
  isConnected: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  operation: string;
  token: string | null;
  setToken: (token: string | null) => void;
  setStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setOperation: (operation: string) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useKV<string | null>('auth-token', null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [operation, setOperation] = useState('Idle');

  const isConnected = status === 'connected' && token !== null;

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        status,
        operation,
        token,
        setToken,
        setStatus,
        setOperation,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider');
  }
  return context;
}
```

### Step 3: Update Components

Update `src/components/AuthLogin.tsx` to use real authentication:

```typescript
import { useState } from 'react';
import { authenticateUser } from '@/lib/api';
import { useConnection } from '@/contexts/ConnectionContext';
// ... rest of imports

export function AuthLogin({ onAuthenticate }: { onAuthenticate: (username: string, password: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken, setStatus } = useConnection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setStatus('connecting');

    try {
      const result = await authenticateUser(username, password);
      setToken(result.token);
      setStatus('connected');
      onAuthenticate(username, password);
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component
}
```

Similar updates for other components to use the real API.

### Step 4: Add Environment Variables

Create `.env` in your frontend project:

```bash
VITE_API_BASE_URL=https://us-central1-moller-db-explorer.cloudfunctions.net
```

---

## Security & Authentication

### Implement JWT Secret in Secret Manager

```bash
# Generate a strong secret
export JWT_SECRET=$(openssl rand -base64 64)

# Store in Secret Manager
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

# Grant access to Cloud Functions
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Update deployment script to include JWT secret:

```bash
--set-secrets DB_USER=db-user:latest,DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest
```

### Enable CORS Properly

For production, update CORS configuration in functions:

```javascript
const cors = require('cors')({
  origin: ['https://your-frontend-domain.com'],
  credentials: true,
});
```

### Implement Rate Limiting

Consider using Google Cloud Armor or Apigee for rate limiting in production.

---

## Testing

### Test Locally

```bash
# Install Functions Framework
npm install -g @google-cloud/functions-framework

# Test authenticate function
cd functions/auth
export INSTANCE_CONNECTION_NAME="your-project:region:instance"
export DB_USER="your-user"
export DB_PASSWORD="your-password"

npx @google-cloud/functions-framework --target=authenticate --port=8080

# In another terminal, test it
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### Test Deployed Functions

```bash
# Test authentication
curl -X POST https://us-central1-moller-db-explorer.cloudfunctions.net/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Save token from response
export TOKEN="your-jwt-token-here"

# Test get databases
curl https://us-central1-moller-db-explorer.cloudfunctions.net/getDatabases \
  -H "Authorization: Bearer $TOKEN"

# Test get schema
curl "https://us-central1-moller-db-explorer.cloudfunctions.net/getSchema?database=moller_parity" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Monitoring & Debugging

### View Logs

```bash
# View function logs
gcloud functions logs read authenticate --gen2 --region=$REGION --limit=50

# Follow logs in real-time
gcloud functions logs read getDatabases --gen2 --region=$REGION --limit=50 --follow
```

### Cloud Console Monitoring

1. Go to https://console.cloud.google.com/functions
2. Click on a function
3. View tabs: "Metrics", "Logs", "Testing"

### Set Up Alerts

```bash
# Create alert for function errors
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cloud Function Errors" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

---

## Cost Optimization

### Estimated Costs (Low Traffic)

- **Cloud Functions**: $0-5/month (2M requests in free tier)
- **Cloud SQL (db-f1-micro)**: $7-15/month
- **Secret Manager**: $0.06/secret/month
- **Network egress**: $0-2/month

**Total**: ~$10-25/month for development/testing

### Optimization Tips

1. **Use connection pooling** (already implemented)
2. **Set minimum instances to 0** for development
3. **Enable caching** in frontend for schema data
4. **Use Cloud SQL proxy** instead of public IP
5. **Delete unused Cloud SQL instances**
6. **Monitor Cloud Console billing dashboard**

### Free Tier Limits

- Cloud Functions: 2M invocations/month
- Cloud SQL: None (must pay for instance time)
- Secret Manager: 6 free secrets

---

## Troubleshooting

### Common Issues

**1. "Permission denied" errors**

```bash
# Grant Cloud Functions service account access to Cloud SQL
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

**2. "Cannot connect to Cloud SQL"**

Check:
- Instance connection name is correct
- Cloud SQL API is enabled
- Database exists
- User has permissions

**3. "CORS errors" in browser**

Update CORS configuration in function code to allow your frontend domain.

**4. "Token expired" errors**

Token expiry is 24h. Implement refresh logic or increase expiry time.

**5. "Out of memory" errors**

Increase function memory:

```bash
gcloud functions deploy FUNCTION_NAME --memory=512MB
```

---

## Next Steps

✅ **You now have:**
- Cloud Functions providing REST API
- Secure database connections
- JWT authentication
- Real-time query execution

📚 **Consider adding:**
- User management in database
- Query history/favorites
- Export results to CSV
- Scheduled backups
- Multi-region deployment
- CI/CD with GitHub Actions

---

## Appendix: Complete Repository Example

For a complete, working example repository, see the structure above and follow all implementation steps. The key files are:

- `functions/shared/db.js` - Database connection management
- `functions/shared/auth.js` - Authentication utilities
- `functions/auth/index.js` - Login endpoint
- `functions/databases/index.js` - List databases
- `functions/schema/index.js` - Get schema
- `functions/query/index.js` - Execute queries
- `deployment/deploy.sh` - Deployment automation

Keep this repository **separate** from your frontend code and deploy it independently.
