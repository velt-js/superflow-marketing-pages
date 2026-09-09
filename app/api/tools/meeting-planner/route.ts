import { SITE_URL } from "@/app/_seo/schema";
import {
  findMeetingTimes,
  PlannerInputError,
} from "@/lib/tools/meeting-planner/api";

export const runtime = "nodejs";

// Stateless, bounded local computation, like the UTM and MD5 APIs. No
// external requests, credentials, calendar access, or application storage.
const MAX_BYTES = 16_384;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};
function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Count actual streamed bytes; Content-Length may be absent or incorrect.
    const reader = request.body?.getReader();
    if (!reader)
      return json(
        { ok: false, message: "Send a JSON body with locations and date." },
        400,
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          return json(
            { ok: false, message: "Request body must be 16 KB or smaller." },
            413,
          );
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    let input: unknown;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return json(
        { ok: false, message: "Send valid JSON with locations and date." },
        400,
      );
    }
    return json(findMeetingTimes(input, SITE_URL));
  } catch (error) {
    if (error instanceof PlannerInputError)
      return json({ ok: false, message: error.message, ...error.details }, 400);
    return json(
      {
        ok: false,
        message: "Could not calculate meeting times. Please try again.",
      },
      500,
    );
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
