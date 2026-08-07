import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

describe("Home initial load failure", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("shows an error to the user when the initial runs fetch fails", async () => {
        fetch.mockImplementation((url) => {
            if (url.includes("/stats")) {
                return Promise.resolve({ ok: true, status: 200, json: async () => ({ total: 0, by_status: {}, avg_samples_per_run: 0 }) });
            }
            return Promise.resolve({ ok: false, status: 500, json: async () => ({ error: "Internal Server Error" }) });
        });

        render(<Home />);

        expect(await screen.findByText(/internal server error/i)).toBeInTheDocument();
    });

    it("shows an error to the user when the initial stats fetch fails", async () => {
        fetch.mockImplementation((url) => {
            if (url.includes("/stats")) {
                return Promise.resolve({ ok: false, status: 500, json: async () => ({ error: "Internal Server Error" }) });
            }
            return Promise.resolve({ ok: true, status: 200, json: async () => [] });
        });

        render(<Home />);

        expect(await screen.findByText(/internal server error/i)).toBeInTheDocument();
    });
});