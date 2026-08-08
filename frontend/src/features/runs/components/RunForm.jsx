import { useState } from "react";

function RunForm({ onCreate, onOpen }) {
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("");
  const [sampleIds, setSampleIds] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle() {      // Lets the parent clear any leftover error banner when the form reopens
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen) {
      onOpen?.();
    }
  }

  function handleSubmit() {
    onCreate({
      name,
      protocol,
      sample_ids: sampleIds.split(",").map((sampleId) => sampleId.trim()),
    })
      .then(() => {
        setName("");
        setProtocol("");
        setSampleIds("");
        setIsOpen(false);     // Only clear + close on a successful create
      })
      .catch(() => {
        // Stay open with what the user typed so they can fix it and
        // resubmit — Home.jsx already surfaces the error banner.
      });
  }


  return (
    <div style={{ marginBottom: "16px" }}>
      <button onClick={handleToggle}>+ New Run</button>
      {isOpen && (
        <div style={{ marginTop: "12px", border: "1px solid #ccc", padding: "12px" }}>
          <div>
            <input
              placeholder="Run name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Protocol"
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Sample IDs (comma-separated)"
              value={sampleIds}
              onChange={(event) => setSampleIds(event.target.value)}
            />
          </div>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}

export default RunForm;