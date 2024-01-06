# Back-End Setup

## 1. MySQL Database Setup
a. Install MySQL
Download and install MySQL from the [official MySQL website](https://dev.mysql.com/downloads/mysql/). Choose the version appropriate for your operating system.

b. Configure MySQL
1. Start MySQL Server: Ensure the MySQL server is running on your machine.
2. Create Database:
Open the MySQL shell and login.
To run the shell in windows, find `msql`s location and run 
```bash
mysql -u root -p 
```

Create a new database for the project:
```sql
CREATE DATABASE berez_db;
```

## 2. Backend Setup (FastAPI)
Navigate to the backend directory and install dependencies.

a. Create a Virtual Environment (Optional but Recommended)
For Python projects, it's a good practice to use a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # For Unix or MacOS
venv\Scripts\activate  # For Windows
```
b. Install Required Packages
Install FastAPI, Uvicorn, SQLAlchemy, and FastAPI-SQLAlchemy:

```bash
pip install -r requirements
```

d. Run the FastAPI Application
Start the FastAPI server:

```bash
cd backend
uvicorn main:app --reload
```
The API will be available at http://localhost:8000.
