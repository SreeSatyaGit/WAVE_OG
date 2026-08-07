const DEFAULT_TIMEOUT_MS = 15000;

async function fetchJson(resource, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...rest,
    signal: controller.signal,
  });

  const payload = await response.json();
  window.clearTimeout(timeoutId);

  if (!response.ok) {
    throw payload;
  }

  return payload;
}

export { fetchJson, DEFAULT_TIMEOUT_MS };