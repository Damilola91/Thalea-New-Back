import { sendEmail } from "../../integrations/email/emailAdapter";
import { getEmailConfig } from "../../integrations/email/emailConfig";

interface SendPasswordResetEmailParams {
  userEmail: string;
  userName: string;
  resetToken: string;
  userId: string;
}

export const sendPasswordResetEmail = async ({
  userEmail,
  userName,
  resetToken,
  userId,
}: SendPasswordResetEmailParams): Promise<void> => {
  const { senderEmail } = getEmailConfig();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&userId=${userId}`;

  await sendEmail({
    to: userEmail,
    from: senderEmail,
    subject: "Reset della tua password — Thalea",
    text: `Ciao ${userName},

Abbiamo ricevuto una richiesta di reset della password per il tuo account.

Clicca sul link seguente per impostare una nuova password (valido per 15 minuti):
${resetLink}

Se non hai richiesto il reset, ignora questa email. La tua password rimarrà invariata.

Lo staff di Thalea`,
    html: `
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h2 style="font-size: 20px; margin-bottom: 8px;">Reset della password</h2>
    <p>Ciao <strong>${userName}</strong>,</p>
    <p>Abbiamo ricevuto una richiesta di reset della password per il tuo account.</p>
    <p style="margin: 24px 0;">
      <a href="${resetLink}"
         style="background: #1a1a1a; color: #fff; padding: 12px 24px;
                text-decoration: none; border-radius: 6px; font-size: 14px;">
        Reimposta la password
      </a>
    </p>
    <p style="font-size: 13px; color: #666;">
      Il link scade tra <strong>15 minuti</strong>.<br>
      Se non hai richiesto il reset, ignora questa email.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
    <p style="font-size: 12px; color: #999;">Lo staff di Thalea</p>
  </body>
</html>`,
  });
};
