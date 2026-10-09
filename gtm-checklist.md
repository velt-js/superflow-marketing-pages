# Manual checklist: Google Tag Manager and Termly

Things the code can't do. They're done by hand in the GTM and Termly dashboards.

**Why GTM still matters:** after this PR, the site only loads the GTM container (`GTM-M6Q8QPG`) for visitors who accept **Marketing**, so these steps aren't what keeps the marketing site compliant. They matter because:

- the same container runs in the logged-in app, and
- they let us load GTM for Analytics-only visitors later (see the last section).

Tag numbers below are the IDs GTM shows in each tag's URL (`…/tags/<id>`). We read them from the published container (version 76).

## 1. GTM: delete the Reddit pixel

1. Open **Tags** and filter by **Paused**. There are 6 paused tags: **13, 23, 45, 60, 75, 82**. Tags 13 and 23 are Google Ads conversions; 45, 75 and 82 are Custom HTML; 60 is a custom template.
2. Open 45, 60, 75 and 82. If any of them is the Reddit pixel (look for `rdt(` or `redditstatic.com`), **delete** it. Don't just leave it paused.
3. Also search all tags for `reddit`. Nothing active matched when we checked, so this is a final sweep.

## 2. GTM: turn on the consent overview

**Admin → Container Settings → Additional Settings → Enable consent overview → Save.** This adds a shield icon to the Tags list that shows each tag's consent settings.

## 3. GTM: require consent on every non-Google tag

None of these tags check consent today, so they fire whatever the visitor chose. For each tag below:

1. Open the tag.
2. Go to **Advanced Settings → Consent Settings → Require additional consent for tag to fire**.
3. Add `ad_storage`, `ad_user_data` and `ad_personalization`.
4. Save.

| Tag | What it is |
|---|---|
| 16 | Meta pixel base code (Custom HTML) |
| 25 | Meta `Free_Signup` event |
| 26 | Meta `Install_Success` event |
| 42 | Meta `Purchase` event |
| 28 | X pixel base `of55h` |
| 29 | X event `of55n` |
| 30 | X event `of55r` |
| 32 | LinkedIn Insight `4956052` |
| 34 | LinkedIn conversion `12809172` |
| 35 | LinkedIn conversion `12809180` |
| 43 | LinkedIn conversion `13765540` |

## 4. GTM: check the Google tags

Google tags have **built-in** consent checks, so they need no extra consent. Make sure none of them is set to **"No additional consent required"** in a way that overrides those checks:

- **Google Ads:** 7 (Conversion Linker), 11 (Remarketing), 40, 50, 74, 78 (conversions). Built-in: `ad_storage`, `ad_user_data`, `ad_personalization`.
- **GA4:** 63 (Google tag `G-NKFPRQTBQY`), 64, 65, 66 (events). Built-in: `analytics_storage`.

## 5. GTM: preview, then publish

1. Click **Preview** and open `https://usesuperflow.ai`. In Tag Assistant, before you accept anything, the Meta, LinkedIn and X tags should be under **Tags Not Fired**. (They won't load at all on the site until Marketing is accepted, but preview shows the setting is right.)
2. Click **Submit → Publish**. Name the version "Consent requirements on non-Google tags; Reddit removed".

**Effect on the logged-in app (approved):**
- The app shares this container. Where the app sets no consent state, GTM treats consent as granted, so the app's tags fire as they do today.
- If the app later adds a consent banner with Consent Mode, these settings make its ad tags respect it automatically.

## 6. Termly dashboard (app.termly.io → this website)

1. **Rescan the right domain.** The cookie scan covers the old `usesuperflow.com`. Set the website URL to `https://usesuperflow.ai` and run a new scan.
2. **Categorise what the scan finds.**
   - **Analytics:** Amplitude (`AMP_*`), GA4 (`_ga*`).
   - **Advertising:** Google Ads (`_gcl_*`), Meta (`_fbp`), X (`_twpid`, `_twsid`), LinkedIn (`li_*`), RB2B, Claydar, Rewardful.
   - **Essential:** Termly's own entries and `sfToolbarVersion`.
   - Move the X pixel's `adsct` from Analytics to Advertising.
   - Clear out the "unclassified" pile; most of it belongs to the app.
3. **Banner text**, if your plan allows custom copy:
   - Buttons: "Accept all" / "Reject all" / "Manage preferences".
   - Make the banner's policy link point to the privacy policy (`https://usesuperflow.ai/privacy`).
4. **Leave these as they are:**
   - All regions on **opt-in** (already true).
   - **Auto-block off.** The site blocks scripts in its own code, and Termly's auto-block on top would mean two gates disagreeing.
5. **Optional:** turn on "Honor Global Privacy Control". The site already honours GPC in code, so this is belt and braces.

## 7. After publishing

Run the consent test against production:

```
CONSENT_BASE_URL=https://usesuperflow.ai npm run consent:test
```

## Later (optional): Analytics-only visitors and GTM

Once step 3 is published, GTM could load for Analytics-only visitors too, so that `G-NKFPRQTBQY` also counts them. That's a one-line change in `components/consent/ConsentScripts.tsx`: render GTM when `grants.analytics || grants.marketing`. Re-run the consent test after making it.
