import nodemailer from 'nodemailer';

interface SmtpConfiguration {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export class EmailConfigurationError extends Error {
  constructor() {
    super('Password reset email service is not configured.');
    this.name = 'EmailConfigurationError';
  }
}

function getSmtpConfiguration(): SmtpConfiguration {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
  } = process.env;
  const port = Number(SMTP_PORT);

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !SMTP_FROM ||
    (SMTP_SECURE !== 'true' && SMTP_SECURE !== 'false')
  ) {
    throw new EmailConfigurationError();
  }

  return {
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE === 'true',
    user: SMTP_USER,
    password: SMTP_PASSWORD,
    from: SMTP_FROM,
  };
}

export function assertEmailConfiguration(): void {
  getSmtpConfiguration();
}

export async function sendPasswordResetEmail(
  email: string,
  otp: string,
): Promise<void> {
  const configuration = getSmtpConfiguration();
  const transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,
    auth: {
      user: configuration.user,
      pass: configuration.password,
    },
  });

  await transporter.sendMail({
    from: configuration.from,
    to: email,
    subject: 'Your SERPENTIS password reset code',
    text: `Your SERPENTIS password reset code is ${otp}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
  });
}
