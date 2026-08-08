import { useState } from "react";

function RunTable({ runs, onStatusChange }) {
  const [pendingTransition, setPendingTransition] = useState(null); // { runId, status } | null
  const [summaryDraft, setSummaryDraft] = useState("");  // Tracks which row is mid-Complete/Fail so we can prompt for an optional summary first

  function startTransition(runId, status) {
    setPendingTransition({ runId, status });
    setSummaryDraft("");
  }

  function cancelTransition() {
    setPendingTransition(null);
    setSummaryDraft("");
  }

  function confirmTransition() {
    onStatusChange(pendingTransition.runId, pendingTransition.status, summaryDraft);
    setPendingTransition(null);
    setSummaryDraft("");
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
          <th>ID</th>
          <th>Name</th>
          <th>Protocol</th>
          <th>Samples</th>
          <th>Status</th>
          <th>Result Summary</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((run) => (
          <tr key={run.id} style={{ borderBottom: "1px solid #eee" }}>
            <td>{run.id}</td>
            <td>{run.name}</td>
            <td>{run.protocol}</td>
            <td>{run.sample_ids.join(", ")}</td>
            <td>{run.status}</td>
            <td>{run.status === "completed" || run.status === "failed" ? run.result_summary : ""}</td>
            <td>
              {/* // Format the raw ISO timestamp for readability instead of showing it raw */}
              {new Date(run.created_at).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </td>
            <td>
              {run.status === "pending" && (
                <button onClick={() => onStatusChange(run.id, "running")}>Start</button>
              )}
              {run.status === "running" && pendingTransition?.runId !== run.id && (
                <>
                  <button onClick={() => startTransition(run.id, "completed")}>Complete</button>
                  <button onClick={() => startTransition(run.id, "failed")}>Fail</button>
                </>
              )}
              {pendingTransition?.runId === run.id && (
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <input
                    placeholder="Result summary (optional)"
                    value={summaryDraft}
                    onChange={(event) => setSummaryDraft(event.target.value)}
                    style={{ width: "160px" }}
                  />
                  <button onClick={confirmTransition}>
                    Confirm {pendingTransition.status === "completed" ? "Complete" : "Fail"}
                  </button>
                  <button onClick={cancelTransition}>Cancel</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RunTable;
