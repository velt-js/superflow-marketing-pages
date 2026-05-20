import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import IntegrationHero from "./IntegrationHero";
import IntegrationOverview from "./IntegrationOverview";
import type { IntegrationDetailConfig } from "@/lib/detail-data";

export default function IntegrationDetailPage({
  config,
}: {
  config: IntegrationDetailConfig;
}) {
  return (
    <main>
      <Nav />
      <IntegrationHero
        hero={config.hero}
        otherIntegrations={config.otherIntegrations}
      />
      <div style={{ background: "#0a0a0a" }}>
        <IntegrationOverview overview={config.overview} steps={config.steps} />
      </div>
      <Footer />
      <IntercomButton />
    </main>
  );
}
