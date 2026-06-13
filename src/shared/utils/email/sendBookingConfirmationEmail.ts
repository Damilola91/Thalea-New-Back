import { sendEmail } from "../../integrations/email/emailAdapter";
import { getEmailConfig } from "../../integrations/email/emailConfig";

interface SendBookingConfirmationEmailParams {
  guestEmail: string;
  guestName: string;
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

export const sendBookingConfirmationEmail = async ({
  guestEmail,
  guestName,
  apartment,
  checkIn,
  checkOut,
  guestsCount,
  totalPrice,
  bookingCode,
}: SendBookingConfirmationEmailParams): Promise<void> => {
  getEmailConfig();

  const firstName = guestName.split(" ")[0];

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prenotazione Confermata</title>
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
              <p style="margin:6px 0 0;font-size:13px;color:#a8b8a0;letter-spacing:0.08em;text-transform:uppercase;">Palermo, Sicilia</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#5a6b5b;text-transform:uppercase;letter-spacing:0.1em;">Prenotazione confermata</p>
              <h1 style="margin:0 0 24px;font-size:28px;color:#2e3d2f;font-weight:400;">Ciao ${firstName},</h1>
              <p style="margin:0 0 32px;font-size:15px;color:#5a6b5b;line-height:1.6;">
                La tua prenotazione è confermata e il pagamento è andato a buon fine. Non vediamo l'ora di accoglierti a Palermo.
              </p>

              <!-- Dettagli prenotazione -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f4ee;border-radius:12px;overflow:hidden;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;color:#5a6b5b;text-transform:uppercase;letter-spacing:0.1em;">Dettagli soggiorno</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Proprietà</span>
                        </td>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${apartment}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Check-in</span>
                        </td>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${formatDate(checkIn)} · ore 14:00</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Check-out</span>
                        </td>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${formatDate(checkOut)} · ore 10:00</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;">
                          <span style="font-size:13px;color:#5a6b5b;">Ospiti</span>
                        </td>
                        <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;text-align:right;">
                          <span style="font-size:13px;color:#2e3d2f;font-weight:500;">${guestsCount}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 0 0;">
                          <span style="font-size:14px;color:#2e3d2f;font-weight:600;">Totale pagato</span>
                        </td>
                        <td style="padding:14px 0 0;text-align:right;">
                          <span style="font-size:18px;color:#4a6741;font-weight:600;">€${totalPrice}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Codice prenotazione -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#4a6741;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 28px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;color:#a8c4a0;text-transform:uppercase;letter-spacing:0.1em;">Codice prenotazione</p>
                    <p style="margin:0;font-size:15px;color:#f7f4ee;font-weight:500;letter-spacing:0.05em;">${bookingCode}</p>
                  </td>
                </tr>
              </table>

              <!-- Info utili -->
              <p style="margin:0 0 8px;font-size:13px;color:#2e3d2f;font-weight:600;">Informazioni utili</p>
              <p style="margin:0 0 6px;font-size:13px;color:#5a6b5b;line-height:1.6;">📍 <strong>Indirizzo:</strong> Via Cagliari 5, 90133 Palermo PA</p>
              <p style="margin:0 0 6px;font-size:13px;color:#5a6b5b;line-height:1.6;">🕑 <strong>Check-in:</strong> dalle 14:00 — Check-out: entro le 10:00</p>
              <p style="margin:0 0 32px;font-size:13px;color:#5a6b5b;line-height:1.6;">📞 Per qualsiasi necessità: <a href="mailto:thaleapalermoapartment@gmail.com" style="color:#4a6741;">thaleapalermoapartment@gmail.com</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f7f4ee;padding:24px 40px;text-align:center;border-top:1px solid #e8e3d8;">
              <p style="margin:0 0 4px;font-size:12px;color:#5a6b5b;">© 2025 Thălēa Apartment · Palermo, Sicilia</p>
              <p style="margin:0;font-size:11px;color:#8a9b8b;">CIN: IT082053C254M7HSWH</p>
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
      to: guestEmail,
      subject: `Prenotazione confermata – Thălēa Apartment Palermo`,
      text: `Ciao ${firstName}, la tua prenotazione è confermata! Check-in: ${formatDate(checkIn)} · Check-out: ${formatDate(checkOut)} · Totale: €${totalPrice} · Codice: ${bookingCode}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw new Error("Failed to send confirmation email.");
  }
};
