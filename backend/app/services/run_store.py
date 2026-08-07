from datetime import datetime, timezone

RUNS = []
_counter = 0
VALID_STATUSES = ["pending", "running", "completed", "failed"]
VALID_TRANSITIONS = {
    "pending": {"running"},
    "running": {"completed", "failed"},
    "completed": set(),
    "failed": set(),
}


def _now_isoformat():
    return datetime.now(timezone.utc).isoformat()


def next_id():
    global _counter
    _counter += 1
    return _counter


def reset_store():
    global _counter
    RUNS.clear()
    _counter = 0


def list_runs(status=None):
    if status:
        return [run for run in RUNS if run["status"] == status]
    return RUNS


def get_run(run_id):
    for run in RUNS:
        if run["id"] == run_id:
            return run
    return None


def mark_accessed(run):
    run["last_accessed_at"] = _now_isoformat()


def create_run(payload):
    run = {
        "id": next_id(),
        "name": payload["name"],
        "protocol": payload["protocol"],
        "sample_ids": payload["sample_ids"],
        "status": "pending",
        "created_at": _now_isoformat(),
        "completed_at": None,
        "result_summary": None,
        "last_accessed_at": None,
    }
    RUNS.append(run)
    return run


def update_run(run, status, result_summary=None):
    run["status"] = status
    if result_summary is not None:
        run["result_summary"] = result_summary
    if status in ["completed", "failed"]:
        run["completed_at"] = _now_isoformat()
    return run


def get_stats():
    total = len(RUNS)
    by_status = {}
    for run in RUNS:
        current_status = run["status"]
        by_status[current_status] = by_status.get(current_status, 0) + 1

    avg_samples = sum(len(run["sample_ids"]) for run in RUNS) / total if total else 0
    return {
        "total": total,
        "by_status": by_status,
        "avg_samples_per_run": avg_samples,
    }
