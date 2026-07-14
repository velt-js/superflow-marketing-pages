import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SIGNUP_URL } from "@/lib/use-case-types";
import styles from "./TestimonialsSection.module.css";

/** Assets exported from Figma node 582:5677. */
const ASSET_BASE = "/images/home-2026/testimonial";
const FEATURED_PHOTO_SRC = `${ASSET_BASE}/featured-wonderist.png`;

/** Section CTA pairing — mirrors the global footer (secondary + primary). */
const BOOK_DEMO_HREF = "/book-demo";
const SECONDARY_CTA_LABEL = "Book Demo";
const PRIMARY_CTA_LABEL = "Start Free";

/**
 * 07 / Testimonial — 2026 homepage redesign.
 *
 * Left column pairs a serif headline with a divided list of agency metrics
 * and stays pinned (position: sticky) while the right column scrolls.
 * Right column stacks one featured (image-backed) testimonial above a set of
 * data-driven compact testimonial cards. All content mirrors the Figma copy.
 */

type MetricIconName = "clock" | "message" | "calendar" | "folder";

interface AgencyMetric {
  id: string;
  icon: MetricIconName;
  /** Accent color sampled from the Figma icon stroke. */
  color: string;
  value: string;
  label: string;
}

interface FeaturedStat {
  value: string;
  label: string;
}

interface FeaturedTestimonial {
  company: string;
  heading: string;
  body: string;
  stats: FeaturedStat[];
}

interface Testimonial {
  id: string;
  company: string;
  quote: string;
  /** Person the quote is attributed to, shown beneath the quote as
      "{name} @{company}". */
  name: string;
  /** Card background tint, matched to the Figma per-card wash. */
  tint: string;
  /** Company logo exported from Figma, plus its natural pixel dimensions. */
  logoSrc: string;
  logoWidth: number;
  logoHeight: number;
  /** Rendered logo height in px. Tuned per-logo so the marks read at the same
      optical size despite different intrinsic aspect ratios. */
  logoDisplayHeight: number;
}

const AGENCY_METRICS: AgencyMetric[] = [
  {
    id: "hours",
    icon: "clock",
    color: "#2a44d7",
    value: "182 Hours",
    label: "back every month",
  },
  {
    id: "rounds",
    icon: "message",
    color: "#dc7713",
    value: "3 fewer rounds",
    label: "of feedback",
  },
  {
    id: "days",
    icon: "calendar",
    color: "#d30cb2",
    value: "4 Days",
    label: "to approval",
  },
  {
    id: "projects",
    icon: "folder",
    color: "#11ba60",
    value: "61 Projects",
    label: "shipped every month",
  },
];

const FEATURED_TESTIMONIAL: FeaturedTestimonial = {
  company: "Wonderist",
  heading: "47 hours back a month, every month",
  body: "Wonderist runs every client site through Superflow before it ships. Their senior designers stopped doing first-pass QA by hand.",
  stats: [
    { value: "47 hrs", label: "back every mo" },
    { value: "3 Fewer", label: "Feedback Rounds" },
    { value: "3 Days", label: "to approval" },
  ],
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "writesonic",
    company: "Writesonic",
    quote: "Empowers non-tech users like me.",
    name: "Manvi Agarwal",
    tint: "rgba(255, 103, 25, 0.06)",
    logoSrc: `${ASSET_BASE}/logo-writesonic.svg`,
    logoWidth: 131,
    logoHeight: 17,
    logoDisplayHeight: 16,
  },
  {
    id: "headway",
    company: "Headway",
    quote: "Everybody has loved how easy it is to get started.",
    name: "Riley Hennigh",
    tint: "rgba(49, 170, 183, 0.06)",
    logoSrc: `${ASSET_BASE}/logo-headway.svg`,
    logoWidth: 105,
    logoHeight: 33,
    logoDisplayHeight: 30,
  },
  {
    id: "harvey",
    company: "Harvey",
    quote: "Clear, Simple & Saves time for everyone involved.",
    name: "Simon Smallchua",
    tint: "rgba(30, 30, 31, 0.05)",
    logoSrc: `${ASSET_BASE}/logo-harvey.webp`,
    logoWidth: 300,
    logoHeight: 116,
    logoDisplayHeight: 30,
  },
];

/** Stroke paths for the metric icons (24x24 grid, tabler-style line icons). */
const METRIC_ICON_PATHS: Record<MetricIconName, ReactNode> = {
  clock: (
    <>
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  message: (
    <>
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
      <path d="M12 12v.01" />
      <path d="M8 12v.01" />
      <path d="M16 12v.01" />
    </>
  ),
  calendar: (
    <>
      <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M4 11h16" />
      <path d="M8 15h2v2h-2z" />
    </>
  ),
  folder: (
    <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
  ),
};

/**
 * Renders a single-color line icon used beside an agency metric.
 * @param name - Which metric glyph to draw.
 * @param color - Stroke color for the glyph.
 */
function TestimonialsSectionMetricIcon({
  name,
  color,
}: {
  name: MetricIconName;
  color: string;
}) {
  return (
    <svg
      className={styles.metricIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {METRIC_ICON_PATHS[name]}
    </svg>
  );
}

/**
 * Decorative winking-face badge shown above the section headline.
 * Exact vector exported from Figma (tabler mood-wink-2, 582:5713): a single
 * gradient-stroked outline path with the original drop/inner shadow filter.
 */
function TestimonialsSectionBadge() {
  return (
    <svg
      className={styles.badge}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <g filter="url(#tsWinkShadow)">
        <path
          d="M22.5006 25H22.4756M36.25 37.5C35.4353 38.3315 34.4629 38.9921 33.3897 39.443C32.3165 39.894 31.1641 40.1263 30 40.1263C28.8359 40.1263 27.6835 39.894 26.6103 39.443C25.5371 38.9921 24.5647 38.3315 23.75 37.5M38.75 21.25L35 25L38.75 28.75M30 52.5C27.0453 52.5 24.1194 51.918 21.3896 50.7873C18.6598 49.6566 16.1794 47.9992 14.0901 45.9099C12.0008 43.8206 10.3434 41.3402 9.21271 38.6104C8.08198 35.8806 7.5 32.9547 7.5 30C7.5 27.0453 8.08198 24.1194 9.21271 21.3896C10.3434 18.6598 12.0008 16.1794 14.0901 14.0901C16.1794 12.0008 18.6598 10.3434 21.3896 9.21271C24.1194 8.08198 27.0453 7.5 30 7.5C35.9674 7.5 41.6903 9.87053 45.9099 14.0901C50.1295 18.3097 52.5 24.0326 52.5 30C52.5 35.9674 50.1295 41.6903 45.9099 45.9099C41.6903 50.1295 35.9674 52.5 30 52.5Z"
          stroke="url(#tsWinkGradient)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        {/* Region widened from the Figma export (was ~2.7px of slack) so the
            blur fades out fully instead of clipping to a hard edge. */}
        <filter
          id="tsWinkShadow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2.4" dy="2.4" />
          <feGaussianBlur stdDeviation="4.8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="4.8" dy="4.8" />
          <feGaussianBlur stdDeviation="2.4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2.4" dy="-2.4" />
          <feGaussianBlur stdDeviation="2.4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow"
            result="effect3_innerShadow"
          />
        </filter>
        <linearGradient
          id="tsWinkGradient"
          x1="14.7275"
          y1="7.5"
          x2="34.9464"
          y2="56.7401"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#35D98F" />
          <stop offset="1" stopColor="#0F7C39" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Wonderist wordmark shown on the featured testimonial card. Inline vector
 * (white fill, exported from Figma node 582:5748) so it stays crisp on the
 * dark photo scrim rather than relying on a raster PNG.
 * @param className - Class applied to the root svg for sizing and placement.
 */
function WonderistLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="158"
      height="34"
      viewBox="0 0 158 34"
      fill="none"
      role="img"
      aria-label={`${FEATURED_TESTIMONIAL.company} logo`}
    >
      <g clipPath="url(#wonderistLogoClip)">
        <path d="M17.0722 34C13.6956 34 10.3949 33.003 7.5874 31.135C4.77989 29.267 2.5917 26.612 1.29955 23.5056C0.00739719 20.3993 -0.330689 16.9811 0.328045 13.6835C0.986779 10.3858 2.61275 7.35669 5.00034 4.97919C7.38792 2.6017 10.4299 0.982607 13.7416 0.326658C17.0533 -0.329291 20.4859 0.00736591 23.6054 1.29406C26.725 2.58075 29.3913 4.75968 31.2672 7.55531C33.1431 10.3509 34.1444 13.6377 34.1444 17C34.141 21.5077 32.3413 25.8297 29.1404 29.0171C25.9394 32.2045 21.599 33.9967 17.0722 34ZM17.0722 0.762424C13.8449 0.761178 10.6897 1.7131 8.00583 3.49776C5.32193 5.28243 3.22989 7.81965 1.99435 10.7885C0.758809 13.7573 0.435288 17.0243 1.06471 20.1762C1.69413 23.3282 3.24822 26.2234 5.53038 28.4957C7.81253 30.768 10.7202 32.3152 13.8856 32.9417C17.051 33.5681 20.3319 33.2457 23.3132 32.0151C26.2945 30.7845 28.8423 28.701 30.6342 26.0283C32.4262 23.3556 33.3819 20.2137 33.3803 17C33.3757 12.6939 31.6563 8.56546 28.5991 5.52002C25.5419 2.47458 21.3965 0.760802 17.0722 0.754548V0.762424Z" fill="white" />
        <path d="M31.4191 17.4272L27.2491 16.3135V17.235H25.3445L25.2227 17.6178H27.2491V18.5393L31.4191 17.4272Z" fill="white" />
        <path d="M3.40234 18.7895H6.7592L6.81931 18.7202L7.93299 17.6191H4.59828L3.40234 18.7895Z" fill="white" />
        <path d="M6.74971 16.1084H3.40234L4.59828 17.2395H7.93299C7.49677 16.9083 7.09979 16.5289 6.74971 16.1084Z" fill="white" />
        <path d="M13.5818 17.2344H7.9375V17.6172H13.4426L13.5818 17.2344Z" fill="white" />
        <path d="M23.3126 17.2344H15.5517L15.4141 17.6172H23.1908L23.3126 17.2344Z" fill="white" />
        <path d="M7.80477 10.0693H7.28906L9.32975 16.542H9.8423L7.80477 10.0693Z" fill="white" />
        <path d="M17.3035 10.1859L17.2466 10.0693H16.8812L12.0326 23.5014L10.4048 18.3267H9.89062L12.0025 25.031L17.0726 10.9846L19.0785 16.542H19.5989L17.3035 10.1859Z" fill="white" />
        <path d="M26.854 10.0693H26.3415L22.1098 23.5014L20.2431 18.3267H19.7227L22.143 25.031L26.854 10.0693Z" fill="white" />
        <path d="M61.1947 8.54869L58.6225 25.5739C58.6225 25.5896 58.613 25.6007 58.6114 25.6148C58.6152 25.716 58.5808 25.8149 58.5149 25.8921C58.4624 25.9463 58.3991 25.9892 58.3292 26.0179C58.2592 26.0466 58.184 26.0606 58.1084 26.0591C57.7382 26.0795 57.5863 25.8826 57.5547 25.681L54.4209 17.9576L51.2839 25.6763C51.2555 25.8779 51.102 26.0748 50.7334 26.0543C50.6578 26.0557 50.5827 26.0416 50.5127 26.0129C50.4428 25.9842 50.3795 25.9414 50.3269 25.8874C50.261 25.8102 50.2266 25.7113 50.2304 25.6101C50.2304 25.5959 50.2193 25.5849 50.2193 25.5692L47.6439 8.54869C47.6265 8.47557 47.6296 8.39907 47.6531 8.32763C47.6765 8.25619 47.7193 8.19259 47.7768 8.14385C47.866 8.05672 47.9842 8.00516 48.109 7.99893C48.1822 7.98018 48.2588 7.97838 48.3328 7.99367C48.4069 8.00896 48.4764 8.04094 48.5361 8.08714C48.5904 8.12407 48.6357 8.1727 48.6685 8.22942C48.7014 8.28614 48.721 8.34949 48.7259 8.41479L51.0292 23.4709L53.9147 16.3288C53.952 16.2263 54.0195 16.1375 54.1085 16.074C54.1974 16.0104 54.3036 15.9752 54.413 15.9728H54.4209C54.5303 15.9752 54.6365 16.0104 54.7254 16.074C54.8143 16.1375 54.8819 16.2263 54.9192 16.3288L57.8094 23.4709L60.1158 8.41479C60.1213 8.34872 60.142 8.2848 60.1763 8.22798C60.2106 8.17116 60.2576 8.12296 60.3136 8.08714C60.373 8.04096 60.4423 8.00899 60.516 7.9937C60.5898 7.9784 60.6661 7.98019 60.7391 7.99893C60.8644 8.00521 60.983 8.05673 61.0729 8.14385C61.1274 8.19453 61.1674 8.25872 61.1888 8.32986C61.2102 8.40099 61.2123 8.47651 61.1947 8.54869Z" fill="white" />
        <path d="M87.2088 25.5425C87.2088 25.7694 87.0649 26.0151 86.6599 26.0151C86.5833 26.0207 86.5063 26.0105 86.4339 25.985C86.3615 25.9595 86.2951 25.9193 86.2391 25.867C86.2217 25.8465 84.1826 21.7714 82.2336 17.849V17.838L78.668 10.6912V25.5299C78.668 25.752 78.5303 26.0025 78.1444 26.0104H78.1238C77.6255 25.993 77.5859 25.637 77.5859 25.5299V8.42438C77.5859 8.19597 77.7299 7.95181 78.1317 7.95181C78.2083 7.94626 78.2852 7.95655 78.3576 7.98203C78.4301 8.00751 78.4964 8.04764 78.5525 8.09988C78.5778 8.12509 81.7749 14.5426 84.0086 19.0258L86.1284 23.2679V8.43541C86.1284 8.2133 86.2644 7.97071 86.652 7.96284H86.6694C87.1708 7.98174 87.2088 8.33617 87.2088 8.43541V25.5425Z" fill="white" />
        <path d="M99.1201 10.6941C99.3104 11.1483 99.4031 11.6371 99.3922 12.1291V21.8767C99.4054 22.3699 99.3126 22.8603 99.1201 23.3149C98.9574 23.6825 98.7182 24.0115 98.4182 24.2801C98.1182 24.5487 97.7643 24.7507 97.38 24.8728C96.9971 24.9953 96.5973 25.0575 96.1951 25.0571H92.8114V8.94714H96.1856C96.5883 8.94502 96.9886 9.00888 97.3705 9.13617C97.7459 9.26152 98.0946 9.45543 98.3988 9.70798C98.7111 9.97802 98.9578 10.3152 99.1201 10.6941ZM100.446 12.1275C100.436 10.7681 99.9538 9.69223 99.0125 8.92508C98.6258 8.61059 98.1838 8.37024 97.709 8.21623C97.2192 8.05473 96.7064 7.97282 96.1904 7.97364H92.3067C91.9018 7.97364 91.7578 8.21623 91.7578 8.44621V25.5502C91.7578 25.6573 91.7958 26.0102 92.3067 26.0306H96.1856C96.7016 26.0314 97.2144 25.9495 97.7043 25.788C98.176 25.6349 98.6153 25.3961 98.9999 25.0839C99.949 24.3483 100.441 23.2692 100.441 21.8767L100.446 12.1275Z" fill="white" />
        <path d="M110.971 17.5783C111.373 17.5783 111.517 17.8225 111.517 18.0509C111.517 18.366 111.306 18.5566 110.971 18.5566H105.899V25.0607H112.646C112.723 25.0567 112.799 25.0687 112.87 25.0958C112.942 25.1229 113.007 25.1646 113.061 25.2182C113.104 25.2664 113.137 25.3228 113.157 25.384C113.178 25.4453 113.185 25.51 113.179 25.5743C113.179 25.7838 113.042 26.0264 112.656 26.0468H105.379C104.983 26.0311 104.844 25.7885 104.844 25.5664V8.46714C104.841 8.40021 104.852 8.33338 104.877 8.2711C104.902 8.20881 104.94 8.15248 104.988 8.10586C105.036 8.05923 105.094 8.02337 105.157 8.00065C105.221 7.97793 105.288 7.96888 105.355 7.97409H112.646C112.723 7.97008 112.799 7.98203 112.87 8.00916C112.942 8.03629 113.007 8.078 113.061 8.13161C113.104 8.17956 113.136 8.23572 113.157 8.29665C113.177 8.35759 113.185 8.42203 113.179 8.48604C113.179 8.69712 113.042 8.94128 112.656 8.95861H105.899V17.5894L110.971 17.5783Z" fill="white" />
        <path d="M123.045 17.2098C122.727 17.4092 122.361 17.5182 121.985 17.5248H118.211V8.97915H121.985C122.358 8.98568 122.721 9.09471 123.035 9.2942C123.422 9.5363 123.76 9.84831 124.032 10.2141C124.344 10.6454 124.583 11.1242 124.741 11.6319C124.91 12.1611 124.997 12.7131 124.997 13.2685C124.995 13.8161 124.909 14.3602 124.741 14.8816C124.583 15.3893 124.344 15.8681 124.032 16.2993C123.767 16.6651 123.431 16.9746 123.045 17.2098ZM126.745 25.5381L126.737 25.4735C126.721 25.4236 126.701 25.3746 126.679 25.327L123.129 18.3077C123.842 17.9883 124.458 17.4873 124.915 16.8554C125.665 15.8059 126.072 14.5518 126.081 13.2638C126.079 12.6111 125.975 11.9627 125.772 11.342C125.581 10.7335 125.291 10.16 124.915 9.6439C124.558 9.14554 124.097 8.73011 123.564 8.42624C123.082 8.15159 122.537 8.00562 121.982 8.0025H117.665C117.599 7.99431 117.532 8.00063 117.469 8.021C117.406 8.04137 117.348 8.07531 117.3 8.12039C117.251 8.16548 117.213 8.22062 117.189 8.28191C117.164 8.3432 117.153 8.40915 117.157 8.47507V25.5349C117.157 25.8185 117.347 26.0075 117.671 26.0075C118.07 25.9933 118.211 25.7492 118.211 25.5349V18.5283H121.985C122.02 18.5283 122.051 18.5283 122.083 18.5283L125.722 25.7476C125.773 25.8309 125.845 25.8992 125.932 25.9454C126.018 25.9916 126.115 26.0141 126.214 26.0107H126.381L126.435 25.9823C126.541 25.9298 126.627 25.8455 126.682 25.7413C126.723 25.6813 126.745 25.6106 126.745 25.5381Z" fill="white" />
        <path d="M131.246 26.0306H131.225C130.727 26.0101 130.688 25.6573 130.688 25.5501V8.44145C130.688 8.21619 130.833 7.96887 131.235 7.96887C131.312 7.96397 131.39 7.97548 131.462 8.00263C131.535 8.02979 131.601 8.07198 131.656 8.1264C131.697 8.1707 131.729 8.22321 131.748 8.28048C131.768 8.33776 131.775 8.39851 131.77 8.45877V25.5501C131.774 25.7722 131.632 26.0148 131.246 26.0306Z" fill="white" />
        <path d="M143.966 25.325C143.521 25.63 143.029 25.8595 142.509 26.004C141.936 26.1657 141.342 26.2463 140.747 26.2434C140.241 26.2371 139.737 26.1844 139.241 26.0859C138.641 25.9708 138.077 25.7172 137.594 25.3455C136.608 24.5925 136.11 23.4977 136.11 22.0879C136.107 22.0211 136.118 21.9544 136.143 21.8923C136.167 21.8301 136.205 21.7739 136.253 21.7273C136.301 21.6807 136.359 21.6448 136.422 21.6219C136.485 21.5991 136.552 21.5899 136.619 21.5949C136.687 21.5872 136.755 21.5936 136.82 21.6137C136.885 21.6338 136.945 21.6671 136.996 21.7116C137.047 21.7561 137.089 21.8107 137.117 21.872C137.146 21.9332 137.162 21.9998 137.163 22.0674C137.163 22.8046 137.296 23.3812 137.557 23.8002C137.795 24.1924 138.125 24.5211 138.519 24.7579C138.886 24.9724 139.29 25.1147 139.71 25.177C140.053 25.231 140.399 25.2621 140.747 25.2699C141.212 25.2688 141.676 25.2096 142.128 25.0935C142.562 24.9853 142.973 24.8013 143.342 24.55C143.698 24.2989 143.988 23.966 144.187 23.5797C144.413 23.1155 144.522 22.6034 144.504 22.0879C144.518 21.4746 144.402 20.8651 144.162 20.3C143.934 19.7934 143.623 19.3277 143.243 18.9217C142.855 18.5046 142.417 18.1374 141.938 17.8285L138.968 15.9382C138.505 15.6358 138.073 15.2897 137.676 14.9048C136.814 14.0006 136.38 12.9846 136.38 11.8788V11.4991C136.386 11.2392 136.422 10.9807 136.486 10.7288C136.574 10.4076 136.691 10.0954 136.838 9.7963C137.019 9.42709 137.27 9.09605 137.576 8.82123C138.344 8.10607 139.421 7.74219 140.773 7.74219C142.151 7.74219 143.216 8.10764 143.937 8.82753C144.223 9.11655 144.445 9.46147 144.589 9.84041C144.706 10.1533 144.791 10.4767 144.845 10.806C144.891 11.0659 144.906 11.3303 144.89 11.5937C144.871 11.7669 144.864 11.8662 144.861 11.8914C144.796 12.2379 144.578 12.3939 144.249 12.3403C144.172 12.3339 144.098 12.3112 144.031 12.2737C143.963 12.2362 143.905 12.1848 143.86 12.1229C143.829 12.0719 143.809 12.0152 143.8 11.9562C143.792 11.8972 143.795 11.8371 143.811 11.7795L143.822 11.5432C143.829 11.3449 143.821 11.1463 143.796 10.9494C143.764 10.6981 143.698 10.4523 143.6 10.2185C143.49 9.95315 143.329 9.71182 143.126 9.50803C142.637 8.98978 141.846 8.72829 140.77 8.72829C139.695 8.72829 138.888 8.99293 138.345 9.51591C138.12 9.71834 137.939 9.96439 137.814 10.2389C137.701 10.4876 137.612 10.7459 137.546 11.0108C137.498 11.2037 137.47 11.4012 137.464 11.6V11.8599C137.454 12.3138 137.551 12.7636 137.747 13.1736C137.946 13.5704 138.206 13.9339 138.518 14.2511C138.858 14.5972 139.233 14.9071 139.638 15.1757L140.996 16.0469C141.531 16.3698 142.071 16.7148 142.589 17.0676C143.121 17.4261 143.611 17.8407 144.053 18.3042C145.031 19.3207 145.572 20.677 145.562 22.0848C145.562 23.471 145.024 24.5579 143.966 25.325Z" fill="white" />
        <path d="M157.454 8.97888H153.449V25.5347C153.443 25.6688 153.386 25.7956 153.289 25.8889C153.192 25.9823 153.063 26.0351 152.928 26.0365C152.793 26.0379 152.663 25.9878 152.564 25.8965C152.465 25.8052 152.406 25.6796 152.397 25.5457V8.97888H148.309C147.912 8.97888 147.754 8.71109 147.754 8.46693C147.754 8.22276 147.898 7.99435 148.303 7.99435H157.448C157.851 7.99435 157.995 8.23537 157.995 8.46693C157.995 8.69849 157.858 8.97888 157.454 8.97888Z" fill="white" />
        <path d="M68.8162 26.2659C66.4434 26.2659 64.5039 24.5111 64.5039 22.3546V11.5721C64.5039 9.41557 66.4386 7.65918 68.8162 7.65918C71.1939 7.65918 73.1302 9.41557 73.1302 11.5721V22.3546C73.1223 24.5111 71.1891 26.2659 68.8162 26.2659ZM68.8162 8.70829C67.0192 8.70829 65.5575 9.99369 65.5575 11.5721V22.3546C65.5575 23.9298 67.0192 25.2168 68.8162 25.2168C70.6133 25.2168 72.0766 23.933 72.0766 22.3546V11.5721C72.0687 9.99369 70.6054 8.70829 68.8162 8.70829Z" fill="white" />
      </g>
      <defs>
        <clipPath id="wonderistLogoClip">
          <rect width="158" height="34" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * Reusable compact testimonial card showing the company logo, quote and role.
 * @param testimonial - Quote, role, company, logo and background tint to render.
 */
function TestimonialsSectionCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure
      className={styles.card}
      style={{ "--testimonial-tint": testimonial?.tint } as CSSProperties}
    >
      <Image
        className={styles.cardLogo}
        src={testimonial.logoSrc}
        alt={`${testimonial?.company} logo`}
        width={testimonial.logoWidth}
        height={testimonial.logoHeight}
        style={{ height: testimonial?.logoDisplayHeight }}
      />
      <blockquote className={styles.cardQuote}>{testimonial?.quote}</blockquote>
      <figcaption className={styles.cardPerson}>
        {testimonial?.name} @{testimonial?.company}
      </figcaption>
    </figure>
  );
}

/**
 * Full "07 / Testimonial" section for the 2026 homepage preview.
 * Composes the metrics column and the featured + compact testimonials column.
 */
export default function TestimonialsSection() {
  return (
    <section
      className={styles.section}
      data-section="testimonials"
      aria-labelledby="testimonials-heading"
    >
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.intro}>
            <TestimonialsSectionBadge />
            <h2 id="testimonials-heading" className={styles.heading}>
              Real agencies.
              <br />
              Real hours back.
            </h2>
            <ul className={styles.metrics}>
              {AGENCY_METRICS.map((metric) => (
                <li key={metric?.id} className={styles.metric}>
                  <span className={styles.metricValueGroup}>
                    <TestimonialsSectionMetricIcon
                      name={metric.icon}
                      color={metric.color}
                    />
                    <span className={styles.metricValue}>{metric?.value}</span>
                  </span>
                  <span className={styles.metricLabel}>{metric?.label}</span>
                </li>
              ))}
            </ul>

            <div className={styles.ctaButtons}>
              <Link
                href={BOOK_DEMO_HREF}
                className={`${styles.btn} ${styles.btnOutline}`}
              >
                {SECONDARY_CTA_LABEL}
              </Link>
              <Link
                href={SIGNUP_URL}
                className={`${styles.btn} ${styles.btnFilled}`}
              >
                {PRIMARY_CTA_LABEL}
              </Link>
            </div>
          </div>

          <div className={styles.showcase}>
            <figure className={styles.featured}>
              <Image
                className={styles.featuredPhoto}
                src={FEATURED_PHOTO_SRC}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              <span className={styles.featuredScrim} aria-hidden="true" />
              <WonderistLogo className={styles.featuredLogo} />
              <div className={styles.featuredContent}>
                <blockquote className={styles.featuredText}>
                  <p className={styles.featuredHeading}>
                    {FEATURED_TESTIMONIAL.heading}
                  </p>
                  <p className={styles.featuredBody}>
                    {FEATURED_TESTIMONIAL.body}
                  </p>
                </blockquote>
                <div className={styles.featuredStats}>
                  {FEATURED_TESTIMONIAL.stats.map((stat) => (
                    <div key={stat?.label} className={styles.featuredStat}>
                      <span className={styles.featuredStatValue}>
                        {stat?.value}
                      </span>
                      <span className={styles.featuredStatLabel}>
                        {stat?.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </figure>

            {TESTIMONIALS.map((testimonial) => (
              <TestimonialsSectionCard
                key={testimonial?.id}
                testimonial={testimonial}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
