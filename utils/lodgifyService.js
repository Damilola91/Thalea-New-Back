const checkLodgifyAvailability = async (startDate, endDate) => {
  try {
    console.log("Utils Lodgify - Controllo disponibilità per periodo:", {
      startDate,
      endDate,
    });

    // Validazione formato date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        available: null,
        error: "Formato date non valido. Usa YYYY-MM-DD",
      };
    }

    // URL API v2 Lodgify
    const url = `https://api.lodgify.com/v2/availability/712751?start=${startDate}&end=${endDate}`;
    console.log("Utils Lodgify - URL costruito:", url);
    console.log(
      "Utils Lodgify - API Key presente:",
      !!process.env.LODGIFY_API_KEY
    );

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
      let errorText;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = `Errore nella lettura della risposta: ${textError.message}`;
      }

      if (!errorText || errorText.trim() === "") {
        errorText = `Errore HTTP ${response.status}: ${
          response.statusText || "Accesso negato"
        }`;
      }

      console.error("Utils Lodgify - Errore API:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return {
        available: null,
        error: errorText,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log("Utils Lodgify - Dati ricevuti:", data);

    // Analizza i dati per determinare disponibilità
    let isAvailable = true;

    if (data && Array.isArray(data) && data.length > 0) {
      // Controlla ogni property nella risposta
      isAvailable = data.every((property) => {
        // Se non ha periods, consideralo non disponibile
        if (!property.periods || !Array.isArray(property.periods)) {
          return false;
        }

        // Controlla ogni periodo
        return property.periods.every((period) => {
          // Se available è 0 o false, non è disponibile
          // Se c'è closed_period, non è disponibile
          return period.available === 1 && !period.closed_period;
        });
      });
    } else {
      // Se non ci sono dati, consideriamo non disponibile
      isAvailable = false;
    }

    return {
      available: isAvailable,
      data: data,
    };
  } catch (error) {
    console.error("Utils Lodgify - Errore generale:", error.message);
    return {
      available: null,
      error: error.message,
    };
  }
};

module.exports = {
  checkLodgifyAvailability,
};
