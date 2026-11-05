"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Blog } from "@/types";
import BlogCard from "@/app/components/Writing/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";

interface Props {
  blogs: Blog[];
}

export default function BlogArchiveClient({ blogs }: Props) {
  const [activeTag, setActiveTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const allTags = ["All", ...Array.from(new Set(blogs.flatMap((b) => b.tags)))];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesTag = activeTag === "All" || blog.tags.includes(activeTag);
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white"
          >
            Technical <span className="text-blue-500">Writing</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400"
          >
            Exploring the intersection of code, design, and artificial intelligence.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full md:w-96"
          >
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-full border-slate-200 bg-white pl-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {allTags.slice(0, 8).map((tag) => (
              <Button
                key={tag}
                onClick={() => setActiveTag(tag)}
                variant={activeTag === tag ? "default" : "outline"}
                className={`rounded-full px-4 py-1 text-xs font-black transition-all ${
                  activeTag === tag
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "border-slate-200 bg-slate-100 text-slate-600 hover:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                }`}
              >
                {tag}
              </Button>
            ))}
          </motion.div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog, i) => (
              <motion.div
                key={blog._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <BlogCard blog={blog} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredBlogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-xl font-medium text-slate-500">
              No articles found matching your criteria.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
