const { Resend } = require("resend");
const resend = new Resend({ apiKey: process.env.RESEND_API_KEY });

const sendBookingConfirmationEmail = async (
  guestEmail,
  guestName,
  apartment,
  checkIn,
  checkOut,
  guestsCount,
  totalPrice,
  bookingCode
) => {
  const fixedCheckOutDate = new Date(checkOut);
  fixedCheckOutDate.setUTCHours(10, 0, 0, 0);

  const fixedCheckInDate = new Date(checkIn);
  if (fixedCheckInDate.getUTCHours() < 14) {
    fixedCheckInDate.setUTCHours(14, 0, 0, 0);
  }

  try {
    const response = await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to: guestEmail,
      subject: `Booking Confirmation - Your Stay at ${apartment}`,
      text: `Dear ${guestName},\n\nYour booking has been successfully created!\n\nHere are the details of your stay:\n- Property: ${apartment}\n- Check-in: ${fixedCheckInDate.toLocaleDateString()} at 14:00\n- Check-out: ${fixedCheckOutDate.toLocaleDateString()} at 10:00\n- Guests: ${guestsCount}\n- Total Price: €${totalPrice}\n- Booking Code: ${bookingCode}\n\nThank you for choosing us!\n\nBest regards,\nThe Team`,
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

    console.log("Confirmation email sent to:", guestEmail, response);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw new Error("Failed to send confirmation email.");
  }
};

module.exports = sendBookingConfirmationEmail;
