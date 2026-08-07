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

  useEffect(() => {
    fetchRuns(selectedStatus).then((data) => setRuns(data));
  }, [selectedStatus]);

  useEffect(() => {
    fetchStats().then((data) => setStats(data));
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
      </div>

      <RunForm onCreate={handleCreate} onOpen={() => setError(null)} />
      <RunTable runs={runs} onStatusChange={handleStatusChange} />
    </div>
  );
}

export default Home;
