import { SendNewsletterDto, SubscribeNewsletterDto } from "./newsletterDto";
import { createAppError } from "./newsletterErrors";

export const validateSubscribeNewsletterInput = (
  data: SubscribeNewsletterDto,
): void => {
  if (!data.email?.trim()) {
    throw createAppError("Email is required", 400);
  }
};

export const validateSendNewsletterInput = (data: SendNewsletterDto): void => {
  const { subject, text, html } = data;

  if (!subject?.trim() || (!text && !html)) {
    throw createAppError(
      "Missing required fields: 'subject' or email content",
      400,
    );
  }
};
