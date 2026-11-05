"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaTrash,
  FaEnvelope,
  FaEnvelopeOpen,
  FaCheck,
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaInbox,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prevFetchedData, setPrevFetchedData] = useState<any>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const { data: fetchedData, isLoading: loading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/messages");
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json();
    },
  });

  if (fetchedData !== prevFetchedData) {
    setPrevFetchedData(fetchedData);
    if (fetchedData) {
      setMessages(Array.isArray(fetchedData) ? fetchedData : []);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Message deleted");
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      }
    } catch (error) {
      showToast("Failed to delete", "error");
    }
  }

  async function markAsRead(message: Message) {
    if (message.status === "read") return;
    try {
      const res = await fetch(`/api/admin/messages/${message._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? { ...m, status: "read" } : m))
        );
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  }

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={cn(
              "fixed top-8 left-1/2 z-50 flex items-center gap-3 rounded-2xl border px-6 py-3 shadow-2xl backdrop-blur-xl",
              toast.type === "success"
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                : "border-red-500/50 bg-red-500/20 text-red-400"
            )}
          >
            <div
              className={cn(
                "rounded-full p-1.5",
                toast.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
              )}
            >
              {toast.type === "success" ? <FaCheck size={10} /> : <FaTimes size={10} />}
            </div>
            <span className="text-sm font-bold tracking-tight">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Action bar — title is already shown in the AdminTopbar breadcrumb */}
        <div className="flex items-center justify-end gap-3">
          {unreadCount > 0 && (
            <Badge className="animate-pulse rounded-lg border-blue-500/20 bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
              {unreadCount} New Messages
            </Badge>
          )}
          <Badge className="rounded-lg border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 shadow-sm dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400 dark:shadow-none">
            {messages.length} Total
          </Badge>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Message List */}
          <div className="custom-scrollbar max-h-[70vh] space-y-4 overflow-y-auto pr-2 lg:col-span-5">
            {loading ? (
              /* Skeleton Loader List */
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="animate-pulse space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-slate-900/20 dark:shadow-none"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800/60" />
                    <div className="h-3 w-12 rounded bg-slate-100 dark:bg-slate-800/30" />
                  </div>
                  <div className="h-3 w-full rounded bg-slate-50 dark:bg-slate-800/20" />
                </div>
              ))
            ) : messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm dark:border-white/5 dark:bg-slate-900/20 dark:shadow-none">
                <FaInbox
                  size={40}
                  className="mx-auto mb-4 text-slate-200 dark:text-slate-800"
                />
                <p className="font-medium tracking-tight text-slate-400 dark:text-slate-500">
                  Your inbox is empty.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    setSelectedMessage(m);
                    markAsRead(m);
                  }}
                >
                  <Card
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-3xl border shadow-sm transition-all dark:shadow-none",
                      selectedMessage?._id === m._id
                        ? "border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-500/5 dark:bg-blue-600/10"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:hover:border-white/10",
                      m.status === "unread" &&
                        "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-1.5 before:bg-blue-500"
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <p
                          className={cn(
                            "max-w-37.5 truncate font-bold",
                            m.status === "unread"
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {m.name}
                        </p>
                        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                          {new Date(m.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "line-clamp-1 text-xs",
                          m.status === "unread"
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500"
                        )}
                      >
                        {m.message}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Message Content */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none">
                    <CardContent className="space-y-8 p-6 md:p-10">
                      {/* Meta */}
                      <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-center dark:border-white/5">
                        <div className="flex items-center gap-5">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            <FaUser size={28} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                              {selectedMessage.name}
                            </h2>
                            <p className="text-sm font-bold tracking-wide text-blue-400">
                              {selectedMessage.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold tracking-widest text-slate-500 uppercase dark:border-white/5 dark:bg-slate-950/50 dark:text-slate-500">
                          <FaCalendarAlt className="text-blue-500" />
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Message
                          Body
                        </h4>
                        <div className="text-lg leading-relaxed font-medium whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                          {selectedMessage.message}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-8 dark:border-white/5">
                        <a href={`mailto:${selectedMessage.email}`} className="group">
                          <Button className="h-12 rounded-2xl bg-blue-600 px-8 font-bold text-white shadow-lg shadow-blue-600/20 transition-all group-hover:scale-105 hover:bg-blue-500">
                            <FaEnvelope className="mr-2" /> Reply via Email
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(selectedMessage._id)}
                          className="h-12 w-12 rounded-2xl border border-transparent bg-red-500/5 text-red-500 hover:border-red-500/20 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <FaTrash size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="flex h-125 flex-col items-center justify-center space-y-4 rounded-[3rem] border border-dashed border-slate-200 bg-white text-center shadow-sm dark:border-white/5 dark:bg-slate-900/20 dark:shadow-none">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700">
                    <FaEnvelopeOpen size={40} />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                    Select a message to read
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
