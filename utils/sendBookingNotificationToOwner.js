const { Resend } = require("resend");
const resend = new Resend({ apiKey: process.env.RESEND_API_KEY });

const sendBookingNotificationToOwner = async ({
  guestName,
  guestEmail,
  apartment,
  checkIn,
  checkOut,
  guestsCount,
  totalPrice,
  bookingCode,
}) => {
  const fixedCheckOutDate = new Date(checkOut);
  fixedCheckOutDate.setUTCHours(10, 0, 0, 0);

  const fixedCheckInDate = new Date(checkIn);
  if (fixedCheckInDate.getUTCHours() < 14) {
    fixedCheckInDate.setUTCHours(14, 0, 0, 0);
  }

  try {
    await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to: process.env.SENDER_EMAIL, // mail del proprietario
      subject: `Nuova prenotazione ricevuta - ${apartment}`,
      text: `Hai ricevuto una nuova prenotazione!\n\nCliente: ${guestName}\nEmail: ${guestEmail}\nProprietà: ${apartment}\nCheck-in: ${fixedCheckInDate.toLocaleDateString()} at 14:00\nCheck-out: ${fixedCheckOutDate.toLocaleDateString()} at 10:00\nOspiti: ${guestsCount}\nTotale pagato: €${totalPrice}\nCodice prenotazione: ${bookingCode}`,
      html: `<h2>Hai ricevuto una nuova prenotazione!</h2>
        <p><strong>Cliente:</strong> ${guestName}</p>
        <p><strong>Email:</strong> ${guestEmail}</p>
        <p><strong>Proprietà:</strong> ${apartment}</p>
        <p><strong>Periodo:</strong> ${fixedCheckInDate.toLocaleDateString()} → ${fixedCheckOutDate.toLocaleDateString()}</p>
        <p><strong>Ospiti:</strong> ${guestsCount}</p>
        <p><strong>Totale pagato:</strong> €${totalPrice}</p>
        <p><strong>Codice prenotazione:</strong> ${bookingCode}</p>`,
    });

    console.log("Email di notifica inviata al proprietario con successo!");
  } catch (err) {
    console.error("Errore invio email al proprietario:", err);
    throw new Error("Errore invio email al proprietario.");
  }
};

module.exports = sendBookingNotificationToOwner;
