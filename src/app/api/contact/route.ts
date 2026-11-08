import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import { contactRateLimiter, getClientIp } from "@/lib/rateLimit";

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
    // 1. Sliding Window IP Rate Limiting
    const clientIp = getClientIp(req);
    const rateCheck = contactRateLimiter.check(clientIp);

    if (!rateCheck.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Too many contact requests from this IP. Please wait a few minutes before trying again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfterSeconds ?? 60),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateCheck.reset / 1000)),
          },
        }
      );
    }

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

    // Input validation & size limits
    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !message ||
      typeof message !== "string"
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "All fields are required." }),
        { status: 400 }
      );
    }

    if (name.trim().length === 0 || name.length > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Name must be between 1 and 100 characters.",
        }),
        { status: 400 }
      );
    }

    if (message.trim().length === 0 || message.length > 5000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Message must be between 1 and 5000 characters.",
        }),
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 120 || !emailPattern.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address." }),
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.replace(/<\/?[^>]+(>|$)/g, "").trim();
    const sanitizedMessage = message.replace(/<\/?[^>]+(>|$)/g, "").trim();
    const safeSubjectName = sanitizedName.replace(/[\r\n]+/g, " ").slice(0, 80);

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // 1. Save to Database
    try {
      await connectDB();
      await Message.create({
        name: sanitizedName,
        email: email.trim(),
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
          pass: process.env.EMAIL_PASS?.replace(/\s+/g, ""),
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        replyTo: email.trim(),
        to: process.env.EMAIL_USER,
        subject: `Portfolio Contact: ${safeSubjectName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #10b981;">New Inquiry from Portfolio</h2>
            <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
              ${escapeHtml(sanitizedMessage).replace(/\n/g, "<br/>")}
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
