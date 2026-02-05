# Berez Backend

FastAPI backend for the Berez drinking fountain finder app.

## Local Development

### Prerequisites
- Python 3.8+
- MySQL 8.0+

### Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

4. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

---

## AWS Deployment (Lambda + API Gateway + RDS + S3)

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Gateway   │────▶│     Lambda      │────▶│   RDS MySQL     │
│   (HTTP API)    │     │   (FastAPI)     │     │   (db.t3.micro) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    S3 Bucket    │
                        │    (Photos)     │
                        └─────────────────┘
```

### Free Tier Coverage
- **Lambda**: 1M requests/month (always free)
- **API Gateway**: 1M calls/month (12 months)
- **RDS MySQL**: db.t3.micro, 750 hours/month (12 months)
- **S3**: 5GB storage (12 months)

### Prerequisites

1. **AWS CLI** configured with your credentials:
```bash
aws configure --profile my-dev-profile
```

2. **AWS SAM CLI** for deployment:
```bash
# macOS
brew install aws-sam-cli

# Windows
choco install aws-sam-cli

# Linux
pip install aws-sam-cli
```

### Deploy

1. **Quick deploy** using the script:
```bash
# Set your AWS profile
export AWS_PROFILE=my-dev-profile

# Deploy to production
./deploy.sh prod

# Or deploy to dev
./deploy.sh dev
```

2. **Manual deploy** with SAM:
```bash
# Build
sam build --profile my-dev-profile

# Deploy (first time - guided)
sam deploy --guided --profile my-dev-profile

# Deploy (subsequent)
sam deploy --profile my-dev-profile
```

### Post-Deployment

After deployment, you'll get an API endpoint URL. Then:

1. **Initialize database tables**:
```bash
curl https://your-api-url.execute-api.region.amazonaws.com/prod/init-db
```

2. **Populate fountain data**:
```bash
curl https://your-api-url.execute-api.region.amazonaws.com/prod/populate
```

3. **Update frontend**:
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-api-url.execute-api.region.amazonaws.com/prod
```

### Environment Variables

The SAM template sets these automatically:
- `DB_USERNAME` - RDS username
- `DB_PASSWORD` - RDS password  
- `DB_HOST` - RDS endpoint (auto-configured)
- `DB_PORT` - RDS port (3306)
- `DB_NAME` - Database name (berez_db)
- `JWT_SECRET_KEY` - JWT signing key
- `APP_URL` - Frontend URL for CORS
- `S3_BUCKET` - Photos bucket name

### Costs

With Free Tier (first 12 months):
- **Expected cost**: $0/month for low traffic
- **After Free Tier**: ~$15-20/month (mostly RDS)

### Cleanup

To delete all AWS resources:
```bash
sam delete --profile my-dev-profile --stack-name berez-api-prod
```

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Fountains
- `GET /fountains/{longitude},{latitude}` - Get fountains sorted by distance
- `GET /fountains/{fountain_id}` - Get single fountain
- `POST /fountain` - Create fountain
- `PUT /fountain` - Update fountain

### Reviews
- `GET /reviews/{fountain_id}` - Get reviews for a fountain
- `POST /review` - Create review

### Photos
- `POST /photos/upload` - Upload photo
- `GET /photos/{photo_id}` - Get photo info
- `GET /photos/fountain/{fountain_id}` - Get all photos for a fountain

### Utilities
- `GET /health` - Health check
- `GET /init-db` - Initialize database tables (Lambda only)
- `GET /populate` - Populate fountain data from CSV
