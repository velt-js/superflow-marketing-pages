// Content for the md5-generator tool.
//
// Unlike its siblings this page predates the shared ToolPage template and
// carries no FAQ or how-it-works data of its own, so this module is the only
// definition rather than a lift. The page itself is deliberately untouched.

import type { ToolContent } from "./types";

export const MD5_GENERATOR_CONTENT: ToolContent = {
  slug: "md5-generator",
  title: "MD5 Hash Generator",
  subhead:
    "Paste any text and get its MD5 digest. The same hashing is available as a public API for scripts.",
  description:
    "Free MD5 hash generator. Paste any text and get its MD5 digest instantly, or call the same endpoint as an API from your own scripts and tools.",
  howItWorks: [
    {
      title: "Paste your text",
      body: "The digest updates as you type. Empty input has a hash too, and it is shown.",
    },
    {
      title: "Copy the digest",
      body: "One click copies the 32-character hexadecimal hash.",
    },
    {
      title: "Or call the API",
      body: "GET or POST /api/tools/md5 from a script, a spreadsheet, or an agent. No key, no signup.",
    },
  ],
  faq: [
    {
      question: "Is MD5 secure?",
      answer:
        "No, and it has not been for about twenty years. Collisions are cheap to produce, so never use MD5 for passwords, digital signatures, or anything that has to prove a file was not tampered with. Use bcrypt or Argon2 for passwords and SHA-256 for integrity.",
    },
    {
      question: "What is MD5 still fine for?",
      answer:
        "Anything where you want a short stable fingerprint and nobody is attacking you: cache keys, deduplication keys, ETags, Gravatar identifiers, and checking that a file transferred without corruption.",
    },
    {
      question: "Does it handle emoji and non-English text?",
      answer:
        "Yes. The text is encoded as UTF-8 before hashing, which is what every other correct implementation does, so the hash matches what you would get from a command line or a backend library.",
    },
    {
      question: "Can I call this from a script?",
      answer:
        "Yes. GET /api/tools/md5?text=hello returns JSON, and you can POST JSON, form data, or a raw body instead. There is no key and no signup, and input is capped at 1 MB.",
    },
    {
      question: "How do I check a file checksum?",
      answer:
        "This tool hashes text rather than files. For a file, use md5sum on Linux, md5 on macOS, or CertUtil -hashfile on Windows, and compare the result to the checksum the publisher gave you.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No login, no email, no ads." },
    { label: "Algorithm", value: "MD5, per RFC 1321, over the UTF-8 bytes of the input." },
    {
      label: "API endpoint",
      value:
        "GET https://usesuperflow.ai/api/tools/md5?text=... or POST the same path with JSON, form data, or a raw body.",
    },
    {
      label: "API response",
      value: 'JSON: { "md5", "algorithm", "bytes" }.',
    },
    { label: "API input limit", value: "1 MB." },
    {
      label: "Security note",
      value:
        "MD5 is cryptographically broken. Use it for fingerprints and checksums, never for passwords or signatures.",
    },
  ],
};
