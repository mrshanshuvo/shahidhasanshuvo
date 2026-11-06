import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().default(""),
  link: z.string().trim().url("Must be a valid URL"),
  date: z.string().default(() => new Date().toISOString()),
  tags: z.array(z.string()).default([]),
  image: z.string().default(""),
  order: z.number().default(0),
});

export const demoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().default(""),
  description: z.string().default(""),
  url: z.string().trim().url("Must be a valid URL"),
  github: z.string().default(""),
  featured: z.boolean().default(false),
  image: z.string().default(""),
  tech: z.array(z.string()).default([]),
  media: z.array(z.any()).default([]),
  order: z.number().default(0),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().default(""),
  description: z.string().default(""),
  story: z.string().default(""),
  image: z.string().default(""),
  github: z.any().default([]),
  live: z.any().default([]),
  featured: z.boolean().default(false),
  technologyIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  media: z.array(z.any()).default([]),
  order: z.number().default(0),
});

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  href: z.string().trim().url("Must be a valid URL"),
  iconUrl: z.string().default(""),
  brandColor: z.string().default(""),
  invertDark: z.boolean().default(false),
  order: z.number().default(0),
});

export const educationSchema = z.object({
  degree: z.string().trim().min(1, "Degree is required"),
  institution: z.string().trim().min(1, "Institution is required"),
  location: z.string().default(""),
  logo: z.string().default(""),
  period: z.string().default(""),
  gpa: z.string().default(""),
  details: z.array(z.string()).default([]),
  link: z.string().default(""),
  order: z.number().default(0),
});

export const certificationSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  issuer: z.string().trim().min(1, "Issuer is required"),
  date: z.string().default(""),
  certificateFile: z.string().default(""),
  badgeLogo: z.string().default(""),
  details: z.array(z.string()).default([]),
  order: z.number().default(0),
});

export const expertiseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  tech: z.string().default(""),
  iconUrl: z.string().default(""),
  order: z.number().default(0),
});
