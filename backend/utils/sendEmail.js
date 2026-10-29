import nodemailer from "nodemailer";


// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify()
  .then(() => console.log("SMTP connection successful"))
  .catch((error) => console.error("SMTP verification failed:", error));

// // Reusable function to send emails
async function sendEmail({ to, subject, text, html }) {
  const info = await transporter.sendMail({
    from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });

  console.log("otp sent via sendEmail");

  return info;
}

// const sendEmail = async ({ to, subject, text, html }) => {
//   try {
//     console.log("Starting email sending...");
//     console.log("SMTP host:", process.env.EMAIL_HOST);
//     console.log("SMTP port:", process.env.EMAIL_PORT);
//     console.log("Recipient:", to);

//     const info = await transporter.sendMail({
//       from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//       html,
//     });

//     console.log("Email sent successfully:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("Nodemailer error:", error);
//     throw error; // Important: pass the error to your error handler
//   }
// };


export default sendEmail;