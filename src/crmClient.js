import crypto from "node:crypto";

const CRM_URL = "https://crm.example.com/v1/leads";

const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 5000;
const INITIAL_BACKOFF_MS = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createIdempotencyKey(lead) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(lead))
    .digest("hex");
}

export async function createLead(lead) {
  const crmToken = process.env.CRM_TOKEN;  
  if (!crmToken) {
    throw new Error("CRM token is not configured");
  }

  const idempotencyKey = createIdempotencyKey(lead);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await fetch(CRM_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${crmToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(lead),
        signal: controller.signal,
      });

      if (response.status === 201) {
        return await response.json();
      }

      if (response.status === 400 || response.status === 401) {
        throw new Error(`CRM request failed with status ${response.status}`);
      }

      const isTemporaryError =
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503;

      if (!isTemporaryError) {
        throw new Error(`CRM request failed with status ${response.status}`);
      }

      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `CRM request failed after ${MAX_ATTEMPTS} attempts`,
        );
      }

      let delay = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);

      if (response.status === 429) {
        const retryAfter = Number(
          response.headers.get("Retry-After"),
        );

        if (Number.isFinite(retryAfter) && retryAfter >= 0) {
          delay = retryAfter * 1000;
        }
      }

      await sleep(delay);
    } catch (error) {
      if (error.name === "AbortError") {
        if (attempt === MAX_ATTEMPTS) {
          throw new Error(
            `CRM request timed out after ${MAX_ATTEMPTS} attempts`,
          );
        }

        const delay = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
        await sleep(delay);
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}