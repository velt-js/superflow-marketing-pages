interface EnterpriseItem {
  titleLead: string;
  titleAccent: string;
  accentColor: string;
  body: string;
  span: "half" | "full";
}

const items: EnterpriseItem[] = [
  {
    titleLead: "Endpoint",
    titleAccent: "protection",
    accentColor: "#4fd0ff",
    body: "All corporate devices are centrally managed with anti-malware and equipped with Mobile Device Management (MDM) for secure configuration, including disk encryption, screen locks, and software updates. Our security alerts are monitored 24/7/365.",
    span: "half",
  },
  {
    titleLead: "Security",
    titleAccent: "education",
    accentColor: "#ff80f9",
    body: "Superflow provides comprehensive security training to all employees upon onboarding and annually through educational modules with Vanta’s platform.",
    span: "half",
  },
  {
    titleLead: "Identity and",
    titleAccent: "access management",
    accentColor: "#f0ed41",
    body: "Secure and streamlined access with Google SSO. We use multi-factor authentication (MFA) and role-based access control, ensuring employees only have access to necessary applications. Access is automatically revoked upon termination.",
    span: "full",
  },
];

const HEADING_GRADIENT =
  "linear-gradient(90deg, rgb(82, 224, 255) 0%, rgb(41, 148, 255) 18%, rgb(0, 71, 255) 36%, rgb(80, 81, 255) 49%, rgb(161, 91, 255) 61%, rgb(214, 97, 255) 70%, rgb(255, 108, 178) 100%)";

export default function EnterpriseSecurity() {
  return (
    <section
      className="-mt-[60px] lg:-mt-[80px] pt-[120px] pb-[80px] lg:pt-[160px] lg:pb-[120px]"
      style={{ background: "#121212" }}
    >
      <div className="container-page max-w-[1080px] flex flex-col items-center gap-[52px]">
        <h2
          className="flex flex-wrap items-baseline justify-center gap-x-[12px] text-center"
          style={{
            fontFamily: "var(--font-urbanist)",
            fontWeight: 600,
            fontSize: "clamp(36px, 4.8vw, 52px)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "#fff" }}>Enterprise</span>
          <span
            style={{
              backgroundImage: HEADING_GRADIENT,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Security
          </span>
        </h2>

        <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {items.map((item) => (
            <div
              key={item.titleAccent}
              className={`rounded-[24px] px-[36px] py-[44px] lg:px-[52px] lg:py-[51px] flex flex-col gap-[8px] items-center ${
                item.span === "full" ? "md:col-span-2" : ""
              }`}
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <h3
                className="text-center text-white"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 600,
                  fontSize: 24,
                  lineHeight: "38.4px",
                }}
              >
                {item.titleLead}{" "}
                <span style={{ color: item.accentColor }}>{item.titleAccent}</span>
              </h3>
              <p
                className="text-center text-white"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "25.6px",
                  opacity: 0.75,
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <VendorSecurityCard />
      </div>
    </section>
  );
}

function VendorSecurityCard() {
  return (
    <div
      className="w-full max-w-[1200px] rounded-[32px] px-[40px] py-[48px] lg:px-[100px] lg:pt-[67px] lg:pb-[74px] flex flex-col gap-[52px]"
      style={{ background: "#171717" }}
    >
      <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[60px] lg:items-start lg:justify-between">
        <div className="flex flex-col gap-[8px] lg:max-w-[323px]">
          <h3
            style={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 600,
              fontSize: 28,
              lineHeight: "42px",
              letterSpacing: "-0.02em",
              color: "#fff",
            }}
          >
            Vendor <span style={{ color: "#ff63b6" }}>Security</span>
          </h3>
          <p
            style={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: "24px",
              color: "#fff",
              opacity: 0.75,
            }}
          >
            Superflow uses a risk-based approach to vendor security. Factors which influence the inherent risk rating of a vendor include:
          </p>
        </div>

        <ul
          className="list-disc pl-[20px] lg:max-w-[310px]"
          style={{
            fontFamily: "var(--font-urbanist)",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "32px",
            color: "#fff",
            opacity: 0.75,
          }}
        >
          <li>Access to customer and corporate data</li>
          <li>Integration with production environments</li>
          <li>Potential damage to the Superflow brand</li>
        </ul>
      </div>

      <p
        className="text-center mx-auto max-w-[800px]"
        style={{
          fontFamily: "var(--font-urbanist)",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "22.4px",
          color: "#fff",
          opacity: 0.3,
        }}
      >
        Once the inherent risk rating has been determined, the security of the vendor is evaluated in order to determine a residual risk rating and an approval decision for the vendor.
      </p>
    </div>
  );
}
