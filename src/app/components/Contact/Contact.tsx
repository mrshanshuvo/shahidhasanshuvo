"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FaPaperPlane,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLink,
} from "react-icons/fa";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Image from "next/image";
import type { ContactInfo, Status } from "@/types";
import type { IconType } from "react-icons";
import type { FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContactSocialLink {
  icon: IconType;
  label: string;
  href: string;
  color: string;
  iconUrl?: string;
  invertDark?: boolean;
}

interface Props {
  socialLinks: import("@/types").SocialLink[];
  contactEmail: string;
  contactPhone?: string;
  contactLocation?: string;
}

export default function Contact({
  socialLinks: rawSocialLinks,
  contactEmail,
  contactPhone,
  contactLocation,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [status, setStatus] = useState<Status>({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const contactInfo: ContactInfo[] = [
    {
      icon: FaEnvelope,
      label: "Email",
      value: contactEmail,
      link: `mailto:${contactEmail}`,
    },
    {
      icon: FaPhone,
      label: "Phone",
      value: contactPhone || "+88017 94280136",
      link: contactPhone
        ? `tel:${contactPhone.replace(/\s+/g, "")}`
        : "tel:+8801794280136",
    },
    {
      icon: FaMapMarkerAlt,
      label: "Location",
      value: contactLocation || "Mirpur, Dhaka, Bangladesh",
      link: null,
    },
  ];

  const socialLinks: ContactSocialLink[] = rawSocialLinks.map((s) => ({
    icon: FaLink,
    label: s.label,
    href: s.href,
    iconUrl: s.iconUrl,
    color: s.brandColor || "hover:text-emerald-500",
    invertDark: s.invertDark,
  }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "Sending your message...", type: "loading" });

    const formData = new FormData(e.currentTarget);
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
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setStatus({ message: "", type: "" }), 5000);
      } else {
        throw new Error(result.error ?? "Failed to send message");
      }
    } catch (err) {
      setStatus({
        message: "Sorry, there was an error sending your message. ❌",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="scroll-mt-28 bg-slate-50 py-16 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="text-left">
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-3 text-sm font-black tracking-[0.2em] text-emerald-500 uppercase md:text-lg"
            >
              <FaPaperPlane /> Get In Touch
            </motion.h2>
          </div>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.h3
              variants={itemVariants}
              className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              Let&apos;s talk!
            </motion.h3>
            <motion.div variants={itemVariants} className="mb-10 space-y-6">
              {contactInfo.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <item.icon className="text-xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-slate-900 dark:text-white">
                      {item.label}
                    </p>
                    {item.link ? (
                      <a
                        href={item.link}
                        className="text-slate-600 transition-colors hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={itemVariants}>
              <p className="mb-4 font-medium text-slate-900 dark:text-white">
                Follow me on
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => (
                  <div key={idx} className="group/tooltip relative">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-emerald-400 ${social.color} hover:scale-110 hover:shadow-lg`}
                      aria-label={social.label}
                    >
                      {social.iconUrl ? (
                        <Image
                          src={social.iconUrl}
                          alt={social.label}
                          width={18}
                          height={18}
                          className={`object-contain ${social.invertDark ? "dark:invert" : ""}`}
                        />
                      ) : (
                        <social.icon className="text-lg" />
                      )}
                    </a>
                    <span className="pointer-events-none absolute -bottom-10 left-1/2 z-20 -translate-x-1/2 scale-75 rounded-lg border border-slate-700/50 bg-slate-900 px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-white opacity-0 shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 dark:border-slate-600/50 dark:bg-slate-800">
                      {social.label}
                      <span className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-800" />
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
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

              {/* reCAPTCHA v3 – invisible, no widget needed */}

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-6 font-medium text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${isSubmitting ? "cursor-not-allowed bg-slate-400" : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"}`}
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-4 ${status.type === "success" ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20" : status.type === "error" ? "border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20" : "border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"}`}
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
                      className={`text-sm font-medium ${status.type === "success" ? "text-emerald-800 dark:text-emerald-300" : status.type === "error" ? "text-red-800 dark:text-red-300" : "text-blue-800 dark:text-blue-300"}`}
                    >
                      {status.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
