import base64
import json
import azure.functions as func


def get_principal(req: func.HttpRequest) -> dict | None:
    header = req.headers.get("x-ms-client-principal")
    if not header:
        return None
    try:
        decoded = base64.b64decode(header).decode("utf-8")
        return json.loads(decoded)
    except Exception:
        return None


def is_admin(req: func.HttpRequest) -> bool:
    principal = get_principal(req)
    if not principal:
        return False
    roles = [r.get("val", "") for r in principal.get("userRoles", [])]
    return "admin" in roles


def get_user_id(req: func.HttpRequest) -> str | None:
    principal = get_principal(req)
    if not principal:
        return None
    return principal.get("userId")


def get_user_details(req: func.HttpRequest) -> dict:
    principal = get_principal(req)
    if not principal:
        return {"name": "Unknown", "id": None, "roles": []}
    return {
        "name": principal.get("userDetails", "Unknown"),
        "id": principal.get("userId"),
        "roles": [r.get("val", "") for r in principal.get("userRoles", [])],
    }


def require_admin(req: func.HttpRequest) -> func.HttpResponse | None:
    """Returns a 403 response if the caller is not an admin, else None."""
    if not is_admin(req):
        return func.HttpResponse(
            json.dumps({"error": "Forbidden"}),
            status_code=403,
            mimetype="application/json",
        )
    return None
