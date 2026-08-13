// Third-party scripts loaded site-wide. Mounted once from app/layout.tsx so
// every route picks them up. They fall into two groups, and the split is
// deliberate — see IDENTITY TAGS below before moving anything between them.
//
// IDENTITY TAGS (RB2B, Claydar) are native <script> elements, rendered first
// so they are the earliest executable tags in <body>. They must NOT use
// next/script: strategy="afterInteractive" injects from a React effect, so
// the tag never reaches the server HTML and only runs once the page's
// ~350 KB of JS has downloaded and hydrated. For a page-view counter that is
// merely late; for visitor de-anonymization it is lossy, because anonymous
// page views are most of what these tools exist to resolve and every visitor
// who reads and leaves before hydration settles is never identified. It also
// makes RB2B's installation scanner report "script only loads after user
// interaction" — the tag is absent on load and appears once simulated
// scroll/mouse movement buys enough time for hydration to finish.
//
// EVERYTHING ELSE (analytics, widgets, consent UI) stays on next/script with
// strategy="afterInteractive" — inline snippets wrapped in <Script id=...>
// per Next.js requirements, external ones as <Script src=...>. These tolerate
// the delay, and keeping them off the critical path is worth more than
// firing them a few seconds earlier.
//
// `intercomSettings.hide_default_launcher` is set to true so Intercom's
// built-in chat bubble does not stack on top of the custom IntercomButton
// in components/home/IntercomButton.tsx. The custom button calls
// `window.Intercom("show")` to open the messenger.

import Script from "next/script";

const GTM_ID = "GTM-M6Q8QPG";
const GA_MEASUREMENT_ID = "G-HFXRYF6WF8";
const REWARDFUL_KEY = "626baf";
const INTERCOM_APP_ID = "gkjq60px";
const SUPERFLOW_TOOLBAR_API_KEY = "aU1MxKP0rca2UXwKi8bl";
const SUPERFLOW_TOOLBAR_PROJECT_ID = "8818554835635078";
const TERMLY_ID = "2bc67d1d-a9a0-4aab-8562-dcd9c354bff2";
const RB2B_KEY = "Q6J2RH2WVE6D";
const CLAYDAR_ID = "cgBo1m1XAw";

export function ThirdPartyScripts() {
  return (
    <>
      {/* ---- Identity tags: server-rendered, never hydration-gated ---- */}

      {/* RB2B — visitor de-anonymization / person-level identification.
          Vendor ships an inline bootstrapper that fetches its own payload
          via an async script it creates, so this executes during HTML parse
          and costs the critical path a few hundred bytes. React only hoists
          `async src` scripts into <head>; inline ones stay where rendered. */}
      <script
        id="rb2b"
        dangerouslySetInnerHTML={{
          __html: `!function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement("script");s.async=true;s.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+key+"/"+key+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);}("${RB2B_KEY}");`,
        }}
      />

      {/* Claydar (Clay web intent) — the same treatment, in the form Clay
          ships: a plain <script src>. Three constraints pin the attributes:

          - It stays a native tag, not next/script, for the reason above and
            because Clay's installation verifier fetches static HTML and
            looks for the tag there.
          - `async` is intentionally omitted. React 19 hoists async scripts
            into <head>, and Clay rejects a head install.
          - `defer` replaces it: same non-blocking fetch, but React leaves
            deferred scripts where they are rendered, so the tag stays in
            <body>. Without it this would be a render-blocking request at
            the top of the document.

          Deferred execution still lands at the end of HTML parse — long
          before hydration, which is the only deadline that matters here. */}
      <script
        id="claydar"
        defer
        src={`https://static.claydar.com/init.v1.js?id=${CLAYDAR_ID}`}
      />

      {/* ---- Everything below is next/script / afterInteractive ---- */}

      {/* Rewardful — affiliate attribution */}
      <Script id="rewardful-queue" strategy="afterInteractive">
        {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
      </Script>
      <Script
        id="rewardful-script"
        src="https://r.wdfl.co/rw.js"
        data-rewardful={REWARDFUL_KEY}
        strategy="afterInteractive"
      />

      {/* Google Analytics (gtag.js) */}
      <Script
        id="ga-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>

      {/* Google Tag Manager — head snippet */}
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>

      {/* Intercom — chat widget. hide_default_launcher keeps Intercom's
          built-in bubble suppressed so the custom IntercomButton owns the
          UI. Calls to window.Intercom('show') open the messenger. */}
      <Script id="intercom-settings" strategy="afterInteractive">
        {`window.intercomSettings = { api_base: "https://api-iam.intercom.io", app_id: "${INTERCOM_APP_ID}", hide_default_launcher: true };`}
      </Script>
      <Script id="intercom-loader" strategy="afterInteractive">
        {`(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${INTERCOM_APP_ID}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`}
      </Script>

      {/* Superflow Toolbar — dogfooding own product */}
      <Script
        id="superflowToolbarScript"
        data-sf-platform="other-manual"
        src={`https://cdn.velt.dev/lib/superflow.js?apiKey=${SUPERFLOW_TOOLBAR_API_KEY}&projectId=${SUPERFLOW_TOOLBAR_PROJECT_ID}`}
        strategy="afterInteractive"
      />

      {/* Termly — consent banner UI (autoBlock=off, so it does not gate
          the other scripts above) */}
      <Script
        id="termly"
        src={`https://app.termly.io/resource-blocker/${TERMLY_ID}?autoBlock=off`}
        strategy="afterInteractive"
      />
    </>
  );
}

/**
 * GTM noscript fallback iframe. Must be rendered immediately after the
 * opening <body> tag per Google's GTM installation guide. Mounted from
 * app/layout.tsx, not bundled with <ThirdPartyScripts> above (which is
 * Script-only and not body-position-sensitive).
 */
export function GtmNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
