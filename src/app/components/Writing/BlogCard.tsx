"use client";
import { motion } from "framer-motion";
import { Blog } from "@/types";
import { FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/utils";

interface BlogCardProps {
  blog: Blog;
  index: number;
}

export default function BlogCard({ blog, index }: BlogCardProps) {
  return (
    <motion.a
      href={blog.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group block"
    >
      <Card className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-xl dark:border-white/5 dark:bg-slate-900/40">
        <CardHeader className="p-8 pb-0">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              {blog.tags.slice(0, 2).map((tag, tIdx) => (
                <Badge
                  key={tIdx}
                  variant="outline"
                  className="rounded-full border-none bg-blue-400/10 px-3 py-1 text-[10px] font-black tracking-widest text-blue-400 uppercase"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <FaCalendarAlt size={12} />
              {formatRelativeTime(blog.date)}
            </div>
          </div>

          {blog.image && (
            <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          <h3 className="mb-4 line-clamp-2 text-2xl font-bold text-slate-900 transition-colors group-hover:text-blue-500 dark:text-white">
            {blog.title}
          </h3>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {blog.description}
          </p>

          <div className="flex items-center gap-2 text-sm font-bold text-blue-500">
            Read Article{" "}
            <FaArrowRight className="transition-transform group-hover:translate-x-2" />
          </div>
        </CardContent>
      </Card>
    </motion.a>
  );
}
