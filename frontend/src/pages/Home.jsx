import { useEffect, useState } from "react";

import RunForm from "../features/runs/components/RunForm";
import RunTable from "../features/runs/components/RunTable";
import StatsPanel from "../features/runs/components/StatsPanel";
import { createRun, fetchRuns, fetchStats, updateRun } from "../features/runs/services/runsApi";
import { describeFieldErrors } from "../features/runs/utils/errorMessages";

function Home() {
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState(null);
  const [sampleIdSearch, setSampleIdSearch] = useState("");

  const visibleRuns = sampleIdSearch.trim()
    ? runs.filter((run) =>
      run.sample_ids.some((sampleId) =>
        sampleId.toLowerCase().includes(sampleIdSearch.trim().toLowerCase())
      )
    )
    : runs;
  useEffect(() => {
    fetchRuns(selectedStatus)
      .then((data) => setRuns(data))
      .catch((err) => setError(describeFieldErrors(err)));
  }, [selectedStatus]);

  useEffect(() => {
    fetchStats()
      .then((data) => setStats(data))
      .catch((err) => setError(describeFieldErrors(err)));
  }, []);
  function handleCreate(payload) {
    createRun(payload)
      .then((createdRun) => {
        setRuns([...runs, createdRun]);
        setError(null);
        return fetchStats();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(describeFieldErrors(err)));
  }

  function handleStatusChange(runId, status, resultSummary) {
    updateRun(runId, status, resultSummary)
      .then((updatedRun) => {
        setRuns(runs.map((run) => (run.id === updatedRun.id ? updatedRun : run)));
        setError(null);
        return fetchStats();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(describeFieldErrors(err)));
  }

  return (
    <div>
      <h1>Assay Run Monitor</h1>
      {error && (
        <ul style={{ color: "red", marginBottom: "12px" }}>
          {error.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}
      <StatsPanel stats={stats} />

      <div style={{ marginBottom: "12px" }}>
        <label htmlFor="status-filter">Filter: </label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <label htmlFor="sample-id-search" style={{ marginLeft: "16px" }}>
          Search sample ID:{" "}
        </label>
        <input
          id="sample-id-search"
          placeholder="e.g. S001"
          value={sampleIdSearch}
          onChange={(event) => setSampleIdSearch(event.target.value)}
        />
      </div>

      <RunForm onCreate={handleCreate} onOpen={() => setError(null)} />
      <RunTable runs={visibleRuns} onStatusChange={handleStatusChange} />
    </div>
  );
}

export default Home;
