import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RunForm from "./RunForm";

async function fillAndSubmit(user) {
    await user.click(screen.getByRole("button", { name: "+ New Run" }));
    await user.type(screen.getByPlaceholderText("Run name"), "Run A");
    await user.type(screen.getByPlaceholderText("Protocol"), "LC-MS v2");
    await user.type(screen.getByPlaceholderText("Sample IDs (comma-separated)"), "S001");
    await user.click(screen.getByRole("button", { name: "Submit" }));
}

describe("RunForm submission outcome handling", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("keeps the form open and preserves typed values when the submission fails", async () => {
        const user = userEvent.setup();
        const onCreate = vi.fn().mockRejectedValue({ error: "invalid field values" });

        render(<RunForm onCreate={onCreate} />);

        await fillAndSubmit(user);

        await waitFor(() => expect(onCreate).toHaveBeenCalled());

        // A failed create shouldn't collapse the form or discard what the user
        // typed — they should be able to fix the problem and resubmit.
        expect(screen.getByPlaceholderText("Run name")).toHaveValue("Run A");
        expect(screen.getByPlaceholderText("Protocol")).toHaveValue("LC-MS v2");
        expect(screen.getByPlaceholderText("Sample IDs (comma-separated)")).toHaveValue("S001");
    });

    it("clears the form after a successful submission, so reopening it starts blank", async () => {
        const user = userEvent.setup();
        const onCreate = vi.fn().mockResolvedValue({ id: 1, name: "Run A" });

        render(<RunForm onCreate={onCreate} />);

        await fillAndSubmit(user);

        await waitFor(() => expect(onCreate).toHaveBeenCalled());
        // Form closes on success.
        expect(screen.queryByPlaceholderText("Run name")).not.toBeInTheDocument();

        // Reopening for a second run should not show the first run's values.
        await user.click(screen.getByRole("button", { name: "+ New Run" }));
        expect(screen.getByPlaceholderText("Run name")).toHaveValue("");
        expect(screen.getByPlaceholderText("Protocol")).toHaveValue("");
        expect(screen.getByPlaceholderText("Sample IDs (comma-separated)")).toHaveValue("");
    });
});