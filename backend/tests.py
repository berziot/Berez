from main import app
from fastapi.testclient import TestClient

client=TestClient(app)

def test_get_fountain():
    response=client.get("/fountains")
    assert response.status_code == 200
    #assert len(response.json()['items'])==2
    
test_get_fountain()