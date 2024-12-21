from fastapi import FastAPI
from app.routes import user_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(user_routes.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Replace with the origin of your frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allows custom headers like Authorization
)

@app.get("/")
def root():
    return {"message": "Backend is running"}


