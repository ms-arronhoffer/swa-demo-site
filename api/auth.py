import hashlib
import hmac
import json
import os

import azure.functions as func

_SECRET = os.environ.get("FLASK_SECRET_KEY", "dev-secret")
_DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "")
_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")


def make_token(password: str) -> str:
    return hmac.new(_SECRET.encode(), password.encode(), hashlib.sha256).hexdigest()


def _get_token(req: func.HttpRequest) -> str | None:
    return req.headers.get("X-Auth-Token")


def is_authenticated(req: func.HttpRequest) -> bool:
    token = _get_token(req)
    if not token or not _DEMO_PASSWORD:
        return False
    valid = {make_token(_DEMO_PASSWORD)}
    if _ADMIN_PASSWORD:
        valid.add(make_token(_ADMIN_PASSWORD))
    return any(hmac.compare_digest(token, t) for t in valid)


def is_admin(req: func.HttpRequest) -> bool:
    token = _get_token(req)
    if not token or not _ADMIN_PASSWORD:
        return False
    return hmac.compare_digest(token, make_token(_ADMIN_PASSWORD))


def get_user_details(req: func.HttpRequest) -> dict:
    if is_admin(req):
        return {"name": "Admin", "id": None, "roles": ["admin", "authenticated"]}
    if is_authenticated(req):
        return {"name": "User", "id": None, "roles": ["authenticated"]}
    return {"name": "Unknown", "id": None, "roles": []}


def require_auth(req: func.HttpRequest) -> func.HttpResponse | None:
    if not is_authenticated(req):
        return func.HttpResponse(
            json.dumps({"error": "Unauthorized"}),
            status_code=401,
            mimetype="application/json",
        )
    return None


def require_admin(req: func.HttpRequest) -> func.HttpResponse | None:
    if not is_admin(req):
        return func.HttpResponse(
            json.dumps({"error": "Forbidden"}),
            status_code=403,
            mimetype="application/json",
        )
    return None
