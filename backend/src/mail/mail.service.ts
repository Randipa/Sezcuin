import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MessageRejected,
  SESv2Client,
  SendEmailCommand,
} from '@aws-sdk/client-sesv2';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendInviteEmailParams {
  to: string;
  firstName: string;
  inviteUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private sesClient: SESv2Client | null = null;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  private buildInviteHtml(firstName: string, inviteUrl: string): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Welcome to Sezcuin</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Hi ${firstName}, an administrator has created an account for you.
          Click the button below to sign in and set your password.
        </p>
        <p style="margin: 32px 0;">
          <a href="${inviteUrl}"
             style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 600;">
            Accept invitation
          </a>
        </p>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
          This link expires in 7 days. If you did not expect this email, you can safely ignore it.
        </p>
      </div>
    `;
  }

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      throw new Error(
        'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  private getSesClient(): SESv2Client {
    if (!this.sesClient) {
      this.sesClient = new SESv2Client({});
    }

    return this.sesClient;
  }

  private async sendViaSes(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const from = this.configService.get<string>('MAIL_FROM');
    if (!from) {
      throw new Error('MAIL_FROM is not configured for SES');
    }

    try {
      await this.getSesClient().send(
        new SendEmailCommand({
          FromEmailAddress: from,
          Destination: { ToAddresses: [to] },
          Content: {
            Simple: {
              Subject: { Data: subject },
              Body: { Html: { Data: html } },
            },
          },
        }),
      );
    } catch (error) {
      const rejected =
        error instanceof MessageRejected ||
        (error instanceof Error && error.name === 'MessageRejected');

      if (rejected) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`SES rejected invite to ${to}: ${message}`);

        if (/not verified/i.test(message)) {
          throw new ServiceUnavailableException(
            'Invitation email could not be sent because the SES sender is not verified yet. Check the sender inbox for the AWS verification email and click the link, then try again.',
          );
        }

        throw new ServiceUnavailableException(
          'Invitation email could not be sent. Your AWS SES account may still be in sandbox mode—in that case, recipient emails must also be verified in SES.',
        );
      }

      this.logger.error(`SES failed for ${to}`, error);
      throw new ServiceUnavailableException(
        'Invitation email could not be sent. Please try again later.',
      );
    }
  }

  async sendInviteEmail({
    to,
    firstName,
    inviteUrl,
  }: SendInviteEmailParams): Promise<void> {
    const subject = 'You have been invited to Sezcuin';
    const html = this.buildInviteHtml(firstName, inviteUrl);
    const provider = this.configService.get<string>('MAIL_PROVIDER');

    if (provider === 'ses') {
      await this.sendViaSes(to, subject, html);
      this.logger.log(`Invite email sent to ${to} via SES`);
      return;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    if (!host) {
      this.logger.warn(
        `Mail not configured — invite link for ${to}: ${inviteUrl}`,
      );
      return;
    }

    const from =
      this.configService.get<string>('MAIL_FROM') ??
      this.configService.get<string>('SMTP_USER');

    await this.getTransporter().sendMail({ from, to, subject, html });
    this.logger.log(`Invite email sent to ${to} via SMTP`);
  }
}
