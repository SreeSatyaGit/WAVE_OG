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

function updateRun(runId, status, resultSummary) {
  return fetchJson(`${API_BASE_URL}/runs/${runId}`, { // Routed through fetchJson (throws on non-2xx) with a JSON body — the old 
    method: "PATCH",                                  // raw fetch never checked response.ok, so failed PATCHes looked successful
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, result_summary: resultSummary }),
  });
}

export { createRun, fetchRuns, fetchStats, updateRun };
