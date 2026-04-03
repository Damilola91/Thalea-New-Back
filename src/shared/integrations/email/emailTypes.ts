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

export interface NormalizedEmailError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
  cause?: unknown;
}
