// Cache-age formatting, kept apart from the cache itself.
//
// This is the one piece of the caching story a browser needs: a cached result
// renders with "Checked 3 hours ago" next to its re-run button, so the client
// component showing the report has to format that number.
//
// It cannot live in `./cache`. That module reaches the KV store and builds its
// keys through `./url`, which imports `node:dns` and `node:net` for the SSRF
// guard. A client component importing anything from `./cache` therefore drags
// `node:dns` into the browser bundle, and the bundler cannot resolve it: the
// page 500s in dev with "the chunking context does not support external
// modules (request: node:dns)". Splitting the pure formatter out is what keeps
// the guard server-side without hiding the cache age from the UI.
//
// Nothing here may import from `./cache`, `./url`, or `./kv`.

/**
 * Formats a cache age as the UI phrase. Plain words, no em dashes.
 *
 * @param ageSeconds - Seconds since the result was produced.
 */
export function formatCacheAge(ageSeconds: number): string {
  try {
    if (ageSeconds < 60) return "just now";
    const minutes = Math.floor(ageSeconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } catch {
    return "recently";
  }
}
