// The prose and CTA shared by the tool page and every shareable status page,
// so the two are one page in two states rather than two pages.

export const STATUS_FOOTER_CTA = {
  heading: "Knowing it is up is the first question. Knowing it is right is the rest.",
  body: "Superflow agents open every page of every site you ship, on every change, and check them against your own QA rules. They tell you when something breaks, changes, or quietly stops working, not only when the whole site goes dark.",
  linkText: "Start free",
};

export function StatusWhyThisMatters() {
  return (
    <>
      <h3>Down for everyone, or down for you</h3>
      <p>
        When a site will not load, the first question is never what broke. It
        is whose problem it is. A page that fails in your browser can be failing
        because the server is gone, or because your office DNS resolver is
        stale, your VPN is routing through a region the site blocks, a browser
        extension is rewriting the request, or the site simply rate limited
        your address after a few refreshes. Every one of those looks identical
        from a single chair: a spinner, then an error.
      </p>
      <p>
        So this tool does the one thing that separates them. It asks the site
        from somewhere that is not you. Our server makes a plain request, the
        way a first-time visitor&apos;s browser would, and reports what it saw.
        If we get an answer and you do not, the fix is on your side of the
        connection, and you can stop refreshing. If neither of us gets one, it
        is the site, and someone with access needs to know.
      </p>
      <h3>Why a 403 counts as up</h3>
      <p>
        Most status checkers call anything that is not a 200 a failure. We do
        not, because the question is whether the server is alive, not whether
        it liked our request. A 403 from a bot blocker, a 401 from a login
        wall, a 404 for a page that moved: each of those is a server that is
        running, answering, and making a decision. We show you the status so
        you can judge it, and we reserve the word down for the cases where
        nothing answered at all, or the server answered that it was broken.
      </p>
      <h3>What one check cannot tell you</h3>
      <p>
        This is a snapshot from one place at one moment. A site that flaps
        during a deploy can be up for us and down for you ten seconds later. A
        site that blocks a region is up from here and down from there. Run it
        twice if the first answer surprises you, and treat a verdict that
        changes between runs as its own finding: unstable is a different
        problem from down, and usually a more urgent one.
      </p>
    </>
  );
}
