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

  const fixedCheckOutDate = new Date(checkOut);
  fixedCheckOutDate.setUTCHours(10, 0, 0, 0);

  const fixedCheckInDate = new Date(checkIn);
  if (fixedCheckInDate.getUTCHours() < 14) {
    fixedCheckInDate.setUTCHours(14, 0, 0, 0);
  }

  try {
    await sendEmail({
      to: guestEmail,
      subject: `Booking Confirmation - Your Stay at ${apartment}`,
      text: `Dear ${guestName},

Your booking has been successfully created!

Here are the details of your stay:
- Property: ${apartment}
- Check-in: ${fixedCheckInDate.toLocaleDateString()} at 14:00
- Check-out: ${fixedCheckOutDate.toLocaleDateString()} at 10:00
- Guests: ${guestsCount}
- Total Price: €${totalPrice}
- Booking Code: ${bookingCode}

Thank you for choosing us!

Best regards,
The Team`,
      html: `<h1>Booking Confirmation</h1>
      <p>Dear ${guestName},</p>
      <p>Your booking has been successfully created!</p>
      <h3>Details of your stay:</h3>
      <ul>
        <li><strong>Property:</strong> ${apartment}</li>
        <li><strong>Check-in:</strong> ${fixedCheckInDate.toLocaleDateString()} at 14:00</li>
        <li><strong>Check-out:</strong> ${fixedCheckOutDate.toLocaleDateString()} at 10:00</li>
        <li><strong>Guests:</strong> ${guestsCount}</li>
        <li><strong>Total Price:</strong> €${totalPrice}</li>
        <li><strong>Booking Code:</strong> ${bookingCode}</li>
      </ul>
      <p>Thank you for choosing us!</p>
      <p>Best regards,</p>
      <p>The Team</p>`,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw new Error("Failed to send confirmation email.");
  }
};
