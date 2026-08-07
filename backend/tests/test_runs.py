def test_create_run_returns_defaults(client):
    response = client.post(
        "/api/v1/runs",
        json={
            "name": "Run A",
            "protocol": "LC-MS v2",
            "sample_ids": ["S001", "S002"],
        },
    )
    assert response.status_code == 201
    payload = response.get_json()

    assert payload["id"] == 1
    assert payload["status"] == "pending"
    assert payload["result_summary"] is None
    assert payload["completed_at"] is None
    assert payload["sample_ids"] == ["S001", "S002"]


def test_get_runs_returns_created_runs(client):
    client.post(
        "/api/v1/runs",
        json={
            "name": "Run A",
            "protocol": "LC-MS v2",
            "sample_ids": ["S001", "S002"],
        },
    )
    response = client.get("/api/v1/runs")
    assert response.status_code == 200
    payload = response.get_json()

    assert len(payload) == 1
    assert payload[0]["name"] == "Run A"
    assert payload[0]["status"] == "pending"


def test_get_run_not_found_returns_404(client):
    response = client.get("/api/v1/runs/9999")
    assert response.status_code == 404


def test_update_run_accepts_json_body_and_persists_result_summary(client):
    client.post(
        "/api/v1/runs",
        json={
            "name": "Run B",
            "protocol": "GC-MS",
            "sample_ids": ["S010"],
        },
    )

    start_response = client.patch("/api/v1/runs/1", json={"status": "running"})
    assert start_response.status_code == 200
    assert start_response.get_json()["status"] == "running"

    finish_response = client.patch(
        "/api/v1/runs/1",
        json={
            "status": "completed",
            "result_summary": "All samples passed QC",
        },
    )
    assert finish_response.status_code == 200

    payload = finish_response.get_json()
    assert payload["status"] == "completed"
    assert payload["result_summary"] == "All samples passed QC"
    assert payload["completed_at"] is not None


def test_update_run_persists_intentionally_blank_result_summary(client):
    client.post(
        "/api/v1/runs",
        json={
            "name": "Run C",
            "protocol": "LC-MS v2",
            "sample_ids": ["S020"],
        },
    )

    start_response = client.patch("/api/v1/runs/1", json={"status": "running"})
    assert start_response.status_code == 200

    finish_response = client.patch(
        "/api/v1/runs/1",
        json={
            "status": "failed",
            "result_summary": "",
        },
    )
    assert finish_response.status_code == 200

    payload = finish_response.get_json()
    assert payload["status"] == "failed"
    assert payload["result_summary"] == ""
    assert payload["completed_at"] is not None


def test_rejects_invalid_status_transition(client):
    client.post(
        "/api/v1/runs",
        json={
            "name": "Run B",
            "protocol": "GC-MS",
            "sample_ids": ["S010"],
        },
    )

    response = client.patch("/api/v1/runs/1", json={"status": "completed"})
    assert response.status_code == 409


def test_stats_returns_totals_and_average_samples(client):
    client.post(
        "/api/v1/runs",
        json={
            "name": "Run A",
            "protocol": "LC-MS v2",
            "sample_ids": ["S001", "S002"],
        },
    )
    client.post(
        "/api/v1/runs",
        json={
            "name": "Run B",
            "protocol": "GC-MS",
            "sample_ids": ["S010"],
        },
    )

    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    payload = response.get_json()

    assert payload["total"] == 2
    assert payload["by_status"] == {"pending": 2}
    assert payload["avg_samples_per_run"] == 1.5
