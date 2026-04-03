import { sendEmail } from "../../integrations/email/emailAdapter";
import { getEmailConfig } from "../../integrations/email/emailConfig";

interface SendBookingNotificationToOwnerParams {
  guestName: string;
  guestEmail: string;
  apartment: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guestsCount: number;
  totalPrice: number;
  bookingCode: string;
}

export const sendBookingNotificationToOwner = async ({
  guestName,
  guestEmail,
  apartment,
  checkIn,
  checkOut,
  guestsCount,
  totalPrice,
  bookingCode,
}: SendBookingNotificationToOwnerParams): Promise<void> => {
  const { senderEmail } = getEmailConfig();

  const fixedCheckOutDate = new Date(checkOut);
  fixedCheckOutDate.setUTCHours(10, 0, 0, 0);

  const fixedCheckInDate = new Date(checkIn);
  if (fixedCheckInDate.getUTCHours() < 14) {
    fixedCheckInDate.setUTCHours(14, 0, 0, 0);
  }

  try {
    await sendEmail({
      from: `"Booking System" <${senderEmail}>`,
      to: senderEmail,
      subject: `Nuova prenotazione ricevuta - ${apartment}`,
      text: `Hai ricevuto una nuova prenotazione!

Cliente: ${guestName}
Email: ${guestEmail}
Proprietà: ${apartment}
Check-in: ${fixedCheckInDate.toLocaleDateString()} at 14:00
Check-out: ${fixedCheckOutDate.toLocaleDateString()} at 10:00
Ospiti: ${guestsCount}
Totale pagato: €${totalPrice}
Codice prenotazione: ${bookingCode}`,
      html: `<h2>Hai ricevuto una nuova prenotazione!</h2>
        <p><strong>Cliente:</strong> ${guestName}</p>
        <p><strong>Email:</strong> ${guestEmail}</p>
        <p><strong>Proprietà:</strong> ${apartment}</p>
        <p><strong>Periodo:</strong> ${fixedCheckInDate.toLocaleDateString()} → ${fixedCheckOutDate.toLocaleDateString()}</p>
        <p><strong>Ospiti:</strong> ${guestsCount}</p>
        <p><strong>Totale pagato:</strong> €${totalPrice}</p>
        <p><strong>Codice prenotazione:</strong> ${bookingCode}</p>`,
    });
  } catch (error) {
    console.error("Errore invio email al proprietario:", error);
    throw new Error("Errore invio email al proprietario.");
  }
};
