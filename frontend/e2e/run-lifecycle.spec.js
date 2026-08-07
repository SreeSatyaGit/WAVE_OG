import { test, expect } from "@playwright/test";
function uniqueRunName() {
    return `E2E Run ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

const STATUS_COLUMN = 4;
const RESULT_SUMMARY_COLUMN = 5;

test("create -> start -> complete with a result summary reflects end to end", async ({ page }) => {
    const runName = uniqueRunName();
    const protocol = "LC-MS v2";
    const summary = "All samples passed QC";

    await page.goto("/");

    // --- Create -------------------------------------------------------
    await page.getByRole("button", { name: "+ New Run" }).click();
    await page.getByPlaceholder("Run name").fill(runName);
    await page.getByPlaceholder("Protocol").fill(protocol);
    await page.getByPlaceholder("Sample IDs (comma-separated)").fill("S100, S101");
    await page.getByRole("button", { name: "Submit" }).click();

    const row = page.locator("tr", { hasText: runName });
    await expect(row).toBeVisible();
    await expect(row.locator("td").nth(STATUS_COLUMN)).toHaveText("pending");
    await expect(row.locator("td").nth(RESULT_SUMMARY_COLUMN)).toHaveText("");

    // --- Start (pending -> running) ------------------------------------
    await row.getByRole("button", { name: "Start" }).click();
    await expect(row.locator("td").nth(STATUS_COLUMN)).toHaveText("running");

    // --- Complete with a result summary (running -> completed) --------
    await row.getByRole("button", { name: "Complete" }).click();
    await row.getByPlaceholder("Result summary (optional)").fill(summary);
    await row.getByRole("button", { name: "Confirm Complete" }).click();

    await expect(row.locator("td").nth(STATUS_COLUMN)).toHaveText("completed");
    await expect(row.locator("td").nth(RESULT_SUMMARY_COLUMN)).toHaveText(summary);

    // Confirms the summary actually round-tripped through the real API,
    // not just optimistic local state.
    await page.reload();
    const reloadedRow = page.locator("tr", { hasText: runName });
    await expect(reloadedRow.locator("td").nth(STATUS_COLUMN)).toHaveText("completed");
    await expect(reloadedRow.locator("td").nth(RESULT_SUMMARY_COLUMN)).toHaveText(summary);
});

test("failing a running run with a blank summary persists an empty result summary", async ({ page }) => {
    const runName = uniqueRunName();

    await page.goto("/");

    await page.getByRole("button", { name: "+ New Run" }).click();
    await page.getByPlaceholder("Run name").fill(runName);
    await page.getByPlaceholder("Protocol").fill("GC-MS");
    await page.getByPlaceholder("Sample IDs (comma-separated)").fill("S200");
    await page.getByRole("button", { name: "Submit" }).click();

    const row = page.locator("tr", { hasText: runName });
    await row.getByRole("button", { name: "Start" }).click();
    await expect(row.locator("td").nth(STATUS_COLUMN)).toHaveText("running");

    // Fail without typing a summary — should submit "" and persist it as an
    // intentional blank, not silently drop it.
    await row.getByRole("button", { name: "Fail" }).click();
    await row.getByRole("button", { name: "Confirm Fail" }).click();

    await expect(row.locator("td").nth(STATUS_COLUMN)).toHaveText("failed");
    await expect(row.locator("td").nth(RESULT_SUMMARY_COLUMN)).toHaveText("");

    await page.reload();
    const reloadedRow = page.locator("tr", { hasText: runName });
    await expect(reloadedRow.locator("td").nth(STATUS_COLUMN)).toHaveText("failed");
});

test("an invalid transition attempted directly against the API surfaces a 409", async ({ page }) => {
    const runName = uniqueRunName();

    await page.goto("/");

    await page.getByRole("button", { name: "+ New Run" }).click();
    await page.getByPlaceholder("Run name").fill(runName);
    await page.getByPlaceholder("Protocol").fill("LC-MS v2");
    await page.getByPlaceholder("Sample IDs (comma-separated)").fill("S300");
    await page.getByRole("button", { name: "Submit" }).click();

    const row = page.locator("tr", { hasText: runName });
    await expect(row.locator("td").nth(STATUS_COLUMN)).toHaveText("pending");

    // A pending run only offers "Start" in the UI, so we hit the API
    // directly to attempt the disallowed pending -> completed jump and
    // confirm the backend still rejects it with a real HTTP call.
    const runId = (await row.locator("td").nth(0).textContent()).trim();

    const response = await page.request.patch(
        `http://127.0.0.1:5000/api/v1/runs/${runId}`,
        { data: { status: "completed" } }
    );
    expect(response.status()).toBe(409);
});