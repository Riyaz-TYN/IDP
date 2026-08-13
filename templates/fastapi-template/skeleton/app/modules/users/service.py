from app.modules.users.models import User
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserUpdate
from app.shared.exceptions import NotFoundError, ConflictError


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def list_users(self, skip: int = 0, limit: int = 20) -> list[User]:
        return await self.repo.get_all(skip=skip, limit=limit)

    async def get_user(self, user_id: int) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return user

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise ConflictError(f"Email {data.email} is already registered")
        return await self.repo.create(data)

    async def update_user(self, user_id: int, data: UserUpdate) -> User:
        user = await self.get_user(user_id)
        return await self.repo.update(user, data)

    async def delete_user(self, user_id: int) -> None:
        user = await self.get_user(user_id)
        await self.repo.delete(user)
