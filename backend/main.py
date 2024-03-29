# main.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Review,Fountain
from dotenv import load_dotenv
from sqlmodel import SQLModel,select,update
from models import FountainType
import os
from datetime import datetime
from fastapi_pagination import Page, add_pagination
from fastapi_pagination.ext.sqlmodel import paginate


# Database Configuration
load_dotenv()
DB_USERNAME=os.getenv("DB_USERNAME")
DB_PASSWORD=os.getenv("DB_PASSWORD")
APP_URL=os.getenv("APP_URL", "http://localhost:3000")
DATABASE_URL = f"mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@localhost/berez_db"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
SQLModel.metadata.create_all(engine)

# FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_URL],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

add_pagination(app)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        


@app.get("/fountains/{longitude},{latitude}", response_model=Page[Fountain])
async def read_fountains(longitude:float,latitude:float,db = Depends(get_db)):
    return paginate(db, select(Fountain).order_by( (Fountain.longitude - longitude)*(Fountain.longitude - longitude)+
                                                  (Fountain.latitude - latitude)*(Fountain.latitude - latitude) ))


@app.get("/fountains/{fountain_id}", response_model=Fountain)
async def get_fountain(fountain_id: int, db = Depends(get_db)):
    fountain = db.query(Fountain).filter(Fountain.id == fountain_id).first()
    if fountain:
        return fountain
    else:
        raise HTTPException(status_code=404, detail="Fountain not found")

@app.get("/reviews/{fountain_id}", response_model=list[Review])
async def read_reviews(fountain_id: int, db = Depends(get_db)):
    reviews = db.query(Review).filter(Review.fountain_id == fountain_id).all()
    if reviews:
        return reviews
    else:
        raise HTTPException(status_code=404, detail="reviews not found")
  
@app.get("/populate")
async def populate_db(db = Depends(get_db)):
    import pandas as pd
    def extract_values(row):
        d = eval(row)  # Convert string dictionary to a dictionary
        return pd.Series([d['x'], d['y']])
    
    df = pd.read_csv('fountains.csv')
    df[['longitude','latitude']]= df['coordinates'].apply(lambda x: extract_values(x))
    df.drop('coordinates',axis=1,inplace=True)
    
    type_converter = {
        'ברזית גליל': FountainType.cylindrical_fountain,
        'ברזיית עלה': FountainType.leaf_fountain,
        'קולר': FountainType.cooler,
        'ברזיה מרובעת': FountainType.square_fountain,
        'ברזית פטריה': FountainType.mushroom_fountain}
    
    for i,row in df.iterrows():
        print(i)
        address = row['open_map_address']
        latitude = row['latitude']
        longitude = row['longitude']
        dog_friendly = row['dog_friendly'] 
        average_general_rating= 0
        number_of_ratings= 0
        last_updated= datetime.now()
        db.add(Fountain(
            id=row['oid'],
            type=type_converter[row['fountain_type']],
            address=address,
            latitude=latitude,
            longitude=longitude,
            dog_friendly=dog_friendly,
            average_general_rating=average_general_rating,
            number_of_ratings=number_of_ratings,
            last_updated=last_updated))
    db.commit() 
    
@app.post("/fountain")
async def create_fountain(fountain: Fountain,db = Depends(get_db)):
    db.add(fountain)
    db.commit() 

@app.post("/review")
async def create_review(review: Review,db = Depends(get_db)):
    db.add(review)
    db.commit() 
    
# Function to update an item in the database
@app.put("/fountain")
def update_founrain(new_fountain: Fountain, db = Depends(get_db)):
    existing_fountain = db.query(Fountain).filter(Fountain.id == new_fountain.id).first()
    if existing_fountain:
        changed_values = {}

        # Update the values with the new fountain
        for key, old_value in vars(existing_fountain).items():
            if key.startswith('_'):
                continue
            new_value = getattr(new_fountain, key)
            if old_value != new_value:
                changed_values[key] = new_value
                setattr(existing_fountain, key, new_value)
                
        # Commit the changes to the database
        stmt = (
            update(Fountain)
            .where(Fountain.id == existing_fountain.id)
            .values(changed_values)
        )    
        db.execute(stmt)
        db.commit()
        # Retrieve the updated row using a SELECT statement
        updated_fountain = db.query(Fountain).filter(Fountain.id == existing_fountain.id).first()

    else:
        raise HTTPException(status_code=404, detail="fountain not found")
    
    return {"message": "fountain updated successfully", "updated_fountain": updated_fountain}

@app.get("/fountains/{fountain_id}", response_model=Fountain)
async def get_fountain(fountain_id: int, db = Depends(get_db)):
    fountain = db.query(Fountain).filter(Fountain.id == fountain_id).first()
    if fountain:
        return fountain
    else:
        raise HTTPException(status_code=404, detail="Fountain not found")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
