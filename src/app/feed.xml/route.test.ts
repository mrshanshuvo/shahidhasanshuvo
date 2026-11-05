import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import Blog from "@/models/Blog";
import { connectDB } from "@/lib/mongodb";

vi.mock("@/lib/mongodb", () => ({
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/models/Blog", () => ({
  default: {
    find: vi.fn(),
  },
}));

describe("RSS Feed API (GET /feed.xml)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with application/rss+xml header and formatted items", async () => {
    const mockBlogs = [
      {
        title: "Architecting High-Throughput Microservices",
        description: "Deep dive into event-driven systems & distributed caching.",
        link: "https://shahidhasanshuvo.vercel.app/blog/microservices",
        date: new Date("2026-10-15T10:00:00Z"),
        tags: ["Architecture", "Node.js", "Redis"],
      },
    ];

    (Blog.find as any).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockBlogs),
      }),
    });

    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/rss+xml");
    expect(res.headers.get("Cache-Control")).toContain("public, s-maxage=3600");

    const text = await res.text();
    expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(text).toContain(
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">'
    );
    expect(text).toContain(
      "<title>Shahid Hasan Shovu - Tech Writings &amp; Engineering Insights</title>"
    );
    expect(text).toContain("<title>Architecting High-Throughput Microservices</title>");
    expect(text).toContain(
      "<description>Deep dive into event-driven systems &amp; distributed caching.</description>"
    );
    expect(text).toContain("<category>Architecture</category>");
    expect(text).toContain("<category>Node.js</category>");
  });

  it("handles empty blog lists without error", async () => {
    (Blog.find as any).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<channel>");
    expect(text).not.toContain("<item>");
  });

  it("escapes XML special characters in title, description, and tags", async () => {
    const mockBlogs = [
      {
        title: "React <Component> & 'Hooks' \"Tricks\"",
        description: "Learn <Suspense> & Server Components",
        link: "/blog/react-tricks",
        date: new Date("2026-11-01T12:00:00Z"),
        tags: ["React & Next.js"],
      },
    ];

    (Blog.find as any).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockBlogs),
      }),
    });

    const res = await GET();
    const text = await res.text();

    expect(text).toContain(
      "&lt;Component&gt; &amp; &apos;Hooks&apos; &quot;Tricks&quot;"
    );
    expect(text).toContain("Learn &lt;Suspense&gt; &amp; Server Components");
    expect(text).toContain("<category>React &amp; Next.js</category>");
  });

  it("returns 500 status when database fails", async () => {
    (connectDB as any).mockRejectedValueOnce(new Error("DB Connection Error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
