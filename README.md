# Berez - Drinking Fountain Finder

A mobile-first web app to find, rate, and review drinking fountains in Tel Aviv.

## Features

- **Find Fountains**: View nearby drinking fountains sorted by distance
- **Map View**: Interactive map with fountain markers
- **Rate & Review**: Rate fountains on multiple criteria (temperature, stream, quenching)
- **Photo Upload**: Add photos to help others find fountains
- **User Accounts**: Register and login to save your reviews
- **Google Maps Navigation**: One-tap navigation to any fountain

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database ORM (SQLAlchemy + Pydantic)
- **MySQL** - Database
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **Leaflet** - Interactive maps

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
```

5. Create MySQL database:
```sql
CREATE DATABASE berez_db;
```

6. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local if your API is running on a different port
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Populate Database

After starting the backend, you can populate the database with Tel Aviv fountain data:

```bash
curl http://localhost:8000/populate
```

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

## Project Structure

```
berez/
├── backend/
│   ├── main.py           # FastAPI app and routes
│   ├── models.py         # SQLModel database models
│   ├── auth.py           # JWT authentication utilities
│   ├── requirements.txt  # Python dependencies
│   ├── fountains.csv     # Tel Aviv fountain data
│   └── uploads/          # Uploaded photos
│
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   └── contexts/     # React contexts
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

## Mobile-First Design

The app is designed for mobile users walking around looking for water:

- **Touch-friendly**: 44px minimum touch targets
- **Bottom navigation**: Easy thumb access
- **RTL support**: Hebrew language support
- **Safe areas**: Works with notched phones
- **Fast interactions**: Tap states, no hover-only features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
