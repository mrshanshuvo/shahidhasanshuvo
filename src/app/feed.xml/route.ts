import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shahidhasanshuvo.vercel.app";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find().sort({ date: -1, order: 1 }).lean();

    const rssItemsXml = blogs
      .map((blog) => {
        const itemUrl = blog.link?.startsWith("http")
          ? blog.link
          : `${BASE_URL}${blog.link?.startsWith("/") ? blog.link : `/${blog.link}`}`;
        const pubDate = blog.date
          ? new Date(blog.date).toUTCString()
          : new Date().toUTCString();
        const categoriesXml = (blog.tags || [])
          .map((tag) => `      <category>${escapeXml(tag)}</category>`)
          .join("\n");

        return `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${escapeXml(itemUrl)}</link>
      <guid isPermaLink="${itemUrl.startsWith("http")}">${escapeXml(itemUrl)}</guid>
      <description>${escapeXml(blog.description)}</description>
      <pubDate>${pubDate}</pubDate>
${categoriesXml ? `${categoriesXml}\n` : ""}    </item>`;
      })
      .join("\n");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Shahid Hasan Shovu - Tech Writings &amp; Engineering Insights</title>
    <link>${BASE_URL}/blog</link>
    <description>Engineering deep-dives, full-stack architecture, machine learning insights, and open-source contributions by Shahid Hasan Shovu.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}

