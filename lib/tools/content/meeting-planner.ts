import type { ToolContent } from "./types";

export const MEETING_PLANNER_CONTENT: ToolContent = {
  slug: "meeting-planner",
  title: "Time Zone Meeting Planner",
  subhead:
    "Find a time that works for you and your customers. Add cities or countries, compare working hours, and leave the time-zone math to us.",
  description:
    "Free time zone meeting planner. Search cities or countries, automatically compare local times and working-hour overlap, and share a customer meeting time. No signup required.",
  howItWorks: [
    {
      title: "Add your locations",
      body: "Search a city or country for you and your customers. For countries with multiple time zones, choose the right city or region.",
    },
    {
      title: "Find the shared hours",
      body: "Pick a date and meeting length. Adjust each location’s working hours and days. Green shows when everyone is working.",
    },
    {
      title: "Share a good time",
      body: "Select a suggested time, copy the local times, share the plan, or download a calendar event to send to your customer.",
    },
  ],
  faq: [
    {
      question: "Can I search by country instead of time zone?",
      answer:
        "Yes. Search by city, country name, or country code. A country with one time zone can be added directly. Countries with multiple time zones show a choice of cities or regions so you can pick the customer’s actual location.",
    },
    {
      question: "Does it handle daylight saving time?",
      answer:
        "Yes. Each location uses its named time zone and your browser’s time-zone rules for the date you choose. Offsets are recalculated when the date changes, including weeks when countries change clocks on different dates. Keep your browser and operating system up to date for recent rule changes.",
    },
    {
      question: "How is the overlap calculated?",
      answer:
        "The planner compares working hours for every location in 15-minute intervals. A suggested meeting fits only if the entire duration falls inside everyone’s working hours. The reference location determines the calendar day shown. Meetings may end on the following day.",
    },
    {
      question: "What if there is no shared time?",
      answer:
        "The planner says so instead of labeling an unsuitable time as available. Try another date, shorten the meeting, or edit the working hours. You can still select an off-hours time and see exactly whose schedule it falls outside.",
    },
    {
      question: "Can I change working hours and weekends?",
      answer:
        "Yes. Each location starts with 09:00–18:00, Monday through Friday. Edit the hours and working days for each location separately. Overnight shifts are supported; the working day is the day the shift starts. Holidays and personal calendar availability are not included.",
    },
    {
      question: "Is it free, and can I share the result?",
      answer:
        "It is free with no account, email, or API key required. Up to eight locations and their working hours are saved in your browser. A shared link includes the date, meeting duration, selected time, and location settings. Copying or downloading an event does not send invitations or book anyone’s calendar.",
    },
  ],
  facts: [
    { label: "Cost", value: "Free. No signup, email, or API key required." },
    {
      label: "Locations",
      value:
        "Up to eight cities, countries, or regions. Search uses a bundled GeoNames cities15000 catalog, country names, and time-zone mappings, licensed CC BY 4.0.",
    },
    {
      label: "Calculation",
      value:
        "Browser-based, using named IANA time zones through Intl. Quarter-hour precision, including half-hour and quarter-hour offsets, daylight saving, and overnight shifts.",
    },
    {
      label: "Storage",
      value:
        "Locations and settings are saved in localStorage. Share links encode the selected plan in the URL fragment.",
    },
    {
      label: "Availability",
      value:
        "Configured working hours only. No calendar, holiday, or free/busy integration.",
    },
  ],
};
