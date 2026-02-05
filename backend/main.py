# main.py

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import (
    Review, Fountain, User, Photo,
    UserCreate, UserLogin, UserResponse, Token,
    ReviewCreate, ReviewResponse, FountainType,
    FountainReport, FountainReportCreate, FountainReportResponse,
    ReportType, ReportStatus, FountainCreate
)
from auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_user_by_email, get_user_by_username, get_user_by_id,
    decode_token, oauth2_scheme, ACCESS_TOKEN_EXPIRE_MINUTES
)
from dotenv import load_dotenv
from sqlmodel import SQLModel, select, update
import os
import json
import uuid
from datetime import datetime, timedelta
from fastapi_pagination import Page, add_pagination
from fastapi_pagination.ext.sqlmodel import paginate
from typing import Optional, List
from pathlib import Path

# Load environment variables
load_dotenv()

# Environment detection
IS_LAMBDA = os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None
ENVIRONMENT = os.getenv("ENVIRONMENT", "local")

# App URL for CORS
APP_URL = os.getenv("APP_URL", "http://localhost:3000")

# S3 Configuration
S3_BUCKET = os.getenv("S3_BUCKET")
DB_BUCKET = os.getenv("DB_BUCKET")  # For SQLite database storage
AWS_REGION = os.getenv("AWS_REGION_NAME", "eu-west-1")

# Local paths
UPLOAD_DIR = Path("uploads")
LOCAL_DB_PATH = Path("berez.db")

# Lambda paths
LAMBDA_DB_PATH = Path("/tmp/berez.db")

# S3 client (lazy initialization)
_s3_client = None

def get_s3_client():
    global _s3_client
    if _s3_client is None:
        import boto3
        _s3_client = boto3.client('s3', region_name=AWS_REGION)
    return _s3_client


def get_db_path() -> Path:
    """Get the appropriate database path based on environment."""
    if IS_LAMBDA:
        return LAMBDA_DB_PATH
    return LOCAL_DB_PATH


def init_lambda_db():
    """Download SQLite database from S3 on Lambda cold start."""
    if not IS_LAMBDA or not DB_BUCKET:
        return
    
    db_path = get_db_path()
    s3 = get_s3_client()
    
    try:
        # Try to download existing database from S3
        s3.download_file(DB_BUCKET, 'berez.db', str(db_path))
        print(f"Downloaded database from S3 to {db_path}")
    except Exception as e:
        # Database doesn't exist in S3 yet, will be created fresh
        print(f"No existing database in S3, will create new: {e}")


def save_lambda_db():
    """Upload SQLite database to S3 after changes."""
    if not IS_LAMBDA or not DB_BUCKET:
        return
    
    db_path = get_db_path()
    if not db_path.exists():
        return
    
    s3 = get_s3_client()
    try:
        s3.upload_file(str(db_path), DB_BUCKET, 'berez.db')
        print(f"Uploaded database to S3")
    except Exception as e:
        print(f"Failed to upload database to S3: {e}")


# Initialize Lambda database on cold start
if IS_LAMBDA:
    init_lambda_db()

# Database Configuration - Use SQLite
db_path = get_db_path()
DATABASE_URL = f"sqlite:///{db_path}"

# Create uploads directory for local development
if not IS_LAMBDA:
    UPLOAD_DIR.mkdir(exist_ok=True)

# SQLAlchemy setup
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
SQLModel.metadata.create_all(engine)

# FastAPI app
app = FastAPI(
    title="Berez API",
    description="API for the Berez drinking fountain finder app",
    version="1.0.0",
    root_path="" if not IS_LAMBDA else f"/{ENVIRONMENT}"
)

# Configure CORS
origins = [APP_URL]
if "localhost" not in APP_URL:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount uploads directory for local development
if not IS_LAMBDA:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

add_pagination(app)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Save database to S3 after each request (for Lambda)
        save_lambda_db()


# Auth dependency that works with our get_db
async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get the current user from the JWT token (returns None if not authenticated)."""
    if token is None:
        return None
    
    token_data = decode_token(token)
    if token_data is None:
        return None
        
    user = get_user_by_id(db, token_data.user_id)
    if user is None or not user.is_active:
        return None
    
    return user


async def get_current_user_required(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get the current user from the JWT token (raises exception if not authenticated)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if token is None:
        raise credentials_exception
    
    token_data = decode_token(token)
    if token_data is None:
        raise credentials_exception
        
    user = get_user_by_id(db, token_data.user_id)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    return user


# ==================== AUTH ENDPOINTS ====================

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    user = User(
        username=user_data.username,
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password)
    )
    
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.id, "username": user.username}
    )
    return Token(access_token=access_token)


@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user_required)):
    """Get current user info."""
    return current_user


# ==================== PHOTO ENDPOINTS ====================

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def get_photo_url(filename: str) -> str:
    """Get the URL for a photo based on environment."""
    if IS_LAMBDA and S3_BUCKET:
        return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{filename}"
    return f"/uploads/{filename}"


@app.post("/photos/upload", status_code=status.HTTP_201_CREATED)
async def upload_photo(
    file: UploadFile = File(...),
    fountain_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Upload a photo."""
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    try:
        # Save to S3 or local filesystem
        if IS_LAMBDA and S3_BUCKET:
            s3 = get_s3_client()
            s3.put_object(
                Bucket=S3_BUCKET,
                Key=unique_filename,
                Body=content,
                ContentType=file.content_type or "image/jpeg"
            )
        else:
            file_path = UPLOAD_DIR / unique_filename
            with open(file_path, "wb") as f:
                f.write(content)
        
        # Create photo record
        photo = Photo(
            filename=unique_filename,
            original_filename=file.filename,
            content_type=file.content_type or "image/jpeg",
            file_size=file_size,
            uploaded_by=current_user.id if current_user else None,
            fountain_id=fountain_id
        )
        
        db.add(photo)
        db.commit()
        db.refresh(photo)
        
        return {
            "message": "Photo uploaded successfully",
            "photo_id": photo.id,
            "url": get_photo_url(unique_filename)
        }
    except Exception as e:
        # Clean up file if database operation fails
        if not IS_LAMBDA:
            file_path = UPLOAD_DIR / unique_filename
            if file_path.exists():
                file_path.unlink()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading photo: {str(e)}"
        )


@app.get("/photos/{photo_id}")
async def get_photo(photo_id: int, db: Session = Depends(get_db)):
    """Get photo info by ID."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    return {
        "id": photo.id,
        "filename": photo.filename,
        "original_filename": photo.original_filename,
        "url": get_photo_url(photo.filename),
        "content_type": photo.content_type,
        "file_size": photo.file_size,
        "fountain_id": photo.fountain_id,
        "created_at": photo.created_at
    }


@app.get("/photos/fountain/{fountain_id}")
async def get_fountain_photos(fountain_id: int, db: Session = Depends(get_db)):
    """Get all photos for a fountain."""
    photos = db.query(Photo).filter(Photo.fountain_id == fountain_id).all()
    return [
        {
            "id": photo.id,
            "url": get_photo_url(photo.filename),
            "original_filename": photo.original_filename
        }
        for photo in photos
    ]


# ==================== FOUNTAIN ENDPOINTS ====================

@app.get("/fountains/{longitude},{latitude}")
async def read_fountains(
    longitude: float, 
    latitude: float, 
    limit: int = 50,
    db=Depends(get_db)
):
    """Get fountains ordered by distance from coordinates."""
    try:
        # Calculate distance and order by it
        fountains = db.query(Fountain).order_by(
            (Fountain.longitude - longitude) * (Fountain.longitude - longitude) +
            (Fountain.latitude - latitude) * (Fountain.latitude - latitude)
        ).limit(limit).all()
        
        return {
            "items": fountains,
            "total": db.query(Fountain).count()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching fountains: {str(e)}"
        )


@app.get("/fountains/{fountain_id}", response_model=Fountain)
async def get_fountain(fountain_id: int, db=Depends(get_db)):
    """Get a single fountain by ID."""
    fountain = db.query(Fountain).filter(Fountain.id == fountain_id).first()
    if fountain:
        return fountain
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fountain not found")


@app.post("/fountain", status_code=status.HTTP_201_CREATED)
async def create_fountain(fountain: Fountain, db=Depends(get_db)):
    """Create a new fountain."""
    try:
        existing = db.query(Fountain).filter(Fountain.id == fountain.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Fountain with ID {fountain.id} already exists"
            )
        
        db.add(fountain)
        db.commit()
        db.refresh(fountain)
        return {"message": "Fountain created successfully", "fountain": fountain}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating fountain: {str(e)}"
        )


@app.put("/fountain")
async def update_fountain(new_fountain: Fountain, db=Depends(get_db)):
    """Update an existing fountain."""
    existing_fountain = db.query(Fountain).filter(Fountain.id == new_fountain.id).first()
    if not existing_fountain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fountain not found"
        )
    
    try:
        changed_values = {}
        
        for key, old_value in vars(existing_fountain).items():
            if key.startswith('_'):
                continue
            new_value = getattr(new_fountain, key)
            if old_value != new_value:
                changed_values[key] = new_value
                setattr(existing_fountain, key, new_value)
        
        if not changed_values:
            return {"message": "No changes detected", "fountain": existing_fountain}
        
        changed_values['last_updated'] = datetime.now()
        
        stmt = (
            update(Fountain)
            .where(Fountain.id == existing_fountain.id)
            .values(changed_values)
        )
        db.execute(stmt)
        db.commit()
        
        updated_fountain = db.query(Fountain).filter(Fountain.id == existing_fountain.id).first()
        
        return {"message": "Fountain updated successfully", "fountain": updated_fountain}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating fountain: {str(e)}"
        )


@app.post("/fountains/submit", status_code=status.HTTP_201_CREATED)
async def submit_fountain(
    fountain_data: FountainCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Submit a new user-contributed fountain."""
    try:
        fountain = Fountain(
            address=fountain_data.address,
            latitude=fountain_data.latitude,
            longitude=fountain_data.longitude,
            dog_friendly=fountain_data.dog_friendly,
            bottle_refill=fountain_data.bottle_refill,
            type=fountain_data.type,
            description=fountain_data.description,
            status="user_submitted",
            submitted_by=current_user.id if current_user else None,
            average_general_rating=0.0,
            number_of_ratings=0,
            last_updated=datetime.now()
        )
        
        db.add(fountain)
        db.commit()
        db.refresh(fountain)
        
        return {
            "message": "תודה! הברזיה נשלחה לאישור",
            "fountain": fountain
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting fountain: {str(e)}"
        )


@app.post("/fountains/report", status_code=status.HTTP_201_CREATED)
async def report_fountain(
    report_data: FountainReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Report an issue with a fountain."""
    try:
        # Verify fountain exists
        fountain = db.query(Fountain).filter(Fountain.id == report_data.fountain_id).first()
        if not fountain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Fountain with ID {report_data.fountain_id} not found"
            )
        
        report = FountainReport(
            fountain_id=report_data.fountain_id,
            user_id=current_user.id if current_user else None,
            report_type=report_data.report_type,
            description=report_data.description,
            status=ReportStatus.pending
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {
            "message": "תודה על הדיווח!",
            "report": {
                "id": report.id,
                "fountain_id": report.fountain_id,
                "report_type": report.report_type.value,
                "description": report.description,
                "created_at": report.created_at
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating report: {str(e)}"
        )


@app.get("/fountains/{fountain_id}/reports", response_model=List[FountainReportResponse])
async def get_fountain_reports(fountain_id: int, db: Session = Depends(get_db)):
    """Get all reports for a fountain."""
    fountain = db.query(Fountain).filter(Fountain.id == fountain_id).first()
    if not fountain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fountain not found"
        )
    
    reports = db.query(FountainReport).filter(
        FountainReport.fountain_id == fountain_id
    ).order_by(FountainReport.created_at.desc()).all()
    
    result = []
    for report in reports:
        report_dict = {
            "id": report.id,
            "fountain_id": report.fountain_id,
            "user_id": report.user_id,
            "username": None,
            "report_type": report.report_type,
            "description": report.description,
            "status": report.status,
            "created_at": report.created_at,
            "resolved_at": report.resolved_at
        }
        if report.user_id:
            user = db.query(User).filter(User.id == report.user_id).first()
            if user:
                report_dict["username"] = user.username
        result.append(FountainReportResponse(**report_dict))
    
    return result


# ==================== REVIEW ENDPOINTS ====================

@app.get("/reviews/{fountain_id}", response_model=List[ReviewResponse])
async def read_reviews(fountain_id: int, db=Depends(get_db)):
    """Get all reviews for a fountain with usernames."""
    fountain = db.query(Fountain).filter(Fountain.id == fountain_id).first()
    if not fountain:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fountain not found")
    
    reviews = db.query(Review).filter(Review.fountain_id == fountain_id).order_by(Review.creation_date.desc()).all()
    
    result = []
    for review in reviews:
        review_dict = {
            "id": review.id,
            "fountain_id": review.fountain_id,
            "user_id": review.user_id,
            "username": None,
            "creation_date": review.creation_date,
            "general_rating": review.general_rating,
            "temp_rating": review.temp_rating,
            "stream_rating": review.stream_rating,
            "quenching_rating": review.quenching_rating,
            "description": review.description,
            "photos": review.photos
        }
        if review.user_id:
            user = db.query(User).filter(User.id == review.user_id).first()
            if user:
                review_dict["username"] = user.username
        result.append(ReviewResponse(**review_dict))
    
    return result


@app.post("/review", status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    db=Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Create a new review for a fountain."""
    try:
        fountain = db.query(Fountain).filter(Fountain.id == review_data.fountain_id).first()
        if not fountain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Fountain with ID {review_data.fountain_id} not found"
            )
        
        review = Review(
            fountain_id=review_data.fountain_id,
            user_id=current_user.id if current_user else None,
            general_rating=review_data.general_rating,
            temp_rating=review_data.temp_rating,
            stream_rating=review_data.stream_rating,
            quenching_rating=review_data.quenching_rating,
            description=review_data.description,
            photos=review_data.photos
        )
        
        db.add(review)
        
        # Update fountain's average rating
        all_reviews = db.query(Review).filter(Review.fountain_id == review_data.fountain_id).all()
        total_rating = sum(r.general_rating for r in all_reviews) + review.general_rating
        new_count = len(all_reviews) + 1
        fountain.average_general_rating = total_rating / new_count
        fountain.number_of_ratings = new_count
        fountain.last_updated = datetime.now()
        
        db.commit()
        db.refresh(review)
        
        response = {
            "message": "Review created successfully",
            "review": {
                "id": review.id,
                "fountain_id": review.fountain_id,
                "user_id": review.user_id,
                "username": current_user.username if current_user else None,
                "creation_date": review.creation_date,
                "general_rating": review.general_rating,
                "temp_rating": review.temp_rating,
                "stream_rating": review.stream_rating,
                "quenching_rating": review.quenching_rating,
                "description": review.description,
                "photos": review.photos
            }
        }
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating review: {str(e)}"
        )


# ==================== POPULATE ENDPOINT ====================

@app.get("/populate")
async def populate_db(db=Depends(get_db)):
    """Populate database from fountains.csv file."""
    import csv
    import ast
    
    def extract_coordinates(coord_str):
        """Extract longitude and latitude from coordinate string."""
        try:
            d = json.loads(coord_str.replace("'", '"'))
        except json.JSONDecodeError:
            d = ast.literal_eval(coord_str)
        return d['x'], d['y']
    
    try:
        # Handle both local and Lambda paths
        csv_path = 'fountains.csv'
        if IS_LAMBDA:
            csv_path = '/var/task/fountains.csv'
        
        type_converter = {
            'ברזית גליל': FountainType.cylindrical_fountain,
            'ברזיית עלה': FountainType.leaf_fountain,
            'קולר': FountainType.cooler,
            'ברזיה מרובעת': FountainType.square_fountain,
            'ברזית פטריה': FountainType.mushroom_fountain
        }
        
        count = 0
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing = db.query(Fountain).filter(Fountain.id == int(row['oid'])).first()
                if existing:
                    continue
                
                longitude, latitude = extract_coordinates(row['coordinates'])
                
                # Handle dog_friendly - can be 'True', 'False', 'Yes', 'No', 1, 0
                dog_friendly_val = row.get('dog_friendly', 'False')
                if isinstance(dog_friendly_val, str):
                    dog_friendly = dog_friendly_val.lower() in ('true', 'yes', '1')
                else:
                    dog_friendly = bool(dog_friendly_val)
                
                fountain = Fountain(
                    id=int(row['oid']),
                    type=type_converter.get(row['fountain_type'], FountainType.cylindrical_fountain),
                    address=row['open_map_address'],
                    latitude=latitude,
                    longitude=longitude,
                    dog_friendly=dog_friendly,
                    bottle_refill=False,
                    average_general_rating=0,
                    number_of_ratings=0,
                    last_updated=datetime.now()
                )
                db.add(fountain)
                count += 1
        
        db.commit()
        return {"message": f"Successfully populated {count} fountains"}
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="fountains.csv file not found"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error populating database: {str(e)}"
        )


# ==================== DATABASE INIT (Lambda) ====================

@app.get("/init-db")
async def init_database():
    """Initialize database tables (for Lambda deployment)."""
    try:
        SQLModel.metadata.create_all(engine)
        return {"message": "Database tables created successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating tables: {str(e)}"
        )


# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": ENVIRONMENT,
        "is_lambda": IS_LAMBDA
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
