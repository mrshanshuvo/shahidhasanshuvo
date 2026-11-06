"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLink } from "react-icons/fa";
import type { ContactInfo } from "@/types";
import type { IconType } from "react-icons";

export interface ContactSocialLink {
  icon: IconType;
  label: string;
  href: string;
  color: string;
  iconUrl?: string;
  invertDark?: boolean;
}

interface ContactInfoSectionProps {
  contactEmail: string;
  contactPhone?: string;
  contactLocation?: string;
  socialLinks: import("@/types").SocialLink[];
  containerVariants: any;
  itemVariants: any;
}

export function ContactInfoSection({
  contactEmail,
  contactPhone,
  contactLocation,
  socialLinks: rawSocialLinks,
  containerVariants,
  itemVariants,
}: ContactInfoSectionProps) {
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

  return (
    <motion.div variants={containerVariants}>
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
        <p className="mb-4 font-medium text-slate-900 dark:text-white">Follow me on</p>
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
  );
}
