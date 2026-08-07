import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    workers: 1,
    reporter: "list",
    timeout: 30_000,

    use: {
        baseURL: "http://127.0.0.1:5173",
        trace: "on-first-retry",
    },

    webServer: [
        {
            command: "python3 -m flask --app app run --host 127.0.0.1 --port 5000",
            cwd: "../backend",
            url: "http://127.0.0.1:5000/health",
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
            stdout: "pipe",
            stderr: "pipe",
        },
        {
            command: "npx vite --host 127.0.0.1 --port 5173",
            url: "http://127.0.0.1:5173",
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
            stdout: "pipe",
            stderr: "pipe",
        },
    ],

    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ],
});