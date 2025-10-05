const setBookingAsBookedLodgify = async (lodgifyBookingId) => {
  try {
    const response = await fetch(
      `https://api.lodgify.com/v1/reservation/booking/${lodgifyBookingId}/book?requestPayment=false`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-ApiKey": process.env.LODGIFY_API_KEY, // la tua chiave API Lodgify
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Errore Lodgify (${response.status}): ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json().catch(() => ({}));
    console.log("✅ Prenotazione Lodgify aggiornata con successo:", data);
    return data;
  } catch (error) {
    console.error("❌ Errore aggiornamento prenotazione Lodgify:", error);
    throw error;
  }
};

module.exports = { setBookingAsBookedLodgify };
