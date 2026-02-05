# lambda_handler.py - AWS Lambda entry point using Mangum

from mangum import Mangum
from main import app

# Create the Lambda handler
handler = Mangum(app, lifespan="off")
