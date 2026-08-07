from flask import Blueprint, jsonify, request

from app.services import run_store

blueprint_runs = Blueprint("runs", __name__, url_prefix="/api/v1")

MAX_NAME_LENGTH = 200
MAX_PROTOCOL_LENGTH = 200
MAX_SAMPLE_ID_LENGTH = 500
MAX_SAMPLE_IDS = 1000


@blueprint_runs.get("/runs")
def get_runs():
    status = request.args.get("status")
    return jsonify(run_store.list_runs(status))


@blueprint_runs.get("/runs/<int:run_id>")
def get_run(run_id):
    run = run_store.get_run(run_id)
    if run:
        run_store.mark_accessed(run)
        return jsonify(run)
    return jsonify({"error": "Run not found"}),404


@blueprint_runs.post("/runs")
def create_run():
    body = request.get_json() or {}
    missing_fields = [field for field in ["name", "protocol", "sample_ids"] if field not in body]
    if missing_fields:
        return jsonify({
            "error": "missing required fields",
            "fields": {field: f"{field} is required" for field in missing_fields},
        }), 400

    field_errors = {}

    if not isinstance(body.get("name"), str) or not body["name"].strip():
        field_errors["name"] = "name must be a non-empty string"
    elif len(body["name"]) > MAX_NAME_LENGTH:
        field_errors["name"] = f"name must be at most {MAX_NAME_LENGTH} characters"

    if not isinstance(body.get("protocol"), str) or not body["protocol"].strip():
        field_errors["protocol"] = "protocol must be a non-empty string"
    elif len(body["protocol"]) > MAX_PROTOCOL_LENGTH:
        field_errors["protocol"] = f"protocol must be at most {MAX_PROTOCOL_LENGTH} characters"

    sample_ids = body.get("sample_ids")
    if not isinstance(sample_ids, list) or not sample_ids:
        field_errors["sample_ids"] = "sample_ids must be a non-empty list"
    elif not all(isinstance(sid, str) and sid.strip() for sid in sample_ids):
        field_errors["sample_ids"] = "sample_ids must contain only non-empty strings"
    elif len(sample_ids) > MAX_SAMPLE_IDS:
        field_errors["sample_ids"] = f"sample_ids must contain at most {MAX_SAMPLE_IDS} entries"
    elif any(len(sid) > MAX_SAMPLE_ID_LENGTH for sid in sample_ids):
        field_errors["sample_ids"] = f"each sample id must be at most {MAX_SAMPLE_ID_LENGTH} characters"

    if field_errors:
        return jsonify({"error": "invalid field values", "fields": field_errors}), 400

    return jsonify(run_store.create_run(body)), 201


@blueprint_runs.patch("/runs/<int:run_id>")
def update_run(run_id):
    body = request.get_json(silent=True) or {}
    status = request.args.get("status") or body.get("status")
    result_summary = request.args.get("result_summary") or body.get("result_summary")

    run = run_store.get_run(run_id)
    if not run:
        return jsonify({"error": "Run not found"}), 404
    if status not in run_store.VALID_STATUSES:
        return jsonify({"error": "invalid status"}), 400
    if result_summary is not None and not isinstance(result_summary, str):
        return jsonify({"error": "result_summary must be a string"}), 400
    if status not in run_store.VALID_TRANSITIONS[run["status"]]:
        return jsonify({
            "error": "invalid status transition",
            "from": run["status"],
            "to": status,
        }), 409

    return jsonify(run_store.update_run(run, status, result_summary))


@blueprint_runs.get("/stats")
def get_stats():
    return jsonify(run_store.get_stats())
