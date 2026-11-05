"use client";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FaTrash,
  FaExternalLinkAlt,
  FaEye,
  FaTimes,
  FaCloudUploadAlt,
} from "react-icons/fa";
import Image from "next/image";
import { FiRefreshCw } from "react-icons/fi";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  aspect?: "square" | "video";
}

export default function ImageUpload({
  value,
  onChange,
  label,
  accept = "image/*,video/*,application/pdf",
  aspect = "square",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setFileName(file.name);

    try {
      // 1. Get the upload signature from our backend
      const sigRes = await fetch("/api/admin/upload/signature");
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature, cloudName, apiKey } = await sigRes.json();

      if (!cloudName) {
        throw new Error("Cloudinary not configured properly");
      }

      // 2. Prepare payload for Cloudinary API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "portfolio");

      // Cloudinary processes PDFs as images by default and restricts their viewing for security.
      // Uploading them as 'raw' ensures they are treated as standard downloadable/viewable files.
      const isPdfFile =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const resourceType = isPdfFile ? "raw" : "auto";

      // 3. Upload directly to Cloudinary from the client
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        true
      );

      // Real, exact progress tracking!
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            // Let the user see "100%" briefly
            setTimeout(() => {
              onChange(data.secure_url);
              setLoading(false);
            }, 500);
          } else {
            setError("File upload failed");
            setLoading(false);
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            setError(errData.error?.message || "File upload failed");
          } catch {
            setError("File upload failed");
          }
          setLoading(false);
        }
      };

      xhr.onerror = () => {
        setError("Network error occurred during upload");
        setLoading(false);
      };

      xhr.send(formData);
    } catch (err: any) {
      setError(err.message || "File upload failed");
      setLoading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400/80 uppercase">
          {label}
        </label>
      )}

      {error ? (
        <div className="relative rounded-2xl border border-rose-500/20 bg-linear-to-br from-rose-500/10 to-rose-900/10 p-6 text-rose-400 shadow-[0_8px_32px_0_rgba(244,63,94,0.1)] backdrop-blur-md">
          <h3 className="mb-2 flex items-center gap-3 text-lg font-bold text-rose-400">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
            Upload Failed
          </h3>
          <p className="pl-5 text-sm font-medium opacity-80">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-5 right-5 rounded-full bg-black/20 p-2 text-rose-400/50 transition-all duration-300 hover:rotate-90 hover:bg-black/40 hover:text-rose-400"
          >
            <FaTimes size={16} />
          </button>
        </div>
      ) : loading ? (
        <div
          className={`group relative flex flex-col justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white/50 p-3 shadow-xl backdrop-blur-md dark:border-white/5 dark:bg-slate-900/50 dark:shadow-2xl ${aspect === "video" ? "aspect-video" : "aspect-square"}`}
        >
          {/* Subtle animated background glow */}
          <div className="absolute inset-0 animate-pulse bg-linear-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 dark:border-indigo-500/30 dark:bg-indigo-500/20">
                  <FiRefreshCw
                    className="animate-spin text-indigo-600 dark:text-indigo-400"
                    size={14}
                  />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold tracking-wide text-slate-900 uppercase dark:text-slate-200">
                    Processing
                  </h4>
                  <span className="mt-0.5 block max-w-20 truncate text-[10px] font-medium text-indigo-600/40 dark:text-indigo-300/60">
                    {fileName}
                  </span>
                </div>
              </div>
              <span className="bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-lg font-black text-transparent">
                {progress}%
              </span>
            </div>

            {/* Premium Gradient Progress Bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:border-white/5 dark:bg-slate-950 dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
              <div
                className="relative h-full rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* Embedded Shimmer inside the bar */}
                <div className="absolute inset-0 h-full w-full -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : value ? (
        <div
          className={`group/image relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)] dark:border-white/10 dark:bg-slate-950 ${aspect === "video" ? "aspect-video" : "aspect-square"}`}
        >
          {value &&
          (value.includes("/video/upload/") ||
            value.toLowerCase().endsWith(".mp4") ||
            value.toLowerCase().endsWith(".webm")) ? (
            <video
              src={value}
              className="h-full w-full object-cover transition-all duration-700 group-hover/image:scale-105 group-hover/image:opacity-60 group-hover/image:blur-[2px]"
              muted
              loop
              onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
              onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
            />
          ) : !isPdf ? (
            <Image
              src={value}
              alt="Upload"
              fill
              className="object-contain transition-all duration-700 group-hover/image:scale-105 group-hover/image:opacity-60 group-hover/image:blur-[2px]"
            />
          ) : (
            <>
              <iframe
                src={`${value}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                className="h-full w-full border-none bg-white transition-all duration-700 group-hover/image:opacity-60 group-hover/image:blur-[2px]"
                title="PDF Preview"
              />
              <div className="absolute inset-0 z-0 bg-transparent" />
            </>
          )}

          {/* Premium Glassy Overlay */}
          <div className="absolute inset-0 z-5 bg-white/5 opacity-0 backdrop-blur-[px] transition-all duration-500 group-hover/image:opacity-100" />

          {/* Glassmorphic Action Overlay */}
          <div className="absolute inset-0 z-10 flex scale-95 flex-wrap items-center justify-center gap-1.5 p-2 opacity-0 transition-all duration-300 group-hover/image:scale-100 group-hover/image:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPreviewOpen(true);
              }}
              title="Expand Preview"
              className="rounded-lg border border-indigo-200 bg-indigo-50 p-1.5 text-indigo-600 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-100 hover:shadow-[0_10px_20px_rgba(99,102,241,0.15)] dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/40 dark:hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)]"
            >
              <FaEye size={14} />
            </button>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Original"
              className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-1.5 text-fuchsia-600 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-fuchsia-100 hover:shadow-[0_10px_20px_rgba(217,70,239,0.15)] dark:border-fuchsia-500/30 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/40 dark:hover:shadow-[0_10px_20px_rgba(217,70,239,0.2)]"
            >
              <FaExternalLinkAlt size={12} />
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              title="Change File"
              className="rounded-lg border border-slate-200 bg-slate-100 p-1.5 text-slate-700 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-slate-200 hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
            >
              <FiRefreshCw size={14} className="animate-hover-spin" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
              }}
              title="Delete File"
              className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-rose-100 hover:shadow-[0_10px_20px_rgba(244,63,94,0.15)] dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/40 dark:hover:shadow-[0_10px_20px_rgba(244,63,94,0.2)]"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group/image relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 p-2 transition-all duration-500 ${aspect === "video" ? "aspect-video" : "aspect-square"} ${
            isDragging
              ? "border-solid border-indigo-400 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
              : "border-dashed border-slate-300 bg-white shadow-sm hover:border-indigo-500/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:shadow-none dark:hover:bg-slate-800/80"
          } `}
        >
          {/* Subtle background glow effect on hover */}
          <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/0 via-purple-500/0 to-pink-500/0 transition-all duration-700 group-hover/image:from-indigo-500/5 group-hover/image:via-purple-500/5 group-hover/image:to-pink-500/5" />

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover/image:-translate-y-1 group-hover/image:scale-110 dark:border-white/5 dark:bg-slate-800/80 dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <FaCloudUploadAlt
                className="text-indigo-600 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)] dark:text-indigo-400"
                size={20}
              />
            </div>
            <div className="space-y-0.5 text-center">
              <h3 className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-[11px] font-black tracking-widest text-transparent uppercase">
                Drop
              </h3>
              <p className="text-[10px] font-bold tracking-tighter text-slate-500 uppercase">
                or click
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[7px] font-black tracking-[0.2em] text-slate-500 uppercase dark:border-white/5 dark:bg-slate-950/50 dark:text-slate-600">
              <span className="text-indigo-500 dark:text-indigo-400/50">IMG</span>
              <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="text-purple-500 dark:text-purple-400/50">VID</span>
              <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="text-fuchsia-500 dark:text-fuchsia-400/50">PDF</span>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept={accept}
        className="hidden"
      />

      {/* Fullscreen Premium Preview Modal */}
      {isPreviewOpen &&
        value &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm transition-all duration-500 sm:p-8"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewOpen(false);
            }}
          >
            <div
              className={`relative w-full ${isPdf ? "h-[85vh] max-w-5xl" : "max-w-4xl"} flex scale-100 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all duration-500`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Refined Header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-slate-950/40 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase opacity-70">
                    Preview Mode
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPreviewOpen(false);
                  }}
                  className="rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-white/10 hover:text-white"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Dynamic Content Body */}
              <div
                className={`relative w-full ${!isPdf ? "aspect-auto max-h-[70vh] p-4" : "flex-1 p-6"} flex items-center justify-center bg-black/20`}
              >
                {value &&
                (value.includes("/video/upload/") ||
                  value.toLowerCase().endsWith(".mp4") ||
                  value.toLowerCase().endsWith(".webm")) ? (
                  <video
                    src={value}
                    controls
                    autoPlay
                    className="max-h-[70vh] max-w-full rounded-xl shadow-2xl transition-transform duration-500"
                  />
                ) : !isPdf ? (
                  <div className="relative h-[70vh] w-full">
                    <Image
                      src={value}
                      alt="Preview"
                      fill
                      className="rounded-xl object-contain shadow-2xl transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
                    <iframe
                      src={`${value}#toolbar=1&navpanes=0&scrollbar=1&view=Fit`}
                      className="h-full w-full border-none"
                      title="PDF Full Preview"
                    />
                  </div>
                )}
              </div>

              {/* Subtle Footer info */}
              <div className="flex justify-center border-t border-white/5 bg-slate-950/20 px-6 py-3">
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  End of Preview
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
