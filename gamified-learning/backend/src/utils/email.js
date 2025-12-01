import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendMail = (options) =>
  transporter.sendMail({
    from: `Gamified Learning <${process.env.MAIL_USER}>`,
    ...options
  });