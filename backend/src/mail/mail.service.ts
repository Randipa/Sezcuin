import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

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

  async sendInviteEmail({
    to,
    firstName,
    inviteUrl,
  }: SendInviteEmailParams): Promise<void> {
    const from =
      this.configService.get<string>('MAIL_FROM') ??
      this.configService.get<string>('SMTP_USER');
    const subject = 'You have been invited to Sezcuin';
    const html = `
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

    const host = this.configService.get<string>('SMTP_HOST');
    if (!host) {
      this.logger.warn(
        `SMTP not configured — invite link for ${to}: ${inviteUrl}`,
      );
      return;
    }

    await this.getTransporter().sendMail({ from, to, subject, html });
    this.logger.log(`Invite email sent to ${to}`);
  }
}
