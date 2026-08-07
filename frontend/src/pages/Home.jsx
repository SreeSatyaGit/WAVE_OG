import { useEffect, useState } from "react";

import RunForm from "../features/runs/components/RunForm";
import RunTable from "../features/runs/components/RunTable";
import StatsPanel from "../features/runs/components/StatsPanel";
import { createRun, fetchRuns, fetchStats, updateRun } from "../features/runs/services/runsApi";

function Home() {
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchRuns(selectedStatus).then((data) => setRuns(data));
  }, [selectedStatus]);

  useEffect(() => {
    fetchStats().then((data) => setStats(data));
  }, []);

  function handleCreate(payload) {
    createRun(payload).then((createdRun) => {
      setRuns([...runs, createdRun]);
      return fetchStats();
    }).then((data) => setStats(data));
  }

  function handleStatusChange(runId, status) {
    updateRun(runId, status).then((updatedRun) => {
      setRuns(runs.map((run) => (run.id === updatedRun.id ? updatedRun : run)));
      return fetchStats();
    }).then((data) => setStats(data));
  }

  return (
    <div>
      <h1>Assay Run Monitor</h1>
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

      <RunForm onCreate={handleCreate} />
      <RunTable runs={runs} onStatusChange={handleStatusChange} />
    </div>
  );
}

export default Home;
