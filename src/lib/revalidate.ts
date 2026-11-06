import { revalidatePath } from "next/cache";

/**
 * Triggers on-demand Next.js cache revalidation across public routes
 * whenever an admin mutates database records.
 *
 * @param extraPaths Optional specific paths to revalidate (e.g. /projects, /feed.xml)
 */
export function revalidatePortfolio(extraPaths: string[] = []): void {
  try {
    // Revalidates root layout and all child routes (/, /projects, /blog, /playground, etc.)
    revalidatePath("/", "layout");

    for (const path of extraPaths) {
      revalidatePath(path);
    }
  } catch (error) {
    // Defensively handle edge cases where cache store is uninitialized (e.g., test environments)
    console.warn(
      "Revalidation warning (safe to ignore in test/build environments):",
      error
    );
  }
}
