import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async ({ email, subject, html }) => {
  if (!email) {
    throw new Error("Email is missing");
  }

  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
};

export default sendMail;
