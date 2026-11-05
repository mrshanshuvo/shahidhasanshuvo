"use client";
import { motion } from "framer-motion";
import { Blog } from "@/types";
import Link from "next/link";
import { FaPenNib, FaArrowRight } from "react-icons/fa";

import BlogCard from "./BlogCard";

interface BlogClientProps {
  blogs: Blog[];
}

export default function BlogClient({ blogs }: BlogClientProps) {
  return (
    <section
      id="blog"
      className="relative scroll-mt-28 overflow-hidden bg-white py-16 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-sm font-black tracking-[0.2em] text-emerald-500 uppercase md:text-lg"
            >
              <FaPenNib /> Latest Writing
            </motion.h2>
          </motion.div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex shrink-0"
          >
            <Link
              href="/blog"
              className="group flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Read All Articles
              <FaArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={12}
              />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, idx) => (
            <BlogCard key={blog._id} blog={blog} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
