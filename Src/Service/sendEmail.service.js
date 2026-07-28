import { EventEmitter } from "node:events";
import { Resend } from "resend";

export const emitter = new EventEmitter();

// import nodemailer from "nodemailer";
// async function sendMail({ to, subject, html, attachments = [] } = {}) {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       html,
//       attachments,
//     });
//     console.log("Message sent: %s", info.messageId);
//   } catch (err) {
//     console.error("Error while sending mail:", err);
//   }
// }

// emitter.on("sendMail", async ({ to, subject, html, attachments = [] } = {}) => {
//   sendMail({
//     to,
//     subject,
//     html,
//     attachments,
//   });
// });

async function sendMail({ to, subject, html, attachments = [] } = {}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `Sarahah <${process.env.RESEND_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
  if (error) {
    return console.log(error);
  }
  console.log(data);
}

emitter.on("sendMail", async ({ to, subject, html, attachments = [] } = {}) => {
  sendMail({
    to,
    subject,
    html,
    attachments,
  });
});
