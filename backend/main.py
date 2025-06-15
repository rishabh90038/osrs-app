from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ✅ required for CORS
from database import init_db
from api import router as api_router
from fetcher import start_background_tasks


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # exact port, not just localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    start_background_tasks()

app.include_router(api_router)
