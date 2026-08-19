// Content for the review-like-travis-kalanick tool.
//
// FRAMING NOTE: the thinnest-grounded of the five lenses, and the one that
// needed the most narrowing. The fourteen Uber cultural values — the artefact
// most associated with him — were publicly retired by Uber in 2017 and are not
// used as a source. The lens is scoped to time-to-value, friction and
// marketplace mechanics, and the copy below says so plainly rather than
// implying a broader endorsement.

import type { ToolContent } from "./types";

export const REVIEW_LIKE_TRAVIS_KALANICK_CONTENT: ToolContent = {
  slug: "review-like-travis-kalanick",
  title: "Review like Travis Kalanick",
  subhead:
    "Paste a URL and get your page judged on the growth lens behind early Uber: how long until the product does something, how many fields stand in the way, and whether both sides of your market are on the page.",
  description:
    "Free page review through the growth lens behind early Uber — time to first value, friction, and how a two-sided market gets started. Counts the steps between landing and the product working, and the fields you ask for before trust exists. An interpretation of a documented product approach, scoped to that alone. No login, no email.",
  howItWorks: [
    {
      title: "Paste any URL",
      body: "We load that one page the way a browser would — its text, its markup, and a screenshot. No login and no email.",
    },
    {
      title: "We count the friction",
      body: "Every click, field, gate and wait between landing on the page and the product doing something useful. Then the fields you ask for that the product does not yet need.",
    },
    {
      title: "Get the removal list",
      body: "What to cut from the path, what to show instead of describing, and — if you run a marketplace — whether the page says how the hard side gets there first.",
    },
  ],
  faq: [
    {
      question: "Is this what Travis Kalanick would say about my page?",
      answer:
        "No. He published nothing, so this is not distilled from his writing. It is a lens built from the documented product approach behind early Uber, and it is deliberately narrow. It never writes as him, never states what he would have said, and never invents quotations.",
    },
    {
      question: "Does this endorse how Uber was run?",
      answer:
        "No, and the lens is scoped specifically to avoid implying that. The fourteen Uber cultural values — the artefact most people associate with him — were publicly retired by Uber in 2017 following its workplace investigations, and this tool does not use them as a source for anything. What it does use is the product instinct behind the original service: collapse the time between wanting a thing and having it. The lens carries no view on culture, management, conduct, regulation, or competitive tactics.",
    },
    {
      question: "So what does it actually check?",
      answer:
        "How long from landing on your page to the product doing something useful. How many form fields you ask for before delivering value. Whether the moment the product becomes obvious is shown or merely described. If you run a two-sided market, whether the page addresses both sides and says how the harder one gets there. Whether your proof is specific and local rather than a global aggregate. And whether an interested-but-not-urgent reader has any route at all.",
    },
    {
      question: "Will it tell me to use dark patterns?",
      answer:
        "No. The lens explicitly refuses to recommend hiding pricing, dark-patterning a signup, or manufacturing urgency that is not real. Removing friction is not the same as removing honesty, and a tool that confused the two would be giving advice that costs you customers later.",
    },
    {
      question: "My product is not a marketplace. Is this still useful?",
      answer:
        "Yes. The marketplace test simply does not fire for a single-sided product. The rest — time to value, form fields, showing rather than describing, specific proof — applies to any page that wants somebody to start using something.",
    },
  ],
  facts: [
    {
      label: "Lens source",
      value:
        "The publicly documented product approach behind early Uber: time to first value, friction removal, and two-sided market mechanics. It deliberately does NOT use Uber's fourteen cultural values, which the company publicly retired in 2017. This is an interpretation of a product approach, not the person, and the tool never speaks as him.",
    },
    {
      label: "API",
      value:
        'POST /api/tools/review-like-travis-kalanick with a JSON body of {"url": "example.com"}. Returns the same JSON the page shows. Failures come back as JSON with ok set to false plus a code and a message, never a bare 500.',
    },
    { label: "Rate limit", value: "10 runs per hour per IP." },
    {
      label: "Stored data",
      value:
        "The review, cached for 24 hours keyed on the URL. Nothing beyond that cache.",
    },
    {
      label: "What it checks",
      value:
        "The one page you submit: its visible text, its markup, and a screenshot. Time to first value, form-field count, whether the product moment is shown, two-sided market coverage, specificity of proof, and whether there is a route for someone who is curious now.",
    },
    {
      label: "What it does not check",
      value:
        "Anything not on the page, and anything outside time-to-value, friction and marketplace mechanics. It has no view on culture, management, conduct, regulation or competitive tactics, and it will not recommend dark patterns or false urgency.",
    },
  ],
};
