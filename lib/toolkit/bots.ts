// The AI bot registry.
//
// This is the opinionated core of the AI Visibility Checker: the list of user
// agents that matter, split by whether blocking them costs you presence in AI
// answers or only costs you a contribution to model training.
//
// The split is the whole point. "You are blocking AI crawlers" is a scary and
// mostly useless finding. "You are blocking OAI-SearchBot, which is the only
// reason ChatGPT can cite you" is actionable, and "you are blocking CCBot,
// which is a legitimate choice that costs you nothing in AI answers" is the
// reassurance that makes the rest of the report trustworthy.
//
// Every `consequence` string renders verbatim in the results table, so they
// are written as UI copy: short sentences, plain words, no em dashes.

/** Whether blocking a bot costs answer presence or only training data. */
export type BotTier = "answer" | "training";

export type BotDefinition = {
  /** The exact token as it appears in a robots.txt `User-agent:` line. */
  token: string;
  /** Who operates the crawler. */
  owner: string;
  /** What blocking or allowing it actually affects. */
  feeds: string;
  /** One line on what happens if you block it. Rendered in the results table. */
  consequence: string;
  /** Operator documentation, linked from the results table. */
  docsUrl: string;
  /**
   * Set when the tier is a judgement call rather than a documented fact, so
   * the UI can footnote it instead of overstating our confidence.
   */
  note?: string;
};

/**
 * Bots whose access determines whether you can appear in an AI answer or an
 * AI-assisted search result. Blocking any of these is a visibility problem.
 */
export const ANSWER_BOTS: readonly BotDefinition[] = [
  {
    token: "OAI-SearchBot",
    owner: "OpenAI",
    feeds: "The search index behind ChatGPT's answers and citations.",
    consequence:
      "Block this and ChatGPT cannot surface or link to your site in search results.",
    docsUrl: "https://platform.openai.com/docs/bots",
  },
  {
    token: "ChatGPT-User",
    owner: "OpenAI",
    feeds: "Live fetches when someone asks ChatGPT about a specific page.",
    consequence:
      "Block this and ChatGPT cannot open your page when a user pastes or asks about the link.",
    docsUrl: "https://platform.openai.com/docs/bots",
  },
  {
    token: "GPTBot",
    owner: "OpenAI",
    feeds: "OpenAI's broad crawl of the web.",
    consequence:
      "Block this and you opt out of OpenAI's crawl of your site entirely.",
    docsUrl: "https://platform.openai.com/docs/bots",
    note: "OpenAI documents GPTBot as its training and foundation-model crawler. Blocking it alone does not always remove you from ChatGPT answers, because OAI-SearchBot and ChatGPT-User are the agents that serve answers. It is still the broadest opt-out signal you can send OpenAI, so we count it here.",
  },
  {
    token: "Claude-SearchBot",
    owner: "Anthropic",
    feeds: "The search index Claude uses to find and cite sources.",
    consequence:
      "Block this and Claude cannot surface your site when it searches the web.",
    docsUrl: "https://support.anthropic.com/en/articles/8896518",
  },
  {
    token: "Claude-User",
    owner: "Anthropic",
    feeds: "Live fetches when someone asks Claude about a specific page.",
    consequence:
      "Block this and Claude cannot open your page when a user asks about the link.",
    docsUrl: "https://support.anthropic.com/en/articles/8896518",
  },
  {
    token: "ClaudeBot",
    owner: "Anthropic",
    feeds: "Anthropic's broad crawl of the web.",
    consequence:
      "Block this and you opt out of Anthropic's crawl of your site entirely.",
    docsUrl: "https://support.anthropic.com/en/articles/8896518",
  },
  {
    token: "PerplexityBot",
    owner: "Perplexity",
    feeds: "The index Perplexity searches when it answers a question.",
    consequence:
      "Block this and Perplexity cannot list your site as a source.",
    docsUrl: "https://docs.perplexity.ai/guides/bots",
  },
  {
    token: "Perplexity-User",
    owner: "Perplexity",
    feeds: "Live fetches when a Perplexity user follows a link.",
    consequence:
      "Block this and Perplexity cannot open your page on a user's behalf.",
    docsUrl: "https://docs.perplexity.ai/guides/bots",
  },
  {
    token: "Googlebot",
    owner: "Google",
    feeds: "Google Search, which also backs AI Overviews and AI Mode.",
    consequence:
      "Block this and you disappear from Google Search and every AI answer built on it.",
    docsUrl:
      "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
  },
  {
    token: "Bingbot",
    owner: "Microsoft",
    feeds: "Bing Search, which also backs Microsoft Copilot.",
    consequence:
      "Block this and you disappear from Bing and from Copilot's answers.",
    docsUrl: "https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0",
  },
  {
    token: "Applebot",
    owner: "Apple",
    feeds: "Siri, Spotlight, and Safari suggestions.",
    consequence:
      "Block this and Apple's assistants cannot surface your site.",
    docsUrl: "https://support.apple.com/en-us/119829",
  },
];

/**
 * Bots that only collect training data. Blocking these is a legitimate,
 * increasingly common editorial choice and it does NOT remove you from AI
 * answers. The tool says so plainly instead of scoring it as a failure.
 */
export const TRAINING_BOTS: readonly BotDefinition[] = [
  {
    token: "Google-Extended",
    owner: "Google",
    feeds: "Gemini model training and grounding.",
    consequence:
      "Blocking this does not affect Google Search or AI Overviews. It only opts you out of Gemini training.",
    docsUrl:
      "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
  },
  {
    token: "Applebot-Extended",
    owner: "Apple",
    feeds: "Apple Intelligence model training.",
    consequence:
      "Blocking this does not affect Siri or Spotlight. It only opts you out of Apple's model training.",
    docsUrl: "https://support.apple.com/en-us/119829",
  },
  {
    token: "CCBot",
    owner: "Common Crawl",
    feeds: "The open Common Crawl dataset that many models train on.",
    consequence:
      "Blocking this keeps you out of a widely reused training corpus. It costs you nothing in AI answers.",
    docsUrl: "https://commoncrawl.org/ccbot",
  },
  {
    token: "anthropic-ai",
    owner: "Anthropic",
    feeds: "A legacy Anthropic token some sites still target.",
    consequence:
      "Blocking this is harmless. Anthropic's current crawlers are ClaudeBot, Claude-SearchBot, and Claude-User.",
    docsUrl: "https://support.anthropic.com/en/articles/8896518",
  },
  {
    token: "Meta-ExternalAgent",
    owner: "Meta",
    feeds: "Meta's AI model training.",
    consequence:
      "Blocking this only opts you out of Meta's training data.",
    docsUrl: "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/",
  },
  {
    token: "Bytespider",
    owner: "ByteDance",
    feeds: "ByteDance model training.",
    consequence:
      "Blocking this only opts you out of ByteDance's training data. Many sites block it for crawl-rate reasons.",
    docsUrl: "https://www.douyin.com/user/self",
  },
];

/** Every bot the checker evaluates, answer-tier first. */
export const ALL_BOTS: readonly BotDefinition[] = [
  ...ANSWER_BOTS,
  ...TRAINING_BOTS,
];

/**
 * Looks up a bot by its robots.txt token, case-insensitively.
 *
 * @param token - The user-agent token to find.
 */
export function findBot(token: string): BotDefinition | undefined {
  try {
    const needle = (token ?? "").trim().toLowerCase();
    return ALL_BOTS.find((bot) => bot.token.toLowerCase() === needle);
  } catch {
    return undefined;
  }
}

/**
 * The tier a token belongs to, or undefined when it is not a bot we track.
 *
 * @param token - The user-agent token to classify.
 */
export function tierOf(token: string): BotTier | undefined {
  try {
    const needle = (token ?? "").trim().toLowerCase();
    if (ANSWER_BOTS.some((bot) => bot.token.toLowerCase() === needle)) {
      return "answer";
    }
    if (TRAINING_BOTS.some((bot) => bot.token.toLowerCase() === needle)) {
      return "training";
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * A realistic browser user agent, used as the control in the firewall test
 * (check A2) and as the default for content fetches. Some CDNs serve a
 * challenge page to anything that does not look like a browser, which would
 * make every check downstream wrong.
 */
export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

/**
 * The exact GPTBot user agent string, used as the probe in the firewall test.
 * This is the published value, so a CDN rule that targets GPTBot will match it
 * and we will observe the same block a real crawler would.
 */
export const GPTBOT_USER_AGENT =
  "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot";

/**
 * The user agent the tools themselves send when a check does not need to
 * impersonate anyone. Identifies us honestly and points at the tool page.
 */
export const SUPERFLOW_USER_AGENT =
  "Mozilla/5.0 (compatible; SuperflowToolsBot/1.0; +https://usesuperflow.ai/tools)";
