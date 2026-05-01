import json
import os
import uuid
from datetime import datetime

import azure.functions as func
from pydantic import ValidationError

import auth
import cosmos_client as db
from models import Category, Demo, DemoCreate, DemoUpdate, new_demo

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


def json_response(data, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(data),
        status_code=status_code,
        mimetype="application/json",
    )


def error_response(message: str, status_code: int) -> func.HttpResponse:
    return json_response({"error": message}, status_code)


# ---------------------------------------------------------------------------
# /api/login
# ---------------------------------------------------------------------------

@app.route(route="login", methods=["POST"])
def login(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        password = body.get("password", "")
    except ValueError:
        return error_response("Invalid JSON", 400)

    admin_pw = os.environ.get("ADMIN_PASSWORD", "")
    demo_pw = os.environ.get("DEMO_PASSWORD", "")

    if admin_pw and password == admin_pw:
        return json_response({"token": auth.make_token(password), "isAdmin": True})
    if demo_pw and password == demo_pw:
        return json_response({"token": auth.make_token(password), "isAdmin": False})

    return error_response("Invalid password", 401)


# ---------------------------------------------------------------------------
# /api/me
# ---------------------------------------------------------------------------

@app.route(route="me", methods=["GET"])
def me(req: func.HttpRequest) -> func.HttpResponse:
    unauthorized = auth.require_auth(req)
    if unauthorized:
        return unauthorized
    return json_response(auth.get_user_details(req))


# ---------------------------------------------------------------------------
# /api/demos
# ---------------------------------------------------------------------------

@app.route(route="demos", methods=["GET"])
def list_demos(req: func.HttpRequest) -> func.HttpResponse:
    unauthorized = auth.require_auth(req)
    if unauthorized:
        return unauthorized

    category = req.params.get("category")
    featured = req.params.get("featured")
    search = req.params.get("search", "").lower()

    if category and category != "All":
        query = "SELECT * FROM c WHERE c.category = @category AND NOT IS_DEFINED(c.type)"
        params = [{"name": "@category", "value": category}]
        docs = db.query_items(query, params)
    else:
        query = "SELECT * FROM c WHERE NOT IS_DEFINED(c.type) OR c.type != 'category'"
        docs = db.query_items(query)

    demos = [Demo.from_cosmos(d) for d in docs]

    if featured == "true":
        demos = [d for d in demos if d.featured]

    if search:
        demos = [
            d for d in demos
            if search in d.title.lower()
            or search in d.description.lower()
            or any(search in t.lower() for t in d.tags)
        ]

    demos_sorted = sorted(demos, key=lambda d: d.created_at, reverse=True)
    return json_response([d.model_dump() for d in demos_sorted])


@app.route(route="demos", methods=["POST"])
def create_demo(req: func.HttpRequest) -> func.HttpResponse:
    forbidden = auth.require_admin(req)
    if forbidden:
        return forbidden

    try:
        body = req.get_json()
        demo_data = DemoCreate(**body)
    except (ValueError, ValidationError) as e:
        return error_response(str(e), 400)

    demo = new_demo(demo_data)
    db.upsert_item(demo.to_cosmos())
    return json_response(demo.model_dump(), 201)


# ---------------------------------------------------------------------------
# /api/demos/{id}
# ---------------------------------------------------------------------------

@app.route(route="demos/{demo_id}", methods=["GET"])
def get_demo(req: func.HttpRequest, demo_id: str) -> func.HttpResponse:
    unauthorized = auth.require_auth(req)
    if unauthorized:
        return unauthorized

    query = "SELECT * FROM c WHERE c.id = @id"
    params = [{"name": "@id", "value": demo_id}]
    docs = db.query_items(query, params)
    if not docs:
        return error_response("Demo not found", 404)

    doc = docs[0]
    try:
        db.patch_item(
            doc["id"],
            doc["category"],
            [{"op": "incr", "path": "/viewCount", "value": 1}],
        )
        doc["viewCount"] = doc.get("viewCount", 0) + 1
    except Exception:
        pass

    return json_response(Demo.from_cosmos(doc).model_dump())


@app.route(route="demos/{demo_id}", methods=["PUT"])
def update_demo(req: func.HttpRequest, demo_id: str) -> func.HttpResponse:
    forbidden = auth.require_admin(req)
    if forbidden:
        return forbidden

    query = "SELECT * FROM c WHERE c.id = @id"
    params = [{"name": "@id", "value": demo_id}]
    docs = db.query_items(query, params)
    if not docs:
        return error_response("Demo not found", 404)

    try:
        updates = DemoUpdate(**req.get_json())
    except (ValueError, ValidationError) as e:
        return error_response(str(e), 400)

    doc = docs[0]
    update_data = updates.model_dump(exclude_none=True)
    field_map = {
        "title": "title",
        "description": "description",
        "category": "category",
        "demo_url": "demoUrl",
        "repo_url": "repoUrl",
        "thumbnail_url": "thumbnailUrl",
        "featured": "featured",
        "tags": "tags",
    }
    for field, cosmos_key in field_map.items():
        if field in update_data:
            doc[cosmos_key] = update_data[field]

    doc["updatedAt"] = datetime.utcnow().isoformat() + "Z"
    db.upsert_item(doc)
    return json_response(Demo.from_cosmos(doc).model_dump())


@app.route(route="demos/{demo_id}", methods=["DELETE"])
def delete_demo(req: func.HttpRequest, demo_id: str) -> func.HttpResponse:
    forbidden = auth.require_admin(req)
    if forbidden:
        return forbidden

    query = "SELECT * FROM c WHERE c.id = @id"
    params = [{"name": "@id", "value": demo_id}]
    docs = db.query_items(query, params)
    if not docs:
        return error_response("Demo not found", 404)

    doc = docs[0]
    db.delete_item(doc["id"], doc["category"])
    return func.HttpResponse(status_code=204)


# ---------------------------------------------------------------------------
# /api/categories
# ---------------------------------------------------------------------------

@app.route(route="categories", methods=["GET"])
def list_categories(req: func.HttpRequest) -> func.HttpResponse:
    unauthorized = auth.require_auth(req)
    if unauthorized:
        return unauthorized

    query = "SELECT * FROM c WHERE c.type = 'category'"
    docs = db.query_items(query)
    categories = [Category.from_cosmos(d) for d in docs]
    return json_response([c.model_dump() for c in categories])


@app.route(route="categories", methods=["POST"])
def create_category(req: func.HttpRequest) -> func.HttpResponse:
    forbidden = auth.require_admin(req)
    if forbidden:
        return forbidden

    try:
        body = req.get_json()
        name = body.get("name", "").strip()
        if not name:
            return error_response("name is required", 400)
    except ValueError:
        return error_response("Invalid JSON", 400)

    category = Category(
        id=str(uuid.uuid4()),
        name=name,
        description=body.get("description"),
        icon=body.get("icon"),
    )
    doc = category.to_cosmos()
    doc["category"] = "category"
    db.upsert_item(doc)
    return json_response(category.model_dump(), 201)


@app.route(route="categories/{category_id}", methods=["DELETE"])
def delete_category(req: func.HttpRequest, category_id: str) -> func.HttpResponse:
    forbidden = auth.require_admin(req)
    if forbidden:
        return forbidden

    try:
        db.delete_item(category_id, "category")
    except Exception:
        return error_response("Category not found", 404)
    return func.HttpResponse(status_code=204)
