function StatsPanel({ stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <strong>Total:</strong> {stats.total} &nbsp;
      {Object.entries(stats.by_status).map(([status, count]) => (
        <span key={status} style={{ marginRight: "8px" }}>
          {status}: {count}
        </span>
      ))}
    </div>
  );
}

export default StatsPanel;
