import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import IntegrationHero from "./IntegrationHero";
import IntegrationOverview from "./IntegrationOverview";
import type {
  IntegrationDoc,
  OtherIntegrationItem,
} from "@/lib/integration-types";

export default function IntegrationDetailPage({
  doc,
  otherIntegrations,
}: {
  doc: IntegrationDoc;
  otherIntegrations: OtherIntegrationItem[];
}) {
  return (
    <main>
      <Nav />
      <IntegrationHero doc={doc} otherIntegrations={otherIntegrations} />
      <div style={{ background: "#0a0a0a" }}>
        <IntegrationOverview doc={doc} />
      </div>
      <Footer />
      <IntercomButton />
    </main>
  );
}
