const getLodgifyBookedDates = async (startDate, endDate) => {
  try {
    console.log("Utils Lodgify - Recupero date occupate:", {
      startDate,
      endDate,
    });

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        occupiedDates: [],
        error: "Formato date non valido. Usa YYYY-MM-DD",
      };
    }

    const propertyId = process.env.LODGIFY_PROPERTY_ID;
    const startISO = `${startDate}T00:00:00Z`;
    const endISO = `${endDate}T23:59:59Z`;
    const url = `https://api.lodgify.com/v2/availability/${propertyId}?start=${encodeURIComponent(
      startISO
    )}&end=${encodeURIComponent(endISO)}&includeDetails=true`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-ApiKey": process.env.LODGIFY_API_KEY,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("Utils Lodgify - Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const errMsg =
        errorText && errorText.trim() !== ""
          ? errorText
          : `Errore HTTP ${response.status}: ${
              response.statusText || "Accesso negato"
            }`;
      console.error("Utils Lodgify - Errore API:", errMsg);
      return { occupiedDates: [], error: errMsg, status: response.status };
    }

    const data = await response.json();
    const occupiedDates = [];

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((property) => {
        if (Array.isArray(property.periods)) {
          property.periods.forEach((period) => {
            const isBooked =
              period.booking_status === "booked" ||
              period.closed_period ||
              period.available === 0;

            if (isBooked) {
              // 👉 forzo mezzogiorno UTC per evitare che il fuso accorci il range
              const start = new Date(period.start.split("T")[0] + "T12:00:00Z");
              const end = new Date(period.end.split("T")[0] + "T12:00:00Z");

              // 👉 includo anche il giorno di check-out
              for (
                let d = new Date(start);
                d <= end;
                d.setDate(d.getDate() + 1)
              ) {
                occupiedDates.push(d.toISOString().split("T")[0]);
              }
            }
          });
        }
      });
    }

    return {
      occupiedDates: [...new Set(occupiedDates)],
      error: null,
    };
  } catch (error) {
    console.error("Utils Lodgify - Errore generale:", error.message);
    return {
      occupiedDates: [],
      error: error.message,
    };
  }
};

module.exports = { getLodgifyBookedDates };
