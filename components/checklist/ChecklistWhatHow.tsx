import type { ChecklistDoc } from "@/lib/checklist-types";

function Block({ title, body }: { title?: string; body?: string }) {
  if (!title && !body) return null;
  return (
    <div className="flex flex-col items-center text-center">
      {title && (
        <h3
          className="text-[#111]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: "clamp(28px, 3.4vw, 38px)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>
      )}
      {body && (
        <p
          className="mt-[20px] max-w-[760px]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 17,
            lineHeight: 1.6,
            color: "rgba(17,17,17,0.6)",
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}

export default function ChecklistWhatHow({ doc }: { doc: ChecklistDoc }) {
  const hasWhat = doc.whatTitle || doc.whatDescription;
  const hasHow = doc.howTitle || doc.howDescription;
  if (!hasWhat && !hasHow) return null;

  return (
    <section className="bg-white py-[80px] lg:py-[120px]">
      <div className="container-page flex flex-col items-center gap-[96px] lg:gap-[140px]">
        <Block title={doc.whatTitle} body={doc.whatDescription} />
        <Block title={doc.howTitle} body={doc.howDescription} />
      </div>
    </section>
  );
}
