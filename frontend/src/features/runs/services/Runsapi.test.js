import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateRun } from "./runsApi";

describe("updateRun", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("rejects when the server responds with a non-2xx status", async () => {
        const errorBody = {
            error: "invalid status transition",
            from: "pending",
            to: "completed",
        };

        fetch.mockResolvedValueOnce({
            ok: false,
            status: 409,
            json: async () => errorBody,
        });

        // A failed transition must reject the promise so callers can catch it.
        // Today updateRun resolves with the error body instead of throwing,
        // which is the bug this test exposes.
        await expect(updateRun(1, "completed")).rejects.toEqual(errorBody);
    });

    it("resolves with the updated run when the server responds 200", async () => {
        const updatedRun = { id: 1, status: "running" };

        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => updatedRun,
        });

        await expect(updateRun(1, "running")).resolves.toEqual(updatedRun);
    });
});