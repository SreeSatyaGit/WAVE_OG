from flask import Blueprint, jsonify

blueprint_health = Blueprint("health", __name__)


@blueprint_health.get("/health")
def healthcheck():
    return jsonify({"status": "ok"})
