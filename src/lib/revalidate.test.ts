import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePortfolio } from "./revalidate";
import { revalidatePath } from "next/cache";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("revalidatePortfolio utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates root layout by default", () => {
    revalidatePortfolio();
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("revalidates extra specific paths", () => {
    revalidatePortfolio(["/projects", "/feed.xml"]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/projects");
    expect(revalidatePath).toHaveBeenCalledWith("/feed.xml");
  });

  it("handles exceptions gracefully without throwing", () => {
    (revalidatePath as any).mockImplementationOnce(() => {
      throw new Error("Cache store error");
    });

    expect(() => revalidatePortfolio()).not.toThrow();
  });
});
