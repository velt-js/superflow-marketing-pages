/** Vercel supplies approximate IP geolocation; no external service or key needed. */
export function GET(request: Request) {
  const header = (name: string) => {
    try {
      return decodeURIComponent(request.headers.get(name) ?? "").slice(0, 100);
    } catch {
      return "";
    }
  };
  const city = header("x-vercel-ip-city");
  const countryCode = header("x-vercel-ip-country");
  const zone = header("x-vercel-ip-timezone");
  return Response.json(
    city && countryCode && zone ? { city, countryCode, zone } : null,
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
