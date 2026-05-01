import hashlib
import hmac
import json
import os

import azure.functions as func


def _secret() -> str:
    return os.environ.get("FLASK_SECRET_KEY", "dev-secret")


def _demo_pw() -> str:
    return os.environ.get("DEMO_PASSWORD", "")


def _admin_pw() -> str:
    return os.environ.get("ADMIN_PASSWORD", "")


def make_token(password: str) -> str:
    return hmac.new(_secret().encode(), password.encode(), hashlib.sha256).hexdigest()


def _get_token(req: func.HttpRequest) -> str | None:
    return req.headers.get("X-Auth-Token")


def is_authenticated(req: func.HttpRequest) -> bool:
    token = _get_token(req)
    demo_pw = _demo_pw()
    if not token or not demo_pw:
        return False
    valid = {make_token(demo_pw)}
    admin_pw = _admin_pw()
    if admin_pw:
        valid.add(make_token(admin_pw))
    return any(hmac.compare_digest(token, t) for t in valid)


def is_admin(req: func.HttpRequest) -> bool:
    token = _get_token(req)
    admin_pw = _admin_pw()
    if not token or not admin_pw:
        return False
    return hmac.compare_digest(token, make_token(admin_pw))


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
