from fastapi import APIRouter, status

from app.core.deps import DB
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserResponse, UserUpdate
from app.modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def get_service(db: DB) -> UserService:
    return UserService(UserRepository(db))


@router.get("/", response_model=list[UserResponse])
async def list_users(db: DB, skip: int = 0, limit: int = 20):
    return await get_service(db).list_users(skip=skip, limit=limit)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(body: UserCreate, db: DB):
    return await get_service(db).create_user(body)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: DB):
    return await get_service(db).get_user(user_id)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, body: UserUpdate, db: DB):
    return await get_service(db).update_user(user_id, body)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: DB):
    await get_service(db).delete_user(user_id)
