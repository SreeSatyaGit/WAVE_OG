import { fetchJson } from "../../../services/api";

const API_BASE_URL = "http://127.0.0.1:5000/api/v1";

function fetchRuns(status = "") {
  const query = status ? `?status=${status}` : "";
  return fetchJson(`${API_BASE_URL}/runs${query}`);
}

function fetchStats() {
  return fetchJson(`${API_BASE_URL}/stats`);
}

function createRun(payload) {
  return fetchJson(`${API_BASE_URL}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function updateRun(runId, status) {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}?status=${status}`, {
    method: "PATCH",
  });

  return response.json();
}

export { createRun, fetchRuns, fetchStats, updateRun };
