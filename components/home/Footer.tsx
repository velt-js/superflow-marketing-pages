import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help Center", "Docs", "Community", "Status"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Security", "Cookies"],
  },
];

function SocialIcon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "currentColor" } as const;
  switch (name) {
    case "x":
      return (
        <svg {...common}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M23.5 6.5a3 3 0 00-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 00.5 6.5C.1 8.4.1 12 .1 12s0 3.6.4 5.5a3 3 0 002.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 002.1-2.1c.4-1.9.4-5.5.4-5.5s0-3.6-.4-5.5zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  return (
    <footer
      className="text-white"
      style={{ background: "#0a0a0a" }}
    >
      <div className="container-page max-w-[1200px] mx-auto px-6 lg:px-20 pt-[120px] pb-[80px]">
        <div className="flex flex-col gap-[80px]">
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            <div className="flex flex-col gap-6 max-w-[360px]">
              <div className="flex items-center gap-4">
                <Image src="/images/nav/logo.svg" alt="Superflow" width={24} height={24} />
                <div className="flex flex-col leading-none">
                  <span className="font-medium text-[18px]">Superflow</span>
                  <span className="text-[12px] text-white/50 mt-1">by Velt&nbsp;™</span>
                </div>
              </div>
              <p className="text-[14px] text-white/60 leading-[24px]">
                The collaboration platform for creative teams. Ship more creative assets impossibly fast.
              </p>
              <div className="flex items-center gap-3">
                {["x", "linkedin", "youtube"].map((name) => (
                  <a
                    key={name}
                    href={`#${name}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                    aria-label={name}
                  >
                    <SocialIcon name={name} />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
              {columns.map((col) => (
                <div key={col.title} className="flex flex-col gap-4">
                  <h4 className="text-[12px] uppercase tracking-[1.8px] font-medium text-white/50">
                    {col.title}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {col.links.map((label) => (
                      <li key={label}>
                        <Link
                          href={`#${label.toLowerCase()}`}
                          className="text-[14px] text-white/75 hover:text-white transition-colors"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[13px] text-white/50">
              © {new Date().getFullYear()} Superflow. All rights reserved.
            </p>
            <p className="text-[13px] text-white/50">Made with care, by Velt&nbsp;™</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
