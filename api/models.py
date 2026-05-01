from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl, field_validator
import uuid


class DemoBase(BaseModel):
    title: str
    description: str
    category: str
    demo_url: str
    repo_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    featured: bool = False
    tags: list[str] = []


class DemoCreate(DemoBase):
    pass


class DemoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    featured: Optional[bool] = None
    tags: Optional[list[str]] = None


class Demo(DemoBase):
    id: str
    view_count: int = 0
    created_at: str
    updated_at: str

    @classmethod
    def from_cosmos(cls, doc: dict) -> "Demo":
        return cls(
            id=doc["id"],
            title=doc["title"],
            description=doc["description"],
            category=doc["category"],
            demo_url=doc["demoUrl"],
            repo_url=doc.get("repoUrl"),
            thumbnail_url=doc.get("thumbnailUrl"),
            featured=doc.get("featured", False),
            tags=doc.get("tags", []),
            view_count=doc.get("viewCount", 0),
            created_at=doc["createdAt"],
            updated_at=doc["updatedAt"],
        )

    def to_cosmos(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "demoUrl": self.demo_url,
            "repoUrl": self.repo_url,
            "thumbnailUrl": self.thumbnail_url,
            "featured": self.featured,
            "tags": self.tags,
            "viewCount": self.view_count,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }


def new_demo(data: DemoCreate) -> Demo:
    now = datetime.utcnow().isoformat() + "Z"
    return Demo(
        id=str(uuid.uuid4()),
        **data.model_dump(),
        view_count=0,
        created_at=now,
        updated_at=now,
    )


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class Category(CategoryBase):
    id: str

    @classmethod
    def from_cosmos(cls, doc: dict) -> "Category":
        return cls(
            id=doc["id"],
            name=doc["name"],
            description=doc.get("description"),
            icon=doc.get("icon"),
        )

    def to_cosmos(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "type": "category",
        }
