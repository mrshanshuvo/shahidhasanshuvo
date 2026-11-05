import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  "error-codes"?: string[];
}

interface ContactBody {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
  recaptchaToken: string;
}

/**
 * Verify Google reCAPTCHA v3 token
 * @param token - reCAPTCHA token from client
 * @returns true if score >= 0.5 (human), false otherwise
 */
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { method: "POST" }
    );
    const data = (await res.json()) as RecaptchaResponse;

    if (!data.success) {
      console.warn("reCAPTCHA verification failed:", data["error-codes"]);
      return false;
    }

    const score = data.score ?? 0;
    if (score < 0.5) {
      console.warn("reCAPTCHA score too low:", score);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error verifying reCAPTCHA:", err);
    return false;
  }
}

/**
 * Contact API POST handler
 * Expects JSON: { name, email, message, honeypot, recaptchaToken }
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { name, email, message, honeypot, recaptchaToken } =
      (await req.json()) as ContactBody;

    // Spam protection
    if (honeypot) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (!recaptchaToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "reCAPTCHA token is missing.",
        }),
        { status: 400 }
      );
    }

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "reCAPTCHA verification failed.",
        }),
        { status: 400 }
      );
    }

    // Input validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "All fields are required." }),
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address." }),
        { status: 400 }
      );
    }

    // Sanitize message
    const sanitizedMessage = message.replace(/<\/?[^>]+(>|$)/g, "");

    // 1. Save to Database
    try {
      await connectDB();
      await Message.create({
        name,
        email,
        message: sanitizedMessage,
      });
    } catch (dbError) {
      console.error("Failed to save message to DB:", dbError);
      // We continue even if DB fails, as we still want to try sending the email
    }

    // 2. Send Email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `Portfolio Contact: ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #10b981;">New Inquiry from Portfolio</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
              ${sanitizedMessage.replace(/\n/g, "<br/>")}
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This message has also been saved to your admin dashboard.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Failed to send contact email:", mailError);
      // If saving to DB succeeded, we still return success: true to the user
      // but maybe log that the email failed.
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error." }),
      { status: 500 }
    );
  }
}
