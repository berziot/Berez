# main.py

from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Review,Fountain
from dotenv import load_dotenv
from sqlmodel import SQLModel
import os
# Database Configuration
load_dotenv()
DB_USERNAME=os.getenv("DB_USERNAME")
DB_PASSWORD=os.getenv("DB_PASSWORD")
DATABASE_URL = f"mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@localhost/berez_db"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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

@app.get("/fountains", response_model=list[Fountain])
async def read_fountains(db = Depends(get_db)):
    return db.query(Fountain).all()

@app.get("/reviews/{fountain_id}", response_model=list[Review])
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
