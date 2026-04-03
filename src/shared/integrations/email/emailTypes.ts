export interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface EmailSendResult {
  accepted: string[];
  rejected: string[];
  response: string;
  messageId: string;
}
