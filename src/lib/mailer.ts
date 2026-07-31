import nodemailer from "nodemailer"

type SendMailOptions = {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendMailOptions): Promise<void> {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
    replyTo,
  })
}
