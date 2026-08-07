import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "./Home";

function makeRun(overrides = {}) {
  return {
    id: 1,
    name: "Run A",
    protocol: "LC-MS v2",
    sample_ids: ["S001"],
    status: "running",
    result_summary: null,
    created_at: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("Home status-update error handling", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an error banner instead of crashing when a status update is rejected", async () => {
    const run = makeRun();

    fetch.mockImplementation((url, options = {}) => {
      if (options.method === "PATCH") {
        return Promise.resolve({
          ok: false,
          status: 409,
          json: async () => ({
            error: "invalid status transition",
            from: "running",
            to: "completed",
          }),
        });
      }
      if (url.includes("/stats")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ total: 1, by_status: { running: 1 }, avg_samples_per_run: 1 }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [run] });
    });

    const user = userEvent.setup();
    render(<Home />);

    const completeButton = await screen.findByRole("button", { name: "Complete" });
    await user.click(completeButton);
    await user.click(screen.getByRole("button", { name: "Confirm Complete" }));

    // Rejection must surface as a visible message, not crash the page.
    expect(await screen.findByText("invalid status transition")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assay Run Monitor" })).toBeInTheDocument();

    // The row reverts to its pre-transition state rather than staying stuck.
    expect(await screen.findByRole("button", { name: "Complete" })).toBeInTheDocument();
  });

  it("clears a previous update error once a later update succeeds", async () => {
    const run = makeRun();
    let patchCallCount = 0;

    fetch.mockImplementation((url, options = {}) => {
      if (options.method === "PATCH") {
        patchCallCount += 1;
        if (patchCallCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 409,
            json: async () => ({ error: "invalid status transition" }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ ...run, status: "completed", result_summary: "done" }),
        });
      }
      if (url.includes("/stats")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ total: 1, by_status: { running: 1 }, avg_samples_per_run: 1 }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [run] });
    });

    const user = userEvent.setup();
    render(<Home />);

    await user.click(await screen.findByRole("button", { name: "Complete" }));
    await user.click(screen.getByRole("button", { name: "Confirm Complete" }));
    expect(await screen.findByText("invalid status transition")).toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "Complete" }));
    await user.click(screen.getByRole("button", { name: "Confirm Complete" }));

    expect(screen.queryByText("invalid status transition")).not.toBeInTheDocument();
  });
});
