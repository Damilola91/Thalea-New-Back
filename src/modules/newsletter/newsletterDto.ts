export interface SubscribeNewsletterDto {
  email: string;
}

export interface SendNewsletterDto {
  subject: string;
  text?: string;
  html?: string;
}
