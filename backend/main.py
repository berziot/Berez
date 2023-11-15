# main.py

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Integer, String, Text, ForeignKey, Boolean,Enum,PickleType
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlmodel import Field,SQLModel,Column,JSON
from typing import List
from dotenv import load_dotenv
import os
import enum
# Database Configuration
load_dotenv()
DB_USERNAME=os.getenv("DB_USERNAME")
DB_PASSWORD=os.getenv("DB_PASSWORD")
DATABASE_URL = f"mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@localhost/berez_db"

class FountainType(enum.Enum):
    cylindrical_fountain=1
    leaf_fountaian=2
    cooler=3
    square_fountain=4
    mushroom_fountain=5

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLmodel Models - works as pydanic and SQLalchemy models 
class Fountain(SQLModel, table=True):
    id: int=Field(primary_key=True,index=True)
    location: str=Field(index=True)
    dog_friendly: bool
    type:FountainType
    average_general_rating: float
    number_of_ratings: int

class Review(SQLModel, table=True):
    id: int =Field(primary_key=True,index=True)
    fountain_id: int=Field(index=True,foreign_key='fountain.id')
    general_rating:int
    temp_rating:int
    stream_rating:int
    quenching_rating:int
    description :str
    photos : List[int] = Field(sa_column=Column(JSON))

# Create tables
SQLModel.metadata.create_all(engine)

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
    return db.query(Fountain).all()

@app.get("/reviews/{fountain_id}", response_model=List[Review])
async def read_reviews(fountain_id: int, db = Depends(get_db)):
    reviews = db.query(Review).filter(Review.fountain_id == fountain_id).all()
    if reviews:
        return reviews
    else:
        raise HTTPException(status_code=404, detail="Fountain not found")
    
@app.post("/fountain")
async def create_fountain(fountain: Fountain,db = Depends(get_db)):
    db.add(fountain)
    db.commit() 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
