app.post("/webhooks/payment", express.json(), async (req, res) => {
  try {
    const event = req.body;

    if (event.type !== "payment.succeeded") {
      return res.status(200).send("ok");
    }

    await db.query(
      "UPDATE bookings SET status = $1 WHERE id = $2",
      ["paid", event.booking_id],
    );

    res.status(200).send("ok");

    Promise.all([
      sendEmail(
        event.customer_email,
        "Paiement confirmé",
        buildReceipt(event),
      ),
      crm.notifyPayment(event),
    ]).catch((error) => {
      console.error("Payment post-processing failed", error);
    });
  } catch (error) {
    console.error("Payment webhook failed", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});