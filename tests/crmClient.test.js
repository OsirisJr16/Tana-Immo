import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLead } from "./src/crmClient.js";

const lead = {
  listingId: "listing-1",
  name: "Jean Dupont",
  phone: "0340000000",
  email: "jean@example.com",
  message: "Je suis intéressé par ce bien.",
};

describe("createLead", () => {
  beforeEach(() => {
    process.env.CRM_TOKEN = "tana-immo-crm-token";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("réessaie après un 429 puis réussit", async () => {
    fetch
      .mockResolvedValueOnce(
        new Response(null, {
          status: 429,
          headers: {
            "Retry-After": "0",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "lead-123",
            createdAt: "2026-09-22T10:00:00Z",
          }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    const result = await createLead(lead);

    expect(result).toEqual({
      id: "lead-123",
      createdAt: "2026-09-22T10:00:00Z",
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("abandonne après 3 erreurs 500", async () => {
    fetch
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(createLead(lead)).rejects.toThrow(
      "CRM request failed after 3 attempts",
    );

    expect(fetch).toHaveBeenCalledTimes(3);
  });
});