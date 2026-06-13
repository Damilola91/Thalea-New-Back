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

const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuova Prenotazione</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f4ee;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f4ee;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#2e3d2f;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:24px;color:#f7f4ee;letter-spacing:0.02em;">Thălēa Apartment</p>
              <p style="margin:6px 0 0;font-size:13px;color:#a8b8a0;letter-spacing:0.08em;text-transform:uppercase;">Nuova prenotazione ricevuta</p>
            </td>
          </tr>

          <!-- Alert badge -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef4eb;border-left:4px solid #4a6741;border-radius:0 8px 8px 0;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#2e3d2f;font-weight:600;">💳 Pagamento confermato · €${totalPrice}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#5a6b5b;">La prenotazione è stata completata con successo via Stripe.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 40px;">

              <!-- Dati ospite -->
              <p style="margin:0 0 12px;font-size:11px;color:#5a6b5b;text-transform:uppercase;letter-spacing:0.1em;">Dati ospite</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f4ee;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Nome</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${guestName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:13px;color:#5a6b5b;">Email</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;">
                          <a href="mailto:${guestEmail}" style="font-size:13px;color:#4a6741;">${guestEmail}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Dettagli soggiorno -->
              <p style="margin:0 0 12px;font-size:11px;color:#5a6b5b;text-transform:uppercase;letter-spacing:0.1em;">Dettagli soggiorno</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f4ee;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Proprietà</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${apartment}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Check-in</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${formatDate(checkIn)} · 14:00</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Check-out</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${formatDate(checkOut)} · 10:00</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Ospiti</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${guestsCount}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;">
                          <span style="font-size:14px;color:#2e3d2f;font-weight:600;">Totale incassato</span>
                        </td>
                        <td style="padding:12px 0 0;text-align:right;">
                          <span style="font-size:18px;color:#4a6741;font-weight:600;">€${totalPrice}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Codice prenotazione -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#4a6741;border-radius:12px;">
                <tr>
                  <td style="padding:18px 24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;color:#a8c4a0;text-transform:uppercase;letter-spacing:0.1em;">Codice prenotazione</p>
                    <p style="margin:0;font-size:14px;color:#f7f4ee;font-weight:500;letter-spacing:0.05em;">${bookingCode}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f7f4ee;padding:20px 40px;text-align:center;border-top:1px solid #e8e3d8;">
              <p style="margin:0;font-size:11px;color:#8a9b8b;">Thălēa Apartment · Sistema di prenotazione automatico</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({
      from: `"Booking System" <${senderEmail}>`,
      to: senderEmail,
      subject: `🏠 Nuova prenotazione – ${guestName} · ${formatDate(checkIn)}`,
      text: `Nuova prenotazione da ${guestName} (${guestEmail}). Check-in: ${formatDate(checkIn)} · Check-out: ${formatDate(checkOut)} · Ospiti: ${guestsCount} · Totale: €${totalPrice} · Codice: ${bookingCode}`,
      html,
    });
  } catch (error) {
    console.error("Errore invio email al proprietario:", error);
    throw new Error("Errore invio email al proprietario.");
  }
};
