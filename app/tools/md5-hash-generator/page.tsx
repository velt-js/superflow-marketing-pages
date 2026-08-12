// MD5 Hash Generator.
//
// The UI hashes in the browser. The existing /tools/md5 route stays as the
// API for scripts and agents, and the page documents it rather than hiding
// it — an endpoint nobody knows about is not a feature.

import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";
import { Md5Tool } from "@/components/tools/md5/Md5Tool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import type { ToolFaqItem } from "@/components/tools/ToolFaq";

const SLUG = "md5-hash-generator";
const PATH = `/tools/${SLUG}`;

const TITLE = "MD5 Hash Generator";
const SUBHEAD =
  "Hash any text to MD5 as you type. Runs in your browser, so nothing is uploaded, and there is an API for scripts.";
const DESCRIPTION =
  "Free online MD5 hash generator. Type or paste text and get the MD5 hash instantly, computed in your browser so nothing is uploaded. Includes a public API for curl and scripts. No login, no ads.";

const FAQ: ToolFaqItem[] = [
  {
    question: "Is my text sent to a server?",
    answer:
      "No. The hashing runs in your browser, so what you paste never leaves the tab. That matters more than it sounds: most of what people paste into a public hash tool is an email address, a token, or a password, and there is no good reason for any of that to travel to someone else's log.",
  },
  {
    question: "Is MD5 secure?",
    answer:
      "No, and it has not been for about twenty years. Collisions are cheap to produce, so never use MD5 for passwords, digital signatures, or anything that has to prove a file was not tampered with. Use bcrypt or Argon2 for passwords and SHA-256 for integrity.",
  },
  {
    question: "What is MD5 still fine for?",
    answer:
      "Anything where you want a short stable fingerprint and nobody is attacking you: cache keys, deduplication keys, ETags, Gravatar identifiers, and checking that a file transferred without corruption. Those are almost certainly why you are here, and MD5 is a reasonable choice for all of them.",
  },
  {
    question: "Does it handle emoji and non-English text?",
    answer:
      "Yes. The text is encoded as UTF-8 before hashing, which is what every other correct implementation does, so the hash matches what you would get from a command line or a backend library.",
  },
  {
    question: "Can I call this from a script?",
    answer:
      "Yes. GET /tools/md5?text=hello returns JSON, and you can POST JSON, form data, or a raw body instead. There is no key and no signup, and input is capped at 1 MB. The panel on this page has copy-paste curl examples.",
  },
  {
    question: "How do I check a file checksum?",
    answer:
      "This tool hashes text rather than files. For a file, use md5sum on Linux, md5 on macOS, or CertUtil -hashfile on Windows, and compare the result to the checksum the publisher gave you.",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Type or paste",
    body: "The hash updates on every keystroke. Empty input has a hash too, and it is shown.",
  },
  {
    title: "Hashed in your browser",
    body: "An implementation of RFC 1321 running locally, over the UTF-8 bytes of your text.",
  },
  {
    title: "Copy it, or call the API",
    body: "One click to copy, or hit /tools/md5 from curl or a script when you need it automated.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: `${TITLE}: Free Online MD5 Hash Tool`,
  description: DESCRIPTION,
  path: PATH,
});

export default function Md5HashGeneratorPage() {
  return (
    <>
      <PageJsonLd
        name={`${TITLE} | Superflow`}
        description={DESCRIPTION}
        path={PATH}
        trail={[
          { name: "Free tools", url: `${SITE_URL}/tools` },
          { name: TITLE, url: `${SITE_URL}${PATH}` },
        ]}
      />
      <JsonLd
        id="ld-md5-app"
        data={buildToolAppSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
        })}
      />
      <JsonLd
        id="ld-md5-faq"
        data={buildFaqPageSchema(
          FAQ.map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
        )}
      />

      <ToolPage
        slug={SLUG}
        eyebrow="Free tool, no login"
        h1={TITLE}
        subhead={SUBHEAD}
        howItWorks={HOW_IT_WORKS}
        faq={FAQ}
        footerCta={{
          heading: "Hashes are easy. Knowing what changed is not",
          body: "Superflow agents watch every page of every site you ship and tell you what moved, before your client notices.",
          linkText: "Start free",
        }}
        whyThisMatters={
          <>
            <h3>Why a hash tool should not have a server</h3>
            <p>
              Look at what people paste into one. Email addresses, for Gravatar
              URLs. API tokens, to compare against a value in a log. Passwords,
              because someone read a tutorial from 2009. Every online MD5 tool
              that hashes server-side receives all of it, and most of them are
              wrapped in ad networks that receive rather more.
            </p>
            <p>
              MD5 is six lines of arithmetic. There is no reason for it to
              involve a network at all, so this one does not. The tool works
              with your connection turned off, which is the easiest way to
              satisfy yourself that the claim is true.
            </p>
            <h3>Use MD5 for fingerprints, never for secrets</h3>
            <p>
              MD5 has been cryptographically broken since the mid-2000s.
              Producing two different inputs with the same hash takes seconds on
              a laptop, which means it cannot prove that a file is unmodified or
              that a password is what someone claims.
            </p>
            <p>
              None of that matters for the jobs it is usually doing. A cache key
              only needs to be stable and short. A dedupe key only needs to
              collide rarely by accident, not resist someone trying. Gravatar
              made MD5 part of its URL scheme and it works fine. Reach for
              SHA-256 when integrity matters, and bcrypt or Argon2 for
              passwords.
            </p>
            <h3>An API, because tools should be callable</h3>
            <p>
              The same hash is available at <code>/tools/md5</code> over GET or
              POST, with no key and no signup. That is deliberate: an agent or a
              build script should be able to use this without a browser, and the
              tools in this suite are being built to be called as well as
              clicked.
            </p>
          </>
        }
      >
        <Md5Tool />
      </ToolPage>
    </>
  );
}
