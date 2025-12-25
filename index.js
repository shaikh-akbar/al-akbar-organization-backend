import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:8080','https://al-akbar-organization.vercel.app', 'https://agency.venstyler.com']
  })
);

app.post("/", async (req, res) => {
  const { name, email, company, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      subject: `New Inquiry from ${name}`,
      replyTo: email,
      html: `
        <h2>New Contact Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Company:</b> ${company || "-"}</p>
        <p><b>Service Requested:</b> ${service || "-"}</p>
        <p><b>Message:</b></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Contact API running on port ${process.env.PORT}`)
);
