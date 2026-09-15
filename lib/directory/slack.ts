// Posting directory activity into Slack.
//
// Fire-and-forget by design. A match request is already saved and already
// emailed by the time this runs; Slack is where the team SEES it, not
// where it is recorded. So a webhook that is unset, rate-limited or down
// must never turn a founder's successful submission into an error page -
// it degrades to a log line and the request is still in the store.
//
// Plain `fetch` against an incoming webhook, no SDK. The existing Clay
// automation posts into #agency-campaign-replies the same way.

/** How long a post may take before it is abandoned. Short: nobody is
 *  waiting on Slack, and a founder is waiting on the response. */
const SLACK_TIMEOUT_MS = 4000;

const LOG_PREFIX = "[directory/slack]";

/**
 * Whether Slack posting is configured.
 *
 * @returns True when a webhook URL is set.
 */
export function slackIsConfigured(): boolean {
  try {
    return Boolean(process.env.DIRECTORY_SLACK_WEBHOOK_URL);
  } catch {
    return false;
  }
}

/**
 * Posts a plain-text message to the configured channel.
 *
 * The channel is whatever the webhook was created against - Slack
 * incoming webhooks are bound to one channel at creation, so the choice
 * between #agency-campaign-replies and a new #directory-matches is made
 * when the webhook is minted, not here.
 *
 * @param text - Slack-flavoured markdown. Keep it one screen tall: this
 *                is a notification, and the full record is in the store.
 * @returns True when Slack accepted the post. False is logged, never
 *          raised - see the header.
 */
export async function postToSlack(text: string): Promise<boolean> {
  try {
    const webhookUrl = process.env.DIRECTORY_SLACK_WEBHOOK_URL;
    if (!webhookUrl) return false;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(SLACK_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`${LOG_PREFIX} webhook returned ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} post failed:`, error);
    return false;
  }
}
