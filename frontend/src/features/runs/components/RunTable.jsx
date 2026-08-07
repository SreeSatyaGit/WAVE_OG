function RunTable({ runs, onStatusChange }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
          <th>ID</th>
          <th>Name</th>
          <th>Protocol</th>
          <th>Samples</th>
          <th>Status</th>
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
            <td>{run.created_at}</td>
            <td>
              {run.status === "pending" && (
                <button onClick={() => onStatusChange(run.id, "running")}>Start</button>
              )}
              {run.status === "running" && (
                <>
                  <button onClick={() => onStatusChange(run.id, "completed")}>Complete</button>
                  <button onClick={() => onStatusChange(run.id, "failed")}>Fail</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RunTable;
