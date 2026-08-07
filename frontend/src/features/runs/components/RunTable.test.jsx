import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RunTable from "./RunTable";

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

describe("RunTable result_summary prompt", () => {
    it("does not show a summary input until Complete is clicked", () => {
        render(<RunTable runs={[makeRun()]} onStatusChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("Result summary (optional)")).not.toBeInTheDocument();
    });

    it("submits the typed result_summary when confirming a completed transition", async () => {
        const user = userEvent.setup();
        const onStatusChange = vi.fn();
        render(<RunTable runs={[makeRun()]} onStatusChange={onStatusChange} />);

        await user.click(screen.getByRole("button", { name: "Complete" }));
        const input = screen.getByPlaceholderText("Result summary (optional)");
        await user.type(input, "All samples passed QC");
        await user.click(screen.getByRole("button", { name: "Confirm Complete" }));

        expect(onStatusChange).toHaveBeenCalledWith(1, "completed", "All samples passed QC");
    });

    it("submits an intentionally blank result_summary without typing anything", async () => {
        const user = userEvent.setup();
        const onStatusChange = vi.fn();
        render(<RunTable runs={[makeRun()]} onStatusChange={onStatusChange} />);

        await user.click(screen.getByRole("button", { name: "Fail" }));
        await user.click(screen.getByRole("button", { name: "Confirm Fail" }));

        expect(onStatusChange).toHaveBeenCalledWith(1, "failed", "");
    });

    it("does not call onStatusChange when the transition is cancelled", async () => {
        const user = userEvent.setup();
        const onStatusChange = vi.fn();
        render(<RunTable runs={[makeRun()]} onStatusChange={onStatusChange} />);

        await user.click(screen.getByRole("button", { name: "Complete" }));
        await user.type(screen.getByPlaceholderText("Result summary (optional)"), "draft text");
        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onStatusChange).not.toHaveBeenCalled();
        expect(screen.queryByPlaceholderText("Result summary (optional)")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
    });

    it("displays result_summary for terminal runs but not for pending/running runs", () => {
        const runs = [
            makeRun({ id: 1, status: "pending", result_summary: null }),
            makeRun({ id: 2, status: "running", result_summary: null }),
            makeRun({ id: 3, status: "completed", result_summary: "All samples passed QC" }),
            makeRun({ id: 4, status: "failed", result_summary: "" }),
        ];
        render(<RunTable runs={runs} onStatusChange={vi.fn()} />);

        expect(screen.getByText("All samples passed QC")).toBeInTheDocument();
    });
});
