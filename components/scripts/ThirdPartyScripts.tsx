// Site-wide scripts that do NOT depend on consent, plus the consent machinery
// itself. Everything that needs consent lives in
// components/consent/ConsentScripts.tsx - adding a tracker here would load it
// for every visitor before they have said yes, which is the exact failure
// consent-audit.md documents. Don't.
//
// ConsentHead goes in <head>, ahead of everything else:
//   1. Google Consent Mode v2 defaults, all denied, so any Google tag that
//      ever runs starts from "no" rather than from the absence of a decision.
//      (Google treats "no state yet" as granted - the audit caught gtag.js
//      writing _ga and _gcl_au cookies in that window.)
//   2. Termly, the consent banner. It records the visitor's choice; it is
//      loaded with autoBlock=off because ConsentScripts, not Termly, is the
//      one gate that decides what loads. Every gated script waits on Termly's
//      API, so Termly is first by construction.
//
// ThirdPartyScripts renders what may load for everyone.

import Script from "next/script";

const TERMLY_ID = "2bc67d1d-a9a0-4aab-8562-dcd9c354bff2";
const SUPERFLOW_TOOLBAR_API_KEY = "aU1MxKP0rca2UXwKi8bl";
const SUPERFLOW_TOOLBAR_PROJECT_ID = "8818554835635078";

const CONSENT_DEFAULTS = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);`;

/** Server-rendered into <head> by app/layout.tsx. Order matters. */
export function ConsentHead() {
  return (
    <>
      <script id="consent-defaults" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS }} />
      <script id="termly" async src={`https://app.termly.io/resource-blocker/${TERMLY_ID}?autoBlock=off`} />
    </>
  );
}

export function ThirdPartyScripts() {
  return (
    <>
      {/* Superflow Toolbar - our own product, dogfooded on our own site.
          Treated as necessary (decision recorded in consent-audit.md), so
          it loads for every visitor. It also fetches Google Fonts. */}
      <Script
        id="superflowToolbarScript"
        data-sf-platform="other-manual"
        src={`https://cdn.velt.dev/lib/superflow.js?apiKey=${SUPERFLOW_TOOLBAR_API_KEY}&projectId=${SUPERFLOW_TOOLBAR_PROJECT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
