import enum
from sqlmodel import Field,SQLModel,Column,JSON
from datetime import datetime

class FountainType(enum.Enum):
    cylindrical_fountain=1
    leaf_fountaian=2
    cooler=3
    square_fountain=4
    mushroom_fountain=5

# SQLmodel Models - works as pydanic and SQLalchemy models 
class Fountain(SQLModel, table=True):
    id: int=Field(primary_key=True,index=True)
    address: str=Field(index=True)
    latitude:float
    longitude: float
    dog_friendly: bool
    type:FountainType
    average_general_rating: float
    number_of_ratings: int
    last_updated: datetime

class Review(SQLModel, table=True):
    id: int =Field(primary_key=True,index=True)
    fountain_id: int=Field(index=True,foreign_key='fountain.id')
    creation_date:datetime
    general_rating:int
    temp_rating:int
    stream_rating:int
    quenching_rating:int
    description :str
    photos : list[int] = Field(sa_column=Column(JSON))