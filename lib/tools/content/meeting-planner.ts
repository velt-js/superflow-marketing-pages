import type { ToolContent } from "./types";

export const MEETING_PLANNER_CONTENT: ToolContent = {
  slug: "meeting-planner",
  title: "Time Zone Converter & Meeting Planner",
  subhead:
    "Compare local times and find overlapping working hours for customer calls. A free World Time Buddy alternative: search cities or countries, pick a date, and share a time that works.",
  description:
    "Free time zone converter and meeting planner by city or country. Find overlapping working hours with this World Time Buddy alternative. No signup.",
  howItWorks: [
    {
      title: "Add your locations",
      body: "Your local time zone is detected automatically. Search a city or country to add your customers. For countries with multiple time zones, choose the right city or region.",
    },
    {
      title: "Find the shared hours",
      body: "Pick a date, then click and drag across the timeline to select a time range. Adjust each location’s working hours and days. Green shows when everyone is working.",
    },
    {
      title: "Share a good time",
      body: "Select a suggested time, copy the local times, share the plan, or download a calendar event to send to your customer.",
    },
  ],
  faq: [
    {
      question: "Is this a free World Time Buddy alternative?",
      answer:
        "Yes. Superflow's Time Zone Converter & Meeting Planner helps you compare cities and find a meeting time across time zones. Add up to eight locations without an account, see overlapping working hours, drag to select a meeting, and copy readable local times or share a plan. It is an independent tool from Superflow, not affiliated with World Time Buddy.",
    },
    {
      question: "How do I convert a meeting time between cities?",
      answer:
        "Add the cities or countries you want to compare, choose the meeting date, and select a time on the timeline. Each row shows that same moment in the location's local time. The selected meeting summary includes each city's date and time, including when the meeting falls on the next or previous day.",
    },
    {
      question: "Can an AI assistant find overlapping meeting times with MCP?",
      answer:
        "Yes. Connect to Superflow's free MCP server at https://usesuperflow.ai/api/mcp and use find_meeting_times with locations and a date. It returns time zones, shared working hours, suggested meeting times, readable copy text, and a plan link. The same calculation is available at POST /api/tools/meeting-planner. No API key is required.",
    },
    {
      question: "Can I search by country instead of time zone?",
      answer:
        "Yes. Search by city, country name, or country code. A country with one time zone can be added directly. Countries with multiple time zones show a choice of cities or regions so you can pick the customer’s actual location.",
    },
    {
      question: "How does automatic location detection work?",
      answer:
        "Your device supplies its time zone automatically, without a location permission prompt. When available, an approximate city from your network is shown if it matches that time zone. Otherwise the row is labeled Your location. Search for a city to correct it, or use Use my location to return to your local time. Saved custom locations and shared plans are preserved.",
    },
    {
      question: "Does it handle daylight saving time?",
      answer:
        "Yes. Each location uses its named time zone and your browser’s time-zone rules for the date you choose. Offsets are recalculated when the date changes, including weeks when countries change clocks on different dates. Keep your browser and operating system up to date for recent rule changes.",
    },
    {
      question: "How is the overlap calculated?",
      answer:
        "The planner compares working hours for every location in 15-minute intervals. A suggested meeting fits only if the entire duration falls inside everyone’s working hours. The location selected under “Show times in” determines the calendar day and time scale shown. Meetings may end on the following day.",
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
        "The browser and MCP/API share the same calculation engine, using named IANA time zones through Intl. Quarter-hour precision, including half-hour and quarter-hour offsets, daylight saving, and overnight shifts.",
    },
    {
      label: "Storage",
      value:
        "The browser saves locations and settings in localStorage. Share links encode the selected plan in the URL fragment. MCP/API calls send the supplied locations and schedule to the server for calculation; results are not stored by the application.",
    },
    {
      label: "Availability",
      value:
        "Configured working hours only. No calendar, holiday, or free/busy integration.",
    },
  ],
};
