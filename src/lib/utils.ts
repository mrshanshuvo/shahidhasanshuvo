import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    const absSeconds = Math.abs(diffInSeconds);
    if (absSeconds < 60) return "in a few seconds";
    const minutes = Math.floor(absSeconds / 60);
    if (minutes === 1) return "in 1 minute";
    if (minutes < 60) return `in ${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "in 1 hour";
    if (hours < 24) return `in ${hours} hours`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "in 1 day";
    if (days < 30) return `in ${days} days`;
    const months = Math.floor(days / 30);
    if (months === 1) return "in 1 month";
    if (months < 12) return `in ${months} months`;
    const years = Math.floor(months / 12);
    if (years === 1) return "in 1 year";
    return `in ${years} years`;
  }

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes === 1) return "1 minute ago";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return "1 hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 30) return `${diffInDays} days ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "1 month ago";
  if (diffInMonths < 12) return `${diffInMonths} months ago`;

  const diffInYears = Math.floor(diffInMonths / 12);
  if (diffInYears === 1) return "1 year ago";
  return `${diffInYears} years ago`;
}

export function formatToDatetimeLocal(
  dateInput: string | Date | undefined | null
): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const pad = (num: number) => String(num).padStart(2, "0");

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
