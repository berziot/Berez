import enum
from typing import Optional, List

from sqlmodel import Field, SQLModel, Column, JSON, Relationship
from datetime import date, datetime


class FountainType(enum.Enum):
    cylindrical_fountain = 1
    leaf_fountain = 2
    cooler = 3
    square_fountain = 4
    mushroom_fountain = 5


def default_time():
    return datetime.now()


# SQLmodel Models - works as pydantic and SQLalchemy models

class User(SQLModel, table=True):
    """User model for authentication."""
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=default_time)
    is_active: bool = Field(default=True)


class UserCreate(SQLModel):
    """Schema for user registration."""
    username: str = Field(min_length=3, max_length=50)
    email: str
    password: str = Field(min_length=6)


class UserLogin(SQLModel):
    """Schema for user login."""
    email: str
    password: str


class UserResponse(SQLModel):
    """Schema for user response (without password)."""
    id: int
    username: str
    email: str
    created_at: datetime
    is_active: bool


class Token(SQLModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(SQLModel):
    """Token payload data."""
    user_id: Optional[int] = None
    username: Optional[str] = None


class Fountain(SQLModel, table=True):
    """Drinking fountain model."""
    id: int = Field(primary_key=True, index=True)
    address: str = Field(index=True)
    latitude: float
    longitude: float
    dog_friendly: bool
    bottle_refill: bool = Field(default=False)  # New: bottle filling station
    type: FountainType
    average_general_rating: float
    number_of_ratings: int
    last_updated: datetime


class Photo(SQLModel, table=True):
    """Photo model for storing uploaded images."""
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    filename: str
    original_filename: str
    content_type: str
    file_size: int
    uploaded_by: Optional[int] = Field(default=None, foreign_key='user.id')
    fountain_id: Optional[int] = Field(default=None, foreign_key='fountain.id', index=True)
    review_id: Optional[int] = Field(default=None, foreign_key='review.id', index=True)
    created_at: datetime = Field(default_factory=default_time)


class Review(SQLModel, table=True):
    """Review model for fountain ratings."""
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    fountain_id: int = Field(index=True, foreign_key='fountain.id')
    user_id: Optional[int] = Field(default=None, foreign_key='user.id', index=True)
    creation_date: datetime = Field(default_factory=default_time)
    general_rating: int = Field(ge=1, le=5)  # Rating between 1-5
    temp_rating: Optional[int] = Field(default=None, ge=1, le=5)
    stream_rating: Optional[int] = Field(default=None, ge=1, le=5)
    quenching_rating: Optional[int] = Field(default=None, ge=1, le=5)
    description: Optional[str] = Field(default=None, max_length=1000)
    photos: Optional[List[int]] = Field(sa_column=Column(JSON), default=None)


class ReviewCreate(SQLModel):
    """Schema for creating a review."""
    fountain_id: int
    general_rating: int = Field(ge=1, le=5)
    temp_rating: Optional[int] = Field(default=None, ge=1, le=5)
    stream_rating: Optional[int] = Field(default=None, ge=1, le=5)
    quenching_rating: Optional[int] = Field(default=None, ge=1, le=5)
    description: Optional[str] = Field(default=None, max_length=1000)
    photos: Optional[List[int]] = None


class ReviewResponse(SQLModel):
    """Schema for review response with username."""
    id: int
    fountain_id: int
    user_id: Optional[int]
    username: Optional[str] = None
    creation_date: datetime
    general_rating: int
    temp_rating: Optional[int]
    stream_rating: Optional[int]
    quenching_rating: Optional[int]
    description: Optional[str]
    photos: Optional[List[int]]
