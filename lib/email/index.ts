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
    console.info(
      JSON.stringify({
        level: "info",
        message: "email.sent.console",
        timestamp: new Date().toISOString(),
        to: message.to,
        subject: message.subject,
      }),
    );
    console.info(message.text);
  }
}

export function getEmailClient(): EmailClient {
  return new ConsoleEmailClient();
}
