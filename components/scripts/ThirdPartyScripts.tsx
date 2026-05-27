// Third-party scripts loaded site-wide. Mounted once from app/layout.tsx so
// every route picks them up. Inline snippets are wrapped in <Script id=...>
// per Next.js requirements; external scripts use <Script src=...>.
//
// `intercomSettings.hide_default_launcher` is set to true so Intercom's
// built-in chat bubble does not stack on top of the custom IntercomButton
// in components/home/IntercomButton.tsx. The custom button calls
// `window.Intercom("show")` to open the messenger.

import Script from "next/script";

const GTM_ID = "GTM-M6Q8QPG";
const REWARDFUL_KEY = "626baf";
const MIXPANEL_TOKEN = "15f22bfd89315cb10f7cd65937b149cb";
const INTERCOM_APP_ID = "gkjq60px";
const SUPERFLOW_TOOLBAR_API_KEY = "aU1MxKP0rca2UXwKi8bl";
const SUPERFLOW_TOOLBAR_PROJECT_ID = "3024977291570041";
const TERMLY_ID = "2bc67d1d-a9a0-4aab-8562-dcd9c354bff2";

export function ThirdPartyScripts() {
  return (
    <>
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

      {/* Google Tag Manager — head snippet */}
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>

      {/* Mixpanel — via Velt CDN proxy */}
      <Script id="mixpanel" strategy="afterInteractive">
        {`var MIXPANEL_CUSTOM_LIB_URL = "https://cdn.velt.dev/mp/lib.min.js";
(function (f, b) { if (!b.__SV) { var e, g, i, h; window.mixpanel = b; b._i = []; b.init = function (e, f, c) { function g(a, d) { var b = d.split("."); 2 == b.length && ((a = a[b[0]]), (d = b[1])); a[d] = function () { a.push([d].concat(Array.prototype.slice.call(arguments, 0))); }; } var a = b; "undefined" !== typeof c ? (a = b[c] = []) : (c = "mixpanel"); a.people = a.people || []; a.toString = function (a) { var d = "mixpanel"; "mixpanel" !== c && (d += "." + c); a || (d += " (stub)"); return d; }; a.people.toString = function () { return a.toString(1) + ".people (stub)"; }; i = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" "); for (h = 0; h < i.length; h++) g(a, i[h]); var j = "set set_once union unset remove delete".split(" "); a.get_group = function () { function b(c) { d[c] = function () { call2_args = arguments; call2 = [c].concat(Array.prototype.slice.call(call2_args, 0)); a.push([e, call2]); }; } for (var d = {}, e = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)), c = 0; c < j.length; c++) b(j[c]); return d; }; b._i.push([e, f, c]); }; b.__SV = 1.2; e = f.createElement("script"); e.type = "text/javascript"; e.async = !0; e.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === f.location.protocol && "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//) ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"; g = f.getElementsByTagName("script")[0]; g.parentNode.insertBefore(e, g); } })(document, window.mixpanel || []);
mixpanel.init('${MIXPANEL_TOKEN}', {track_pageview: "full-url", persistence: 'localStorage', api_host: "https://cdn.velt.dev/mp"});`}
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
      <Script id="superflow-toolbar-config" strategy="afterInteractive">
        {`var SUPERFLOW_TOOLBAR_API_KEY="${SUPERFLOW_TOOLBAR_API_KEY}"; var SUPERFLOW_TOOLBAR_PROJECT_ID="${SUPERFLOW_TOOLBAR_PROJECT_ID}";`}
      </Script>
      <Script
        id="superflow-toolbar"
        src="https://cdn.jsdelivr.net/npm/@usesuperflow/toolbar/superflow.min.js"
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
