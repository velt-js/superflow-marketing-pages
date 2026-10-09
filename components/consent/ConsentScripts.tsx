"use client";

// The single consent gate. Every non-essential third-party script on the site
// is rendered from here, and only once the visitor has granted its category in
// the Termly banner. See lib/consent/consent.ts for the model.
//
// Before Termly has loaded, or if it never loads (ad blockers commonly block
// it), nothing is granted and nothing renders. Failing closed is deliberate.
//
// Mounted once from app/layout.tsx. Termly itself and the Consent Mode
// defaults are not here - they must exist before this component hydrates, so
// they are server-rendered into <head> by ConsentHead in
// components/scripts/ThirdPartyScripts.tsx.
//
// What each category loads:
//   Analytics  - Google Analytics 4 (G-HFXRYF6WF8, via gtag.js) and Amplitude
//                (events, heatmaps, session replay).
//   Marketing  - Google Ads (AW-11181152032, same gtag.js loader), Google Tag
//                Manager (GTM-M6Q8QPG: Meta, LinkedIn and X pixels, Ads
//                remarketing, a second GA4 property), RB2B and Claydar
//                (visitor identification), Rewardful (affiliate attribution).
//
// GTM is Marketing rather than Analytics because, today, most of what it
// fires is advertising and none of its tags declare a consent requirement.
// Loading it on Analytics-only consent would fire the ad pixels too. Once
// gtm-checklist.md is done in the GTM UI it could move to "analytics ||
// marketing" - but this file is what enforces the rule, not the container.

import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";
import { AmplitudePageView } from "@/components/scripts/AmplitudePageView";
import { PageviewTracker } from "@/components/scripts/PageviewTracker";
import { initAmplitude } from "@/lib/analytics/amplitude-client";
import { analytics } from "@/lib/analytics/analytics-service";
import {
  NO_GRANTS,
  clearCategory,
  consentModeSignals,
  grantsFrom,
  hasGpc,
  type ConsentCategory,
  type ConsentWindow,
  type Grants,
  type TermlyConsentState,
} from "@/lib/consent/consent";

const GTM_ID = "GTM-M6Q8QPG";
const GA_MEASUREMENT_ID = "G-HFXRYF6WF8";
// Google Ads account 467-956-1854, on the same gtag.js loader as GA4. Nothing
// here fires a conversion: the portal does (see `GoogleAdsService` in
// superflow_portal_v2). DO NOT also add a Google Ads tag for this ID inside
// the GTM container - gtag.js already owns it, and both would double-count.
const GOOGLE_ADS_ID = "AW-11181152032";
// Domains that share the Ads click id, for the gtag cross-domain linker. The
// `_gcl_*` cookies are scoped to a registrable domain, and the portal lives on
// app.usesuperflow.com, a different one, so the linker decorates outbound
// links with `_gl` for the portal to read back. Keep this list identical to
// `environment.googleAds.linkerDomains` in superflow_portal_v2.
const LINKER_DOMAINS = ["usesuperflow.ai", "usesuperflow.com", "app.usesuperflow.com"];
const REWARDFUL_KEY = "626baf";
const RB2B_KEY = "Q6J2RH2WVE6D";
const CLAYDAR_ID = "cgBo1m1XAw";

const GPC_NOTICE =
  "Your browser is sending a Global Privacy Control signal, so marketing cookies stay off on this site even if you accept.";

/**
 * The visitor's current grants, kept in sync with Termly. Starts with nothing
 * granted and stays there until Termly reports otherwise.
 */
function useConsentGrants(): { grants: Grants; known: boolean } {
  const [state, setState] = useState<{ grants: Grants; known: boolean }>({ grants: NO_GRANTS, known: false });

  useEffect(() => {
    const w = window as ConsentWindow;
    const gpc = hasGpc();
    let attached = false;

    const apply = (consentState?: TermlyConsentState | null) => {
      const next = grantsFrom(consentState ?? w.Termly?.getConsentState?.(), gpc);
      setState((prev) =>
        prev.known && prev.grants.analytics === next.analytics && prev.grants.marketing === next.marketing
          ? prev
          : { grants: next, known: true },
      );
    };
    const onConsent = (payload: { consentState?: TermlyConsentState }) => apply(payload?.consentState);

    // Termly loads async from <head>, so it may not exist yet at hydration.
    const attach = () => {
      if (attached || typeof w.Termly?.on !== "function") return false;
      attached = true;
      w.Termly.on("initialized", onConsent);
      w.Termly.on("consent", onConsent);
      apply();
      return true;
    };
    if (attach()) {
      return () => {
        w.Termly?.off?.("initialized", onConsent);
        w.Termly?.off?.("consent", onConsent);
      };
    }
    let tries = 0;
    const timer = window.setInterval(() => {
      if (attach() || ++tries > 300) window.clearInterval(timer);
    }, 100);
    return () => {
      window.clearInterval(timer);
      if (attached) {
        w.Termly?.off?.("initialized", onConsent);
        w.Termly?.off?.("consent", onConsent);
      }
    };
  }, []);

  return state;
}

/**
 * Appends the GPC notice to Termly's banner text. Termly has no setting for
 * custom banner copy per signal, so it is added to the rendered banner and
 * re-added if Termly re-renders it.
 */
function useGpcNotice() {
  useEffect(() => {
    if (!hasGpc()) return;
    const inject = () => {
      const message = document.querySelector("[class*='termly-styles-termly-banner'] [class*='termly-styles-message']");
      if (!message || message.querySelector("[data-gpc-notice]")) return;
      const p = document.createElement("p");
      p.setAttribute("data-gpc-notice", "");
      p.style.marginTop = "8px";
      p.style.fontWeight = "600";
      p.textContent = GPC_NOTICE;
      message.appendChild(p);
    };
    inject();
    const observer = new MutationObserver(inject);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}

export function ConsentScripts() {
  const { grants, known } = useConsentGrants();
  const previous = useRef<Grants | null>(null);
  useGpcNotice();

  // Keep Google Consent Mode in step with the banner, and handle withdrawal.
  useEffect(() => {
    if (!known) return;
    const w = window as ConsentWindow;
    // Pushed after Termly's own Consent Mode update (it sends one from the
    // same event), so ours - the one that applies GPC - is the last word.
    window.setTimeout(() => w.gtag?.("consent", "update", consentModeSignals(grants)), 0);

    const before = previous.current;
    previous.current = grants;
    if (!before) return;
    const withdrawn = (Object.keys(grants) as ConsentCategory[]).filter((c) => before[c] && !grants[c]);
    if (withdrawn.length) {
      // Scripts already running cannot be unloaded, so clear what they left
      // behind and reload: the fresh page renders without them.
      withdrawn.forEach(clearCategory);
      window.location.reload();
    }
  }, [grants, known]);

  // Amplitude is bundled rather than a script tag, so it is started here.
  useEffect(() => {
    if (!grants.analytics) return;
    initAmplitude();
    analytics.skipIdentification();
  }, [grants.analytics]);

  const google = grants.analytics || grants.marketing;

  return (
    <>
      {/* Page-view trackers for client-side navigations. Mounted only with
          consent: before it they would queue page views in dataLayer that
          gtag.js / GTM replay the moment they load. Both read
          useSearchParams(), hence the Suspense boundary. */}
      <Suspense fallback={null}>
        {google ? <PageviewTracker /> : null}
        {grants.analytics ? <AmplitudePageView /> : null}
      </Suspense>

      {/* ---- Analytics + Marketing: one gtag.js loader, two destinations ---- */}
      {google ? (
        <>
          <Script id="gtag-js" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`gtag('set', 'linker', {'domains': ${JSON.stringify(LINKER_DOMAINS)}});
gtag('js', new Date());`}
          </Script>
        </>
      ) : null}
      {grants.analytics ? (
        <Script id="gtag-ga4" strategy="afterInteractive">
          {`gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      ) : null}

      {/* ---- Marketing ---- */}
      {grants.marketing ? (
        <>
          <Script id="gtag-ads" strategy="afterInteractive">
            {`gtag('config', '${GOOGLE_ADS_ID}');`}
          </Script>

          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>

          {/* RB2B and Claydar identify visitors, so they wait for Marketing
              consent like everything else here. They used to be native tags
              that ran during HTML parse to catch visitors who leave before
              hydration; that is exactly what consent rules out, so the lost
              early page views are the accepted cost. */}
          <Script id="rb2b" strategy="afterInteractive">
            {`!function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement("script");s.async=true;s.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+key+"/"+key+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);}("${RB2B_KEY}");`}
          </Script>
          <Script id="claydar" src={`https://static.claydar.com/init.v1.js?id=${CLAYDAR_ID}`} strategy="afterInteractive" />

          <Script id="rewardful-queue" strategy="afterInteractive">
            {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
          </Script>
          <Script id="rewardful-script" src="https://r.wdfl.co/rw.js" data-rewardful={REWARDFUL_KEY} strategy="afterInteractive" />
        </>
      ) : null}
    </>
  );
}
