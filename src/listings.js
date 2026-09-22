app.get("/api/listings", async (req, res) => {
  try {
    const city =
      typeof req.query.city === "string" ? req.query.city.trim() : "";

    const page = Number.parseInt(req.query.page, 10) || 1;

    if (!city) {
      return res.status(400).json({
        error: "city is required",
      });
    }

    if (page < 1) {
      return res.status(400).json({
        error: "page must be greater than 0",
      });
    }

    const limit = 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT
        l.*,
        a.id AS agency_id,
        a.name AS agency_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object("url", p.url)
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS photos
      FROM listings l
      LEFT JOIN agencies a
        ON a.id = l.agency_id
      LEFT JOIN photos p
        ON p.listing_id = l.id
      WHERE l.city = $1
      GROUP BY l.id, a.id
      ORDER BY l.created_at DESC
      LIMIT $2
      OFFSET $3
    `;

    const { rows } = await db.query(sql, [city, limit, offset]);

    return res.json(rows);
  } catch (error) {
    console.error("Failed to fetch listings", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
