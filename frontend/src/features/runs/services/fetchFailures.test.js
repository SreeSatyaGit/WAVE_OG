import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRuns, fetchStats } from "./runsApi";

describe("fetchRuns", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("rejects with the parsed error body when the server responds with a non-2xx status", async () => {
        const errorBody = { error: "Internal Server Error" };
        fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => errorBody });

        await expect(fetchRuns()).rejects.toEqual(errorBody);
    });

    it("rejects when the network request itself fails (e.g. server unreachable)", async () => {
        fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

        await expect(fetchRuns()).rejects.toThrow("Failed to fetch");
    });

    it("rejects when the response body is not valid JSON, even on a 200", async () => {
        // e.g. a proxy returning an HTML error page with a 200, or an empty body
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => { throw new SyntaxError("Unexpected end of JSON input"); },
        });

        await expect(fetchRuns()).rejects.toThrow("Unexpected end of JSON input");
    });

    it("resolves with the parsed list when the server responds 200", async () => {
        const runs = [{ id: 1, status: "pending" }];
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => runs });

        await expect(fetchRuns()).resolves.toEqual(runs);
    });

    it("requests without a query string when no status filter is given", async () => {
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] });
        await fetchRuns();
        expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:5000/api/v1/runs", expect.anything());
    });

    it("requests with a status query string when a status filter is given", async () => {
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] });
        await fetchRuns("completed");
        expect(fetch).toHaveBeenCalledWith(
            "http://127.0.0.1:5000/api/v1/runs?status=completed",
            expect.anything()
        );
    });
});

describe("fetchStats", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("rejects with the parsed error body when the server responds with a non-2xx status", async () => {
        const errorBody = { error: "Internal Server Error" };
        fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => errorBody });

        await expect(fetchStats()).rejects.toEqual(errorBody);
    });

    it("rejects when the network request itself fails", async () => {
        fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

        await expect(fetchStats()).rejects.toThrow("Failed to fetch");
    });

    it("resolves with the parsed stats object when the server responds 200", async () => {
        const stats = { total: 2, by_status: { pending: 2 }, avg_samples_per_run: 1.5 };
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => stats });

        await expect(fetchStats()).resolves.toEqual(stats);
    });
});