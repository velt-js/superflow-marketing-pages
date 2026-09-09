import { ToolPage } from "@/components/tools/ToolPage";
import { MeetingPlanner } from "@/components/tools/meeting-planner/MeetingPlanner";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import { buildToolAppSchema } from "@/app/_seo/tool-schema";
import { MEETING_PLANNER_CONTENT as content } from "@/lib/tools/content/meeting-planner";

const path = "/tools/meeting-planner";
export const metadata = buildPageMetadata({
  title: "Free Time Zone Meeting Planner by City & Country",
  description: content.description,
  path,
});

export default function MeetingPlannerPage() {
  return (
    <>
      <PageJsonLd
        name={content.title}
        description={content.description}
        path={path}
        trail={[
          { name: "Free tools", url: `${SITE_URL}/tools` },
          { name: content.title, url: `${SITE_URL}${path}` },
        ]}
      />
      <JsonLd
        id="ld-meeting-planner-app"
        data={buildToolAppSchema({
          name: content.title,
          description: content.description,
          path,
        })}
      />
      <JsonLd
        id="ld-meeting-planner-faq"
        data={buildFaqPageSchema(content.faq)}
      />
      <ToolPage
        slug={content.slug}
        eyebrow="Free tool · No signup needed"
        h1={content.title}
        subhead={content.subhead}
        wide
        privacyNote="Free, no login, no email. Locations and settings stay saved in your browser."
        howItWorks={content.howItWorks}
        faq={content.faq}
        whyThisMatters={
          <>
            <h3>Start with where your customer is</h3>
            <p>
              A city is easier to get right than a time-zone abbreviation.
              Search the customer’s location and let the planner map it to a
              named time zone. For countries with several zones, choose the city
              or region that matches their location.
            </p>
            <h3>Compare the whole meeting</h3>
            <p>
              A convenient start is only useful if the whole call fits. The
              planner checks every 15-minute interval of the meeting against
              each participant’s working hours and working days, including
              overnight shifts and dates across the international date line.
            </p>
            <h3>Use the date of the actual call</h3>
            <p>
              Daylight-saving changes do not happen everywhere at once. Pick the
              date you intend to meet so the local times and overlap reflect
              that day’s rules. The timeline uses the first location as its
              reference; change it whenever you want to plan from a customer’s
              perspective.
            </p>
            <p>
              This tool compares the working hours you configure. Confirm the
              proposed time with your customer; their calendar, holidays, and
              time off are not connected.
            </p>
          </>
        }
        footerCta={{
          heading: "Keep customer feedback moving",
          body: "Bring feedback on websites, videos, and creative work together with Superflow.",
          linkText: "Explore Superflow",
        }}
      >
        <MeetingPlanner />
      </ToolPage>
    </>
  );
}
