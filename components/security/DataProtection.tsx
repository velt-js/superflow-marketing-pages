interface ProtectionItem {
  title: string;
  body: string;
  icon: React.ReactNode;
}

function ServerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M7.99753 12.2264C7.99753 13.7878 9.68307 15.2848 12.684 16.3888C15.6831 17.4937 19.7538 18.1132 23.9972 18.1132C28.2415 18.1132 32.3105 17.4928 35.3114 16.3888C38.3114 15.2848 39.9978 13.7878 39.9978 12.2264M7.99753 12.2264C7.99753 10.665 9.68307 9.16798 12.684 8.06398C15.6831 6.95907 19.7538 6.3396 23.9972 6.3396C28.2415 6.3396 32.3105 6.95998 35.3114 8.06398C38.3114 9.16798 39.9978 10.665 39.9978 12.2264M7.99753 12.2264V24M39.9978 12.2264V24M7.99753 24C7.99753 25.5613 9.68307 27.0584 12.684 28.1624C15.6831 29.2673 19.7538 29.8868 23.9972 29.8868C28.2415 29.8868 32.3105 29.2664 35.3114 28.1624C38.3114 27.0584 39.9978 25.5613 39.9978 24M7.99753 24V35.7736C7.99753 37.3349 9.68307 38.832 12.684 39.936C15.6831 41.0409 19.7538 41.6604 23.9972 41.6604C28.2415 41.6604 32.3105 41.04 35.3114 39.936C38.3114 38.832 39.9978 37.3349 39.9978 35.7736V24"
        stroke="#58CFFF"
        strokeWidth="3.42873"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="44" height="48" viewBox="0 0 44 48" fill="none" aria-hidden>
      <path
        d="M21.9975 24.1513C21.5112 24.1513 21.0448 23.9446 20.7009 23.5765C20.357 23.2085 20.1638 22.7093 20.1638 22.1888C20.1638 21.6683 20.357 21.1691 20.7009 20.801C21.0448 20.433 21.5112 20.2262 21.9975 20.2262C22.4838 20.2262 22.9502 20.433 23.294 20.801C23.6379 21.1691 23.8311 21.6683 23.8311 22.1888C23.8311 22.7093 23.6379 23.2085 23.294 23.5765C22.9502 23.9446 22.4838 24.1513 21.9975 24.1513ZM21.9975 24.1513V29.0564M22.0025 6.49097C26.285 10.5462 31.8743 12.6576 37.5861 12.3778C38.4175 15.4056 38.6717 18.5814 38.3338 21.7164C37.9959 24.8515 37.0726 27.8819 35.619 30.6276C34.1653 33.3732 32.2109 35.7781 29.8717 37.6994C27.5326 39.6207 24.8565 41.0192 22.0025 41.8117C19.1484 41.0194 16.4722 39.6211 14.133 37.6998C11.7938 35.7786 9.8393 33.3736 8.38566 30.6279C6.93203 27.8821 6.00892 24.8516 5.6712 21.7165C5.33349 18.5813 5.58805 15.4055 6.41977 12.3778C12.1314 12.6574 17.7203 10.546 22.0025 6.49097Z"
        stroke="#F8D377"
        strokeWidth="3.28276"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TransitIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M12 17.9621C12 21.0846 13.2643 24.0793 15.5147 26.2872C17.7652 28.4952 20.8174 29.7356 24 29.7356M24 29.7356C27.1826 29.7356 30.2348 28.4952 32.4853 26.2872C34.7357 24.0793 36 21.0846 36 17.9621C36 14.8395 34.7357 11.8449 32.4853 9.63688C30.2348 7.4289 27.1826 6.18848 24 6.18848C20.8174 6.18848 17.7652 7.4289 15.5147 9.63688C13.2643 11.8449 12 14.8395 12 17.9621M12 17.9621H36M24 29.7356C26.6658 29.0827 27.9997 25.1584 27.9997 17.9621C27.9997 10.7666 26.6658 6.84236 24 6.18848M24 29.7356C21.3342 29.0827 20.0003 25.1584 20.0003 17.9621C20.0003 10.7666 21.3342 6.84236 24 6.18848M24 29.7356V35.6224M27.9997 39.5476C27.9997 40.5883 27.5783 41.5865 26.8282 42.3224C26.0781 43.0584 25.0608 43.4718 24 43.4718C22.9392 43.4718 21.9219 43.0584 21.1718 42.3224C20.4217 41.5865 20.0003 40.5883 20.0003 39.5476C20.0002 39.0322 20.1036 38.5218 20.3045 38.0456C20.5054 37.5693 20.8 37.1366 21.1715 36.7721C21.5429 36.4076 21.9838 36.1185 22.4692 35.9212C22.9545 35.724 23.4747 35.6224 24 35.6224C24.5253 35.6224 25.0455 35.724 25.5308 35.9212C26.0162 36.1185 26.4571 36.4076 26.8285 36.7721C27.2 37.1366 27.4946 37.5693 27.6955 38.0456C27.8964 38.5218 27.9998 39.0322 27.9997 39.5476ZM6 39.5476H20.0003M27.9997 39.5476H42"
        stroke="#80E1AB"
        strokeWidth="3.42873"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const items: ProtectionItem[] = [
  {
    title: "Data at Rest",
    body: "Customer data is fully encrypted. Even before it reaches our databases, it's encrypted at rest, ensuring maximum security against both physical and logical access attempts.",
    icon: <ServerIcon />,
  },
  {
    title: "Secret Management",
    body: "Application secrets are encrypted and stored securely via Google Secrets Manager and access to these values is strictly limited.",
    icon: <ShieldIcon />,
  },
  {
    title: "Data in transit",
    body: "Superflow uses TLS 1.2 or higher everywhere data is transmitted over potentially insecure networks.",
    icon: <TransitIcon />,
  },
];

const PROTECTION_GRADIENT =
  "linear-gradient(101.1deg, rgb(46, 154, 255) 0%, rgb(133, 129, 255) 29.28%, rgb(255, 108, 196) 65.77%, rgb(255, 173, 98) 100%)";

export default function DataProtection() {
  return (
    <section
      className="bg-white pt-[80px] pb-[80px] lg:pt-[133px] lg:pb-[133px] rounded-bl-[32px] rounded-br-[32px] lg:rounded-bl-[80px] lg:rounded-br-[80px]"
    >
      <div className="container-page max-w-[1080px] flex flex-col items-center gap-[60px] lg:gap-[80px]">
        <h2
          className="text-center font-semibold flex flex-wrap items-center justify-center gap-x-[12px]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(36px, 5.5vw, 60px)",
            lineHeight: 1.3,
            letterSpacing: "-0.03em",
          }}
        >
          <span style={{ color: "#111" }}>Data</span>
          <span
            style={{
              backgroundImage: PROTECTION_GRADIENT,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Protection
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] w-full max-w-[1000px]">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] p-[40px] flex flex-col items-center gap-[16px] min-h-[220px]"
              style={{ background: "#fafafa" }}
            >
              <div className="flex items-center justify-center h-[48px]">{item.icon}</div>
              <div className="flex flex-col items-center gap-[8px] w-full">
                <h3
                  className="text-center"
                  style={{
                    fontFamily: "var(--font-urbanist)",
                    fontWeight: 600,
                    fontSize: 20,
                    lineHeight: "32px",
                    color: "#111",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-center"
                  style={{
                    fontFamily: "var(--font-urbanist)",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "22.4px",
                    color: "#111",
                    opacity: 0.75,
                  }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
