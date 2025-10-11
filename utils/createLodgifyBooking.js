const createLodgifyBooking = async ({
  checkIn,
  checkOut,
  guestName,
  guestEmail,
  guestPhone,
  guestsCount,
  totalPrice,
}) => {
  const url = "https://api.lodgify.com/v1/reservation/booking";

  const formatDate = (date) => new Date(date).toISOString().split("T")[0];

  const body = {
    source_text: "Direct Booking (API)",
    arrival: formatDate(checkIn),
    departure: formatDate(checkOut),
    property_id: Number(process.env.LODGIFY_PROPERTY_ID),
    status: "Tentative",
    bookability: "InstantBooking",
    rooms: [
      {
        room_type_id: Number(process.env.LODGIFY_ROOM_TYPE_ID),
        quantity: 1,
        adults: guestsCount,
      },
    ],
    guest: {
      name: guestName,
      first_name: guestName.split(" ")[0] || guestName,
      last_name: guestName.split(" ").slice(1).join(" ") || guestName,
      email: guestEmail,
      phone: guestPhone || null,
    },
    total: totalPrice,
    currency_code: "EUR",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-ApiKey": process.env.LODGIFY_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore Lodgify: ${response.status} - ${errorText}`);
  }

  return response.json();
};

module.exports = { createLodgifyBooking };
