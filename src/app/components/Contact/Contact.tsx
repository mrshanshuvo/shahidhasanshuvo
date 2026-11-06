"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { ContactInfoSection } from "./ContactInfoSection";
import { ContactForm } from "./ContactForm";

interface Props {
  socialLinks: import("@/types").SocialLink[];
  contactEmail: string;
  contactPhone?: string;
  contactLocation?: string;
}

export default function Contact({
  socialLinks,
  contactEmail,
  contactPhone,
  contactLocation,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

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
            <ContactInfoSection
              contactEmail={contactEmail}
              contactPhone={contactPhone}
              contactLocation={contactLocation}
              socialLinks={socialLinks}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
