import enum
from typing import Optional

from sqlmodel import Field, SQLModel, Column, JSON
from datetime import date, datetime


class FountainType(enum.Enum):
    cylindrical_fountain = 1
    leaf_fountain = 2
    cooler = 3
    square_fountain = 4
    mushroom_fountain = 5


# SQLmodel Models - works as pydanic and SQLalchemy models
class Fountain(SQLModel, table=True):
    id: int = Field(primary_key=True, index=True)
    address: str = Field(index=True)
    latitude: float
    longitude: float
    dog_friendly: bool
    type: FountainType
    average_general_rating: float
    number_of_ratings: int
    last_updated: datetime


def default_time():
    # return datetime.datetime.now(tz=datetime.UTC).time()
    return datetime.now()

class Review(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, index=True)
    fountain_id: int = Field(index=True, foreign_key='fountain.id')
    creation_date: date = Field(default_factory=default_time)
    general_rating: int
    temp_rating: Optional[int] = None
    stream_rating: Optional[int] = None
    quenching_rating: Optional[int] = None
    description: Optional[str] = None
    photos: Optional[list[int]] = Field(sa_column=Column(JSON))


