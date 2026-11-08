"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Status } from "@/types";

export function ContactForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [status, setStatus] = useState<Status>({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Sending your message...", type: "loading" });

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    if (!data.name || !data.email || !data.message) {
      setStatus({
        message: "Please fill in all required fields.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    if (!executeRecaptcha) {
      setStatus({
        message: "reCAPTCHA not ready. Please try again.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    const recaptchaToken = await executeRecaptcha("contact_form");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });

      const result = (await res.json()) as { success: boolean; error?: string };

      if (result.success) {
        setStatus({
          message: "Message sent successfully! ✅",
          type: "success",
        });
        formElement.reset();
        setTimeout(() => setStatus({ message: "", type: "" }), 5000);
      } else {
        throw new Error(result.error ?? "Failed to send message");
      }
    } catch {
      setStatus({
        message: "Sorry, there was an error sending your message. ❌",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Contact form"
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Full Name *
        </label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Shahid Hasan Shovu"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-6 text-slate-900 transition-all placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Email Address *
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          required
          placeholder="shahid@example.com"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-6 text-slate-900 transition-all placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Your Message *
        </label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Hello! I'd like to discuss a project collaboration or a web development task."
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-6 font-medium text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
          isSubmitting
            ? "cursor-not-allowed bg-slate-400"
            : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        }`}
      >
        {isSubmitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <FaPaperPlane /> Send Message
          </>
        )}
      </Button>

      {status.message && (
        <motion.div
          role={status.type === "error" ? "alert" : "status"}
          aria-live={status.type === "error" ? "assertive" : "polite"}
          aria-atomic="true"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-4 ${
            status.type === "success"
              ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
              : status.type === "error"
                ? "border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                : "border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
          }`}
        >
          <div className="flex items-center gap-3">
            {status.type === "success" ? (
              <FaCheckCircle className="text-lg text-emerald-600 dark:text-emerald-400" />
            ) : status.type === "error" ? (
              <FaExclamationTriangle className="text-lg text-red-600 dark:text-red-400" />
            ) : (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            )}
            <p
              className={`text-sm font-medium ${
                status.type === "success"
                  ? "text-emerald-800 dark:text-emerald-300"
                  : status.type === "error"
                    ? "text-red-800 dark:text-red-300"
                    : "text-blue-800 dark:text-blue-300"
              }`}
            >
              {status.message}
            </p>
          </div>
        </motion.div>
      )}
    </form>
  );
}
