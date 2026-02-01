from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import os
import uuid
import jwt
import bcrypt
from dotenv import load_dotenv

# 1. Initialization and Lifespan
load_dotenv()

client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    # These will be pulled from Vercel's Environment Variables in production
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    if not mongo_url:
        raise ValueError("MONGO_URL environment variable is not set")
        
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    yield
    if client:
        client.close()

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'rice-cs-gsa-secret-key-2024')
JWT_ALGORITHM = "HS256"

# ===================== MODELS =====================

class AdminCreate(BaseModel):
    username: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str
    username: str

class EventBase(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    event_type: str = "general"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    event_type: Optional[str] = None

class Event(EventBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Officer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    bio: str
    image_url: str
    email: Optional[str] = None
    order: int = 0

class OfficerCreate(BaseModel):
    name: str
    role: str
    bio: str
    image_url: str
    email: Optional[str] = None
    order: int = 0

class GalleryImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: str
    order: int = 0

class GalleryImageCreate(BaseModel):
    url: str
    caption: str
    order: int = 0

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(username: str) -> str:
    payload = {
        "username": username,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("username")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ===================== ROUTES =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register_admin(admin: AdminCreate):
    global db
    existing = await db.admins.find_one({"username": admin.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = hash_password(admin.password)
    admin_doc = {
        "id": str(uuid.uuid4()),
        "username": admin.username,
        "password": hashed,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin_doc)
    return TokenResponse(token=create_token(admin.username), username=admin.username)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login_admin(admin: AdminLogin):
    global db
    admin_doc = await db.admins.find_one({"username": admin.username})
    if not admin_doc or not verify_password(admin.password, admin_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(token=create_token(admin.username), username=admin.username)

@api_router.get("/events", response_model=List[Event])
async def get_events():
    global db
    return await db.events.find({}, {"_id": 0}).sort("date", 1).to_list(1000)

@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate, current_admin: str = Depends(get_current_admin)):
    global db
    event_obj = Event(**event.model_dump())
    await db.events.insert_one(event_obj.model_dump())
    return event_obj

@api_router.get("/officers", response_model=List[Officer])
async def get_officers():
    global db
    # This powers your 'People' page
    return await db.officers.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@api_router.post("/officers", response_model=Officer)
async def create_officer(officer: OfficerCreate, current_admin: str = Depends(get_current_admin)):
    global db
    officer_obj = Officer(**officer.model_dump())
    await db.officers.insert_one(officer_obj.model_dump())
    return officer_obj

@api_router.get("/gallery", response_model=List[GalleryImage])
async def get_gallery():
    global db
    return await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@api_router.post("/seed")
async def seed_data():
    global db
    # Add your seeding logic from original server.py here if needed
    return {"message": "Database seeded successfully"}

@api_router.get("/")
async def root():
    return {"message": "Rice CS GSA API", "version": "1.0.0"}

# Finalize
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)