# Berez 💧 - Drinking Fountain Finder

A mobile-first web application to discover, rate, and review public drinking fountains in Tel Aviv. Built for people who want to stay hydrated while exploring the city, reduce plastic bottle waste, and contribute to a community-driven water source map.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)

## 🌟 Features

### For Users
- **🗺️ Interactive Map**: Browse fountains on an interactive Leaflet map with custom markers
- **📍 Location-Based**: Find the nearest fountains sorted by distance from your location
- **⭐ Multi-Criteria Ratings**: Rate fountains on overall quality, temperature, water stream, and quenching ability
- **📸 Photo Upload**: Add photos to help others identify and find fountains
- **💬 Reviews**: Share your experience with personal notes and ratings
- **🔐 User Accounts**: Register to save your reviews and track contributions
- **🧭 Google Maps Integration**: One-tap navigation to any fountain

### Mobile-First Design
- **Touch-Optimized**: 44px minimum touch targets for comfortable use
- **Bottom Navigation**: Thumb-friendly navigation bar
- **RTL Support**: Full Hebrew language support
- **Safe Area Insets**: Works perfectly with notched phones (iPhone X+)
- **Responsive**: Seamless experience from mobile to desktop
- **Progressive Web App**: Install on home screen for app-like experience

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vercel)                     │
│              Next.js 14 + TypeScript + Tailwind              │
│                   https://berez.vercel.app                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (AWS Lambda + API Gateway)              │
│           FastAPI + SQLModel + JWT Authentication            │
│   https://[id].execute-api.eu-west-1.amazonaws.com/prod     │
└─────────┬──────────────────────────────────┬────────────────┘
          │                                  │
          ▼                                  ▼
┌──────────────────┐              ┌──────────────────┐
│   S3 Bucket      │              │   S3 Bucket      │
│   (Database)     │              │   (Photos)       │
│   SQLite file    │              │   Image uploads  │
└──────────────────┘              └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **AWS CLI** (for deployment)
- **Vercel CLI** (optional, for frontend deployment)

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/berez.git
cd berez
```

#### 2. Start the Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your JWT_SECRET_KEY

# Run the server
python main.py
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

#### 3. Start the Frontend
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

#### 4. Populate Database
```bash
# Initialize tables
curl http://localhost:8000/init-db

# Load Tel Aviv fountain data (394 fountains)
curl http://localhost:8000/populate
```

## 🌐 Production Deployment

### Current Production Deployment
- **Frontend**: https://berez.vercel.app (Vercel)
- **Backend**: AWS Lambda + API Gateway (eu-west-1)
- **Database**: SQLite on S3 (serverless, auto-sync)
- **Photos**: S3 bucket (public read access)

### Deploy Your Own Instance

#### Backend (AWS Lambda)
```bash
cd backend

# Install AWS SAM CLI
brew install aws-sam-cli  # macOS
# or: choco install aws-sam-cli  # Windows

# Configure AWS credentials
aws configure --profile my-dev-profile

# Deploy
export AWS_PROFILE=my-dev-profile
./deploy.sh prod
```

This creates:
- Lambda function with FastAPI app
- API Gateway HTTP API
- S3 bucket for photos (public read)
- S3 bucket for database (private, versioned)

**Cost**: $0/month on AWS Free Tier (1M Lambda requests, 5GB S3)

#### Frontend (Vercel)
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter your API Gateway URL
```

Or connect your GitHub repo to Vercel for automatic deployments.

## 📁 Project Structure

```
berez/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Main app with routes
│   ├── models.py              # SQLModel database models
│   ├── auth.py                # JWT authentication
│   ├── lambda_handler.py      # AWS Lambda entry point
│   ├── template.yaml          # AWS SAM template
│   ├── deploy.sh              # Deployment script
│   ├── requirements.txt       # Python dependencies
│   ├── fountains.csv          # Tel Aviv fountain data
│   └── README.md
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js 14 App Router
│   │   │   ├── page.tsx       # Homepage (list/map toggle)
│   │   │   ├── [fountain_id]/ # Fountain detail pages
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Registration page
│   │   │   ├── profile/       # User profile
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── globals.css    # Global styles
│   │   │   ├── types.tsx      # TypeScript types
│   │   │   └── consts.tsx     # Constants
│   │   │
│   │   ├── components/        # React Components
│   │   │   ├── FountainMap.tsx      # Leaflet map
│   │   │   ├── FountainCard.tsx     # Fountain list item
│   │   │   ├── BottomSheet.tsx      # Map detail sheet
│   │   │   ├── BottomNav.tsx        # Mobile navigation
│   │   │   ├── StarRating.tsx       # Rating component
│   │   │   ├── PhotoUpload.tsx      # Photo upload
│   │   │   ├── PhotoCarousel.tsx    # Image carousel
│   │   │   ├── LoadingSkeleton.tsx  # Loading states
│   │   │   └── AddReviewCard.tsx    # Review form
│   │   │
│   │   └── contexts/          # React Contexts
│   │       ├── AuthContext.tsx      # User authentication
│   │       └── FountainContext.tsx  # Fountain data
│   │
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tailwind.config.ts
│   └── README.md
│
└── README.md                  # This file
```

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Leaflet** | Interactive maps |
| **Embla Carousel** | Touch-friendly image carousels |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python API framework |
| **SQLModel** | Type-safe ORM (SQLAlchemy + Pydantic) |
| **SQLite** | Lightweight database (stored on S3) |
| **JWT** | Stateless authentication |
| **Boto3** | AWS SDK for S3 operations |
| **Mangum** | ASGI adapter for AWS Lambda |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **AWS Lambda** | Serverless compute |
| **API Gateway** | HTTP API routing |
| **S3** | Object storage (database + photos) |
| **Vercel** | Frontend hosting with CDN |

## 📱 Mobile-First Design Principles

The app is designed for people walking around the city:

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Thumb Zone**: Critical actions in bottom 2/3 of screen
3. **Large Text**: 16px+ body text to prevent iOS auto-zoom
4. **Fast Loading**: Skeleton screens, optimistic updates
5. **Offline-Ready**: Cached data, graceful degradation
6. **Native Feel**: 
   - Bottom navigation (iOS/Android style)
   - Pull-to-refresh on lists
   - Swipeable photo carousels
   - Bottom sheets for details

## 🔐 Authentication Flow

```
┌─────────────┐
│   Register  │──┐
└─────────────┘  │
                 ▼
┌─────────────┐  ┌──────────────────┐
│    Login    │─▶│  JWT Token       │
└─────────────┘  │  (localStorage)  │
                 └──────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Authenticated API   │
              │  Calls (Bearer Auth) │
              └──────────────────────┘
```

- **Registration**: Username, email, password (bcrypt hashed)
- **Login**: Returns JWT token (30-day expiry)
- **Protected Routes**: `/profile`, review submissions
- **Public Routes**: Browse fountains, view reviews (no login needed)

## 🗺️ API Endpoints

### Health & Setup
- `GET /health` - Health check
- `GET /init-db` - Initialize database tables (Lambda only)
- `GET /populate` - Load Tel Aviv fountain data (394 fountains)

### Authentication
- `POST /auth/register` - Create user account
- `POST /auth/login` - Login (returns JWT)
- `GET /auth/me` - Get current user info (requires auth)

### Fountains
- `GET /fountains/{longitude},{latitude}` - List fountains by distance
  - Query params: `limit` (default: 50)
  - Returns: `{items: Fountain[], total: number}`
- `GET /fountains/{id}` - Get single fountain
- `POST /fountain` - Create fountain (admin only)
- `PUT /fountain` - Update fountain (admin only)

### Reviews
- `GET /reviews/{fountain_id}` - Get all reviews for a fountain
- `POST /review` - Submit review (requires auth)
  - Body: `{fountain_id, general_rating, temp_rating?, stream_rating?, quenching_rating?, description?, photos?}`

### Photos
- `POST /photos/upload` - Upload photo (multipart/form-data)
  - Supports: JPG, PNG, GIF, WebP (max 10MB)
  - Returns: `{photo_id, url}`
- `GET /photos/{photo_id}` - Get photo metadata
- `GET /photos/fountain/{fountain_id}` - List all photos for fountain

## 🧪 Testing

### Test the API
```bash
# Health check
curl https://your-api-url/health

# Get fountains near Tel Aviv center
curl "https://your-api-url/fountains/34.7818,32.0853?limit=5"

# Get specific fountain
curl https://your-api-url/fountains/1
```

### Test Authentication
```bash
# Register
curl -X POST https://your-api-url/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://your-api-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 💾 Database Schema

### User
```sql
- id: INTEGER PRIMARY KEY
- username: VARCHAR UNIQUE
- email: VARCHAR UNIQUE
- password_hash: VARCHAR
- is_active: BOOLEAN
- created_at: TIMESTAMP
```

### Fountain
```sql
- id: INTEGER PRIMARY KEY
- latitude: FLOAT
- longitude: FLOAT
- address: VARCHAR
- type: INTEGER (enum: cylindrical, leaf, cooler, square, mushroom)
- dog_friendly: BOOLEAN
- bottle_refill: BOOLEAN
- average_general_rating: FLOAT
- number_of_ratings: INTEGER
- last_updated: TIMESTAMP
```

### Review
```sql
- id: INTEGER PRIMARY KEY
- fountain_id: INTEGER FK
- user_id: INTEGER FK (nullable for anonymous)
- general_rating: INTEGER (1-5)
- temp_rating: INTEGER (1-5, optional)
- stream_rating: INTEGER (1-5, optional)
- quenching_rating: INTEGER (1-5, optional)
- description: TEXT (optional)
- photos: JSON (array of photo IDs)
- creation_date: TIMESTAMP
```

### Photo
```sql
- id: INTEGER PRIMARY KEY
- filename: VARCHAR (UUID)
- original_filename: VARCHAR
- content_type: VARCHAR
- file_size: INTEGER
- uploaded_by: INTEGER FK (nullable)
- fountain_id: INTEGER FK (nullable)
- review_id: INTEGER FK (nullable)
- created_at: TIMESTAMP
```

## 🌍 Data Sources

Initial fountain data comes from Tel Aviv Municipality's open data API:
- 394 public drinking fountains across Tel Aviv
- Includes GPS coordinates, type, and dog-friendly status
- Updated via `/populate` endpoint

## 📊 AWS Free Tier Usage

With AWS Free Tier (first 12 months):
- **Lambda**: 1M requests/month (always free)
- **API Gateway**: 1M API calls/month
- **S3**: 5GB storage, 20K GET requests, 2K PUT requests
- **Data Transfer**: 100GB/month outbound

**Expected Monthly Cost**: $0 for up to ~30K active users

## 🔒 Security Features

- **JWT Authentication**: Stateless, secure token-based auth
- **Password Hashing**: Bcrypt with automatic salting
- **CORS Protection**: Configured for specific origins only
- **Input Validation**: Pydantic models validate all inputs
- **SQL Injection Protection**: SQLModel parameterized queries
- **File Upload Validation**: Type and size checks for images
- **Rate Limiting**: API Gateway throttling (future enhancement)

## 🚧 Future Enhancements

- [ ] Offline mode with service workers
- [ ] Push notifications for nearby fountains
- [ ] Gamification: points, badges, leaderboards
- [ ] Fountain status: operational/broken reporting
- [ ] Accessibility ratings
- [ ] Multi-city support (Jerusalem, Haifa, etc.)
- [ ] Admin dashboard for moderation
- [ ] Mobile apps (React Native)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style (TypeScript, Python type hints)
- Write descriptive commit messages
- Test on mobile devices
- Ensure RTL support for new UI components
- Add tests for new API endpoints

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

Built with 💧 by the Berez team

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/berez/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/berez/discussions)

---

Made with ❤️ for hydration and sustainability
