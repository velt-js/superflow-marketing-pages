// Chromium launch options shared by the audit and the consent test.
//
// On a normal machine this returns {}. In a sandbox that routes HTTPS through
// a TLS-re-terminating proxy (HTTPS_PROXY plus a CA file), Chromium ignores
// the system trust store, so every page fails with ERR_CERT_AUTHORITY_INVALID.
// Rather than switch certificate checks off, we tell Chromium to accept chains
// signed by that one CA key - every other certificate is still verified.

import { createHash, X509Certificate } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const DEFAULT_PROXY_CA = "/root/.ccr/agent-proxy-ca.crt";

export function chromiumLaunchOptions() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxy) return {};

  const caPath = process.env.CONSENT_PROXY_CA || DEFAULT_PROXY_CA;
  const args = [];
  if (existsSync(caPath)) {
    const der = new X509Certificate(readFileSync(caPath)).publicKey.export({ type: "spki", format: "der" });
    args.push(`--ignore-certificate-errors-spki-list=${createHash("sha256").update(der).digest("base64")}`);
  }
  return { proxy: { server: proxy }, args };
}
