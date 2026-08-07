import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchJson, DEFAULT_TIMEOUT_MS } from "./api";

// Simulates a request that never resolves on its own — the only way it
// settles is via the AbortController firing when the timeout elapses.
// This mirrors how a real hung `fetch` behaves: it rejects with a
// DOMException named "AbortError" once its signal is aborted.
function mockHangingFetch() {
    return vi.fn((resource, options) => {
        return new Promise((_resolve, reject) => {
            options.signal.addEventListener("abort", () => {
                reject(new DOMException("The operation was aborted.", "AbortError"));
            });
        });
    });
}

describe("fetchJson timeout/abort behavior", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("aborts and rejects once a custom timeout elapses", async () => {
        vi.stubGlobal("fetch", mockHangingFetch());

        const result = fetchJson("http://example.com/slow", { timeout: 5000 });
        const assertion = expect(result).rejects.toMatchObject({ name: "AbortError" });

        await vi.advanceTimersByTimeAsync(5000);

        await assertion;
    });

    it("does not abort before a custom timeout elapses", async () => {
        vi.stubGlobal("fetch", mockHangingFetch());

        const result = fetchJson("http://example.com/slow", { timeout: 5000 });
        // Swallow the eventual rejection so advancing past this point later
        // doesn't produce an unhandled rejection warning.
        result.catch(() => { });

        await vi.advanceTimersByTimeAsync(4999);

        expect(fetch).toHaveBeenCalledTimes(1);
        const signal = fetch.mock.calls[0][1].signal;
        expect(signal.aborted).toBe(false);

        // Let it actually abort so the test doesn't leave a dangling timer.
        await vi.advanceTimersByTimeAsync(1);
    });

    it("falls back to the default 15s timeout when none is provided", async () => {
        vi.stubGlobal("fetch", mockHangingFetch());

        const result = fetchJson("http://example.com/slow");
        const assertion = expect(result).rejects.toMatchObject({ name: "AbortError" });

        await vi.advanceTimersByTimeAsync(DEFAULT_TIMEOUT_MS - 1);
        const signalBeforeDeadline = fetch.mock.calls[0][1].signal;
        expect(signalBeforeDeadline.aborted).toBe(false);

        await vi.advanceTimersByTimeAsync(1);

        await assertion;
    });

    it("clears the pending timeout once the response arrives, so it never aborts a completed request", async () => {
        const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ id: 1 }),
            })
        );

        const result = await fetchJson("http://example.com/fast", { timeout: 5000 });

        expect(result).toEqual({ id: 1 });
        expect(clearTimeoutSpy).toHaveBeenCalled();

        // Advancing well past the timeout afterwards should be a no-op —
        // the promise already settled and the timer was cleared.
        await vi.advanceTimersByTimeAsync(10_000);
    });
});