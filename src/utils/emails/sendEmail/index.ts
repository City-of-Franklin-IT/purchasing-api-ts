import { createTransport } from 'nodemailer'

// Types
import { TransportOptions } from 'nodemailer';

export default async (options: { email: string[] | string | undefined, subject: string, msg: string }): Promise<void> => {
  const recipients = Array.isArray(options.email) ? options.email.join('; ') : options.email

  const transporter = createTransport({
    service: 'smtp',
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    secure: true,
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  } as TransportOptions)

  const msg = {
    from: `${ process.env.FROM_NAME } <${ process.env.FROM_EMAIL }>`,
    to: recipients,
    subject: options.subject,
    text: options.msg,
  };

  await transporter.sendMail(msg)
}