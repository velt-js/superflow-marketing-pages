import { PortableTextRenderer } from "@/components/PortableText";
import type { ChecklistEndNote as EndNote } from "@/lib/checklist-types";

export default function ChecklistEndNote({ endNote }: { endNote: EndNote }) {
  if (!endNote.title && !endNote.description) return null;
  return (
    <section className="relative bg-white py-[80px] lg:py-[120px]">
      <div className="container-page mx-auto max-w-[920px]">
        {endNote.title && (
          <h2
            className="text-center text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "clamp(28px, 3.6vw, 42px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {endNote.title}
          </h2>
        )}
        {endNote.description && (
          <div
            className="mt-[40px] [&_p]:text-black/70! [&_p]:mb-6! [&_p]:leading-[1.7]! [&_strong]:text-black! [&_li]:text-black/70! [&_a]:text-[#625DF5]! [&_a]:underline"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 17,
            }}
          >
            <PortableTextRenderer value={endNote.description} />
          </div>
        )}
      </div>
    </section>
  );
}
