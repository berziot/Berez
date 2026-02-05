# Berez Backend 🚀

FastAPI backend for the Berez drinking fountain finder app. Serverless architecture using AWS Lambda + S3 for zero-cost hosting on AWS Free Tier.

## 🏗️ Architecture

```
┌──────────────────┐
│   API Gateway    │  HTTP API
│   (Public URL)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Lambda Function │  Python 3.11 + FastAPI
│  (Serverless)    │  Mangum ASGI adapter
└────────┬─────────┘
         │
         ├──────────────┐
         ▼              ▼
┌──────────────┐  ┌──────────────┐
│  S3 Bucket   │  │  S3 Bucket   │
│  (Database)  │  │  (Photos)    │
│  SQLite file │  │  Public read │
└──────────────┘  └──────────────┘
```

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- pip and virtualenv

### Setup

1. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Required
JWT_SECRET_KEY=your-secret-key-here-min-32-chars

# Optional (defaults work for local dev)
DB_USERNAME=admin
DB_PASSWORD=password
```

4. **Run the server**:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

5. **View API docs**:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Initialize Database

```bash
# Create tables (automatic on first run)
curl http://localhost:8000/init-db

# Populate with Tel Aviv fountain data (394 fountains)
curl http://localhost:8000/populate
```

## ☁️ AWS Deployment

### Architecture Benefits
- **Serverless**: Pay per request, $0 when idle
- **Free Tier**: 1M Lambda requests/month (always free)
- **Auto-scaling**: Handles traffic spikes automatically
- **No maintenance**: No servers to manage

### Why SQLite on S3?
- **Cost**: $0 vs $15/month for RDS
- **Simplicity**: No VPC, NAT Gateway, or security groups
- **Performance**: Fast for read-heavy workloads (<1000 writes/day)
- **Portable**: Easy to backup, test locally
- **Perfect for MVP**: Handles 20-1000 users easily

### Prerequisites

1. **AWS CLI** configured:
```bash
aws configure --profile my-dev-profile
# Enter: Access Key, Secret Key, Region (eu-west-1), Output format (json)
```

2. **AWS SAM CLI** installed:
```bash
# macOS
brew install aws-sam-cli

# Windows
choco install aws-sam-cli

# Linux
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

3. **Docker** (for building Lambda packages):
```bash
# macOS/Windows: Install Docker Desktop
# Linux: 
sudo apt-get install docker.io
```

### Deploy

#### Option 1: Quick Deploy (Recommended)
```bash
# Set your AWS profile
export AWS_PROFILE=my-dev-profile

# Deploy to production
./deploy.sh prod

# Or deploy to dev environment
./deploy.sh dev
```

The script will:
1. ✅ Check prerequisites (SAM CLI, AWS CLI, Docker)
2. ✅ Generate JWT secret key
3. ✅ Build Lambda package with dependencies
4. ✅ Create CloudFormation stack
5. ✅ Deploy to AWS
6. ✅ Display API endpoint URL

#### Option 2: Manual Deploy
```bash
# Build Lambda package
sam build --use-container --profile my-dev-profile

# Deploy (first time - guided setup)
sam deploy --guided --profile my-dev-profile

# Deploy (subsequent deploys)
sam deploy --profile my-dev-profile
```

### Post-Deployment Steps

After deployment completes, you'll see output like:
```
API Endpoint: https://abc123xyz.execute-api.eu-west-1.amazonaws.com/prod
Photos Bucket: berez-photos-prod-123456789
```

1. **Initialize database**:
```bash
curl https://your-api-url.execute-api.eu-west-1.amazonaws.com/prod/init-db
```

2. **Populate fountain data**:
```bash
curl https://your-api-url.execute-api.eu-west-1.amazonaws.com/prod/populate
```

3. **Test health endpoint**:
```bash
curl https://your-api-url.execute-api.eu-west-1.amazonaws.com/prod/health
```

4. **Update frontend** (see frontend README):
```bash
cd ../frontend
vercel env add NEXT_PUBLIC_API_URL production
# Paste your API Gateway URL
```

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI app, routes, dependencies
├── models.py            # SQLModel database schemas
├── auth.py              # JWT authentication utilities
├── lambda_handler.py    # AWS Lambda entry point (Mangum)
├── template.yaml        # AWS SAM CloudFormation template
├── samconfig.toml       # SAM CLI configuration
├── deploy.sh            # Deployment automation script
├── requirements.txt     # Python dependencies
├── fountains.csv        # Tel Aviv fountain data (394 fountains)
├── .env.example         # Environment variables template
├── .gitignore          
└── README.md            # This file
```

## 📦 Dependencies

### Core Framework
- `fastapi` - Modern Python web framework
- `uvicorn` - ASGI server for local development
- `mangum` - ASGI adapter for AWS Lambda

### Database
- `sqlmodel` - SQLAlchemy + Pydantic ORM
- `sqlalchemy` - Database toolkit

### Authentication
- `python-jose[cryptography]` - JWT token creation/validation
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data parsing

### AWS Integration
- `boto3` - AWS SDK (S3 operations)

### Utilities
- `python-dotenv` - Environment variable management

## 🔐 Environment Variables

### Local Development
```env
# Required
JWT_SECRET_KEY=your-secret-key-min-32-chars

# Optional (has defaults)
DB_USERNAME=admin
DB_PASSWORD=password
```

### AWS Lambda (Auto-configured)
The SAM template automatically sets:
- `ENVIRONMENT` - Deployment stage (prod/dev)
- `JWT_SECRET_KEY` - Generated during deployment
- `APP_URL` - Frontend URL for CORS
- `S3_BUCKET` - Photos bucket name
- `DB_BUCKET` - Database bucket name
- `AWS_REGION_NAME` - AWS region

## 📚 API Documentation

### Base URL
- **Local**: `http://localhost:8000`
- **Production**: `https://[api-id].execute-api.[region].amazonaws.com/prod`

### Authentication Flow

#### 1. Register
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secure_password123"
}

Response: {
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "created_at": "2026-02-05T12:00:00"
}
```

#### 2. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password123"
}

Response: {
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 3. Use Token
```bash
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response: {
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "created_at": "2026-02-05T12:00:00"
}
```

### Endpoints

#### Health & Setup
- `GET /health` - Health check, returns environment info
- `GET /init-db` - Initialize database tables (Lambda cold start)
- `GET /populate` - Load Tel Aviv fountain data from CSV

#### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login, returns JWT token
- `GET /auth/me` - Get current user info (requires auth)

#### Fountains
- `GET /fountains/{longitude},{latitude}?limit=50` - Get fountains sorted by distance
  - Returns: `{items: Fountain[], total: number}`
- `GET /fountains/{id}` - Get single fountain by ID
- `POST /fountain` - Create new fountain (admin)
- `PUT /fountain` - Update fountain (admin)

#### Reviews
- `GET /reviews/{fountain_id}` - Get all reviews for a fountain
- `POST /review` - Submit review (requires auth for logged-in users)
  ```json
  {
    "fountain_id": 1,
    "general_rating": 5,
    "temp_rating": 4,
    "stream_rating": 5,
    "quenching_rating": 5,
    "description": "Great fountain, cold water!",
    "photos": ["photo-id-1", "photo-id-2"]
  }
  ```

#### Photos
- `POST /photos/upload` - Upload photo (multipart/form-data)
  - Accepts: JPG, PNG, GIF, WebP (max 10MB)
  - Returns: `{photo_id, url}`
- `GET /photos/{photo_id}` - Get photo metadata
- `GET /photos/fountain/{fountain_id}` - List fountain photos

## 🗄️ Database

### Storage Strategy

**Local Development**: `berez.db` in project root

**AWS Lambda**: 
1. Cold start: Download `berez.db` from S3 to `/tmp/`
2. All writes: Automatically sync to S3 after each request
3. Versioning enabled for rollback capability

### Schema

#### Users
```python
class User(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
```

#### Fountains
```python
class Fountain(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    latitude: float
    longitude: float
    address: str
    type: FountainType  # Enum: cylindrical, leaf, cooler, square, mushroom
    dog_friendly: bool = False
    bottle_refill: bool = False
    average_general_rating: float = 0.0
    number_of_ratings: int = 0
    last_updated: datetime = Field(default_factory=datetime.now)
```

#### Reviews
```python
class Review(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    fountain_id: int = Field(foreign_key="fountain.id")
    user_id: Optional[int] = Field(foreign_key="user.id")  # Nullable for anonymous
    general_rating: int = Field(ge=1, le=5)  # 1-5 stars
    temp_rating: Optional[int] = Field(ge=1, le=5)
    stream_rating: Optional[int] = Field(ge=1, le=5)
    quenching_rating: Optional[int] = Field(ge=1, le=5)
    description: Optional[str] = Field(max_length=1000)
    photos: Optional[str] = None  # JSON array of photo IDs
    creation_date: datetime = Field(default_factory=datetime.now)
```

#### Photos
```python
class Photo(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    filename: str  # UUID
    original_filename: str
    content_type: str
    file_size: int
    uploaded_by: Optional[int] = Field(foreign_key="user.id")
    fountain_id: Optional[int] = Field(foreign_key="fountain.id")
    review_id: Optional[int] = Field(foreign_key="review.id")
    created_at: datetime = Field(default_factory=datetime.now)
```

## 💰 Cost Analysis

### AWS Free Tier (First 12 Months)
- **Lambda**: 1M requests/month, 400K GB-seconds compute (always free)
- **API Gateway**: 1M API calls/month
- **S3**: 5GB storage, 20K GET, 2K PUT requests/month
- **Data Transfer**: 100GB/month outbound

### Expected Usage (1000 active users)
- API calls: ~50K/month (well within 1M limit)
- Lambda compute: ~10K GB-seconds (within 400K limit)
- S3 storage: ~200MB database + ~2GB photos (within 5GB limit)
- S3 requests: ~5K reads, ~500 writes (within limits)

**Monthly Cost**: **$0.00** ✅

### After Free Tier
- Lambda: ~$0.20/month (based on 50K requests)
- API Gateway: ~$0.05/month  
- S3: ~$0.10/month
- **Total**: ~$0.35/month

Compare to traditional hosting:
- VPS: $5-20/month
- Managed Database: $15-30/month
- **Savings**: 95-99%

## 🔧 Development Tips

### Hot Reload
```bash
# Backend auto-reloads on file changes
python main.py
# Or use uvicorn directly:
uvicorn main:app --reload --port 8000
```

### Database Inspection
```bash
# Install SQLite browser
brew install --cask db-browser-for-sqlite

# Open database
open berez.db
```

### Test Endpoints
```bash
# Use HTTPie (prettier than curl)
brew install httpie

# Examples
http :8000/health
http :8000/fountains/34.7818,32.0853 limit==10
http POST :8000/auth/register username=test email=test@test.com password=password123
```

### Debug Lambda Locally
```bash
# Invoke Lambda function locally
sam local start-api --profile my-dev-profile

# Test with curl
curl http://127.0.0.1:3000/health
```

## 🧪 Testing

### Manual API Testing
```bash
# Health check
curl http://localhost:8000/health

# Get fountains near Tel Aviv center
curl "http://localhost:8000/fountains/34.7818,32.0853?limit=5"

# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🚀 Deployment Workflow

```
┌─────────────────┐
│  Make Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Test Locally   │  python main.py
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  sam build      │  Build Lambda package
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  sam deploy     │  Deploy to AWS
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Test Production│  curl https://api-url/health
└─────────────────┘
```

## 🔒 Security

### Implemented
- ✅ JWT authentication with expiration
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ Input validation (Pydantic)
- ✅ SQL injection prevention (SQLModel parameterized queries)
- ✅ File upload validation (type, size)
- ✅ Environment variable secrets

### TODO
- [ ] Rate limiting per IP
- [ ] API key for admin endpoints
- [ ] Request size limits
- [ ] Honeypot for spam prevention

## 🐛 Troubleshooting

### Common Issues

**Issue**: `sam build` fails with "Docker not running"
```bash
# Solution: Start Docker Desktop or Docker daemon
open -a Docker  # macOS
```

**Issue**: Lambda cold start takes >10s
```bash
# Solution: This is normal for first request after inactivity
# Subsequent requests are fast (<100ms)
# Consider: Reserved concurrency for production
```

**Issue**: Database not syncing to S3
```bash
# Check Lambda logs:
sam logs --stack-name berez-api-prod --profile my-dev-profile

# Verify S3 bucket access
aws s3 ls s3://berez-data-prod-[account-id]/ --profile my-dev-profile
```

**Issue**: CORS errors from frontend
```bash
# Update template.yaml with frontend URL
# Redeploy: sam deploy --profile my-dev-profile
```

## 📊 Monitoring

### CloudWatch Logs
```bash
# View Lambda logs
sam logs --stack-name berez-api-prod --profile my-dev-profile --tail

# View specific function
aws logs tail /aws/lambda/berez-api-prod --follow --profile my-dev-profile
```

### Metrics
- Lambda invocations: CloudWatch > Lambda > Invocations
- API Gateway requests: CloudWatch > API Gateway > Requests
- S3 storage: CloudWatch > S3 > BucketSizeBytes

## 🗑️ Cleanup

### Delete Stack
```bash
# Delete all AWS resources
sam delete --stack-name berez-api-prod --profile my-dev-profile --no-prompts

# This removes:
# - Lambda function
# - API Gateway
# - S3 buckets (if empty)
# - IAM roles
# - CloudFormation stack
```

### Manual Cleanup
```bash
# Empty S3 buckets first if deletion fails
aws s3 rm s3://berez-photos-prod-[account-id] --recursive --profile my-dev-profile
aws s3 rm s3://berez-data-prod-[account-id] --recursive --profile my-dev-profile

# Then delete stack
sam delete --stack-name berez-api-prod --profile my-dev-profile
```

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Mangum Documentation](https://mangum.io/)

## 🤝 Contributing

See main project README for contribution guidelines.

---

Built with ⚡ FastAPI and ☁️ AWS Lambda
