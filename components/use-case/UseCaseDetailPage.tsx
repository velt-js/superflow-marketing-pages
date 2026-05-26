import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import CustomerLoveCarousel from "@/components/home/CustomerLoveCarousel";
import UseCaseHero from "./UseCaseHero";
import UseCaseProblem from "./UseCaseProblem";
import UseCaseSolution from "./UseCaseSolution";
import UseCaseFeatureBanner from "./UseCaseFeatureBanner";
import UseCaseRelated from "./UseCaseRelated";
import type {
  UseCaseDoc,
  UseCaseRelatedItem,
} from "@/lib/use-case-types";

export default function UseCaseDetailPage({
  doc,
  related,
}: {
  doc: UseCaseDoc;
  related: UseCaseRelatedItem[];
}) {
  const faqItems = (doc.faq ?? []).map((item) => ({
    q: item.question,
    a: item.answer ?? "",
  }));

  return (
    <main>
      <Nav />
      <UseCaseHero doc={doc} />
      {doc.problemSection && (
        <UseCaseProblem
          section={doc.problemSection}
          explanationTitle={doc.explanationTitle}
        />
      )}
      {doc.solutionSection && <UseCaseSolution section={doc.solutionSection} />}
      {/* Save 100 hours banner — hidden per design request, kept in DOM for SEO */}
      <div className="hidden">
        <UseCaseFeatureBanner doc={doc} />
      </div>
      {related.length > 0 && <UseCaseRelated items={related} />}
      <CustomerLoveCarousel />
      <DarkSection faqItems={faqItems.length > 0 ? faqItems : undefined} />
      <Footer />
      <IntercomButton />
    </main>
  );
}
