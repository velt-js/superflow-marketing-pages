export default function RevenueShareBanner() {
  return (
    <section className="px-6 lg:px-12 pt-[80px] lg:pt-[120px]">
      <div className="mx-auto max-w-[900px] flex flex-col items-center gap-6 text-center">
        <h2
          className="font-semibold tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "#111",
            fontSize: "clamp(28px, 3.5vw, 44px)",
            lineHeight: "1.5",
          }}
        >
          We offer 30% revenue share for every user activation that results in payment within 30 days.
        </h2>

        <div
          className="inline-flex items-center gap-2 rounded-full"
          style={{
            background: "#fff5e6",
            color: "#7a5b1c",
            padding: "10px 20px",
            fontFamily: "var(--font-poppins)",
            fontSize: 14,
            lineHeight: "20px",
          }}
        >
          <span aria-hidden>💡</span>
          <span>A paid user is someone new who has subscribed to any one of our paid plans.</span>
        </div>
      </div>
    </section>
  );
}
