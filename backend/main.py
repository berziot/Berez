# main.py

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import List
from dotenv import load_dotenv
import os
# Database Configuration
load_dotenv()
DB_USERNAME=os.getenv("DB_USERNAME")
DB_PASSWORD=os.getenv("DB_PASSWORD")
DATABASE_URL = f"mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@localhost/berez_db"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class FountainModel(Base):
    __tablename__ = 'fountains'
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(255), index=True)
    details = Column(Text)

class ReviewModel(Base):
    __tablename__ = 'reviews'
    id = Column(Integer, primary_key=True, index=True)
    fountain_id = Column(Integer, ForeignKey('fountains.id'))
    rating = Column(Float)
    comment = Column(Text)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class Fountain(BaseModel):
    id: int
    location: str
    details: str

class Review(BaseModel):
    id: int
    fountain_id: int
    rating: float
    comment: str

# FastAPI app
app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/fountains", response_model=List[Fountain])
async def read_fountains(db = Depends(get_db)):
    return db.query(FountainModel).all()

@app.get("/reviews/{fountain_id}", response_model=List[Review])
async def read_reviews(fountain_id: int, db = Depends(get_db)):
    reviews = db.query(ReviewModel).filter(ReviewModel.fountain_id == fountain_id).all()
    if reviews:
        return reviews
    else:
        raise HTTPException(status_code=404, detail="Fountain not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
