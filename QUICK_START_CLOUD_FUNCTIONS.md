# Quick Start: Google Cloud Functions for MOLLER DB

This is a condensed version of the full setup guide. For complete details, see `GOOGLE_CLOUD_FUNCTIONS_SETUP.md`.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- Node.js 18 or 20
- Cloud SQL instance (MySQL or PostgreSQL)

## Quick Setup (30 minutes)

### 1. Create Functions Repository

```bash
mkdir moller-cloud-functions
cd moller-cloud-functions
git init

# Create structure
mkdir -p functions/{shared,auth,databases,schema,query,tables}
mkdir deployment
```

### 2. Enable Google Cloud APIs

```bash
export PROJECT_ID="moller-db-explorer"
export REGION="us-central1"

gcloud config set project $PROJECT_ID

gcloud services enable cloudfunctions.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Store Database Credentials

```bash
# Your Cloud SQL connection details
export INSTANCE_CONNECTION_NAME="your-project:region:instance"
export DB_USER="your-db-user"
export DB_PASSWORD="your-db-password"

# Store in Secret Manager
echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=-
echo -n "$DB_USER" | gcloud secrets create db-user --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding db-user \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Copy Function Code

Get the complete function implementations from `GOOGLE_CLOUD_FUNCTIONS_SETUP.md`:

- `functions/shared/db.js`
- `functions/shared/auth.js`
- `functions/shared/errors.js`
- `functions/auth/index.js`
- `functions/databases/index.js`
- `functions/schema/index.js`
- `functions/query/index.js`
- `functions/tables/index.js`

### 5. Add package.json to Each Function

```bash
# For each function directory (auth, databases, schema, query, tables)
cat > functions/auth/package.json << 'EOF'
{
  "name": "moller-auth-function",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "@google-cloud/cloud-sql-connector": "^1.3.0",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5"
  }
}
EOF

# Repeat for other functions (databases, schema, query, tables)
# They all use the same dependencies
```

### 6. Install Dependencies

```bash
for dir in functions/{auth,databases,schema,query,tables}; do
  cd $dir && npm install && cd ../..
done
```

### 7. Deploy Single Function (Test)

```bash
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
```

### 8. Test It

```bash
# Get function URL
FUNCTION_URL=$(gcloud functions describe authenticate --gen2 --region=$REGION --format='value(serviceConfig.uri)')

# Test authentication
curl -X POST $FUNCTION_URL \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

If you get a JSON response with a token, it works! ✅

### 9. Deploy All Functions

Copy the deployment script from `GOOGLE_CLOUD_FUNCTIONS_SETUP.md` to `deployment/deploy.sh`, then:

```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

### 10. Update Frontend

In your frontend app:

```bash
# Create .env file
echo "VITE_API_BASE_URL=https://$REGION-$PROJECT_ID.cloudfunctions.net" > .env
```

Copy the API integration code from `GOOGLE_CLOUD_FUNCTIONS_SETUP.md` section "Frontend Integration".

## Function URLs

After deployment, get your URLs:

```bash
gcloud functions list --gen2 --region=$REGION --format='table(name, url)'
```

You'll get URLs like:
- `https://us-central1-moller-db-explorer.cloudfunctions.net/authenticate`
- `https://us-central1-moller-db-explorer.cloudfunctions.net/getDatabases`
- `https://us-central1-moller-db-explorer.cloudfunctions.net/getSchema`
- `https://us-central1-moller-db-explorer.cloudfunctions.net/executeQuery`
- `https://us-central1-moller-db-explorer.cloudfunctions.net/getTableDetails`

## Estimated Cost

- **Development/Testing**: $10-25/month
- **Low Traffic Production**: $25-50/month
- **Medium Traffic**: $50-150/month

Most cost is Cloud SQL instance ($7-15/month for db-f1-micro).

## Key Commands

```bash
# View logs
gcloud functions logs read FUNCTION_NAME --gen2 --region=$REGION --limit=50

# Update a function
gcloud functions deploy FUNCTION_NAME --gen2 --source=./functions/FUNCTION_NAME

# Delete a function
gcloud functions delete FUNCTION_NAME --gen2 --region=$REGION

# List all functions
gcloud functions list --gen2 --region=$REGION
```

## Troubleshooting

**Can't connect to Cloud SQL?**
```bash
# Grant Cloud SQL client role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

**CORS errors?**

Update the `cors` configuration in each function to whitelist your frontend domain.

**Function timeout?**

Increase timeout (default 60s):
```bash
gcloud functions deploy FUNCTION_NAME --timeout=300s
```

## Next Steps

1. ✅ Test all endpoints with curl or Postman
2. ✅ Integrate with frontend using API helper functions
3. ✅ Set up monitoring in Cloud Console
4. ✅ Configure proper CORS for production domain
5. ✅ Implement proper user authentication (replace test auth)
6. ✅ Set up CI/CD with GitHub Actions

For complete implementation details, example code, and advanced configurations, refer to `GOOGLE_CLOUD_FUNCTIONS_SETUP.md`.
