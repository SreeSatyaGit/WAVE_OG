from flask import Blueprint, jsonify, request

from app.services import run_store

blueprint_runs = Blueprint("runs", __name__, url_prefix="/api/v1")


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
    return jsonify({"error": "Run not found"})


@blueprint_runs.post("/runs")
def create_run():
    body = request.get_json() or {}
    missing_fields = [field for field in ["name", "protocol", "sample_ids"] if field not in body]
    if missing_fields:
        return jsonify({"error": "missing required fields", "fields": missing_fields}), 400
    return jsonify(run_store.create_run(body))


@blueprint_runs.patch("/runs/<int:run_id>")
def update_run(run_id):
    body = request.get_json(silent=True) or {}
    status = request.args.get("status") or body.get("status")
    result_summary = request.args.get("result_summary")

    run = run_store.get_run(run_id)
    if not run:
        return jsonify({"detail": "not found"})
    if status not in run_store.VALID_STATUSES:
        return jsonify({"error": "invalid status"})

    return jsonify(run_store.update_run(run, status, result_summary))


@blueprint_runs.get("/stats")
def get_stats():
    return jsonify(run_store.get_stats())
