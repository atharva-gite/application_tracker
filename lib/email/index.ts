import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export type EmailDriver = "console" | "resend";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailClient {
  send(message: EmailMessage): Promise<void>;
}

export class ConsoleEmailClient implements EmailClient {
  async send(message: EmailMessage) {
    logger.info("email.sent.console", {
      subject: message.subject,
    });
    console.info(message.text);
  }
}

export class ResendEmailClient implements EmailClient {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });

    if (!response.ok) {
      logger.error("email.send.failed", { status: response.status });
      throw new AppError(
        "INTERNAL_ERROR",
        "Could not send email. Please try again.",
      );
    }

    logger.info("email.sent.resend", { subject: message.subject });
  }
}

export function getEmailDriver(): EmailDriver {
  return process.env.RESEND_API_KEY ? "resend" : "console";
}

export function getEmailClient(): EmailClient {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    return new ResendEmailClient(
      apiKey,
      process.env.EMAIL_FROM ?? "Pipeline <noreply@localhost>",
    );
  }
  return new ConsoleEmailClient();
}
