import { CallToAction } from "@/sections/call-to-action";
import { Contact } from "@/sections/contact";
import { FaqSection } from "@/sections/faq-section";
import { Gallery } from "@/sections/gallery";
import { HeroSection } from "@/sections/hero-sections";
import { Stats } from "@/sections/stats";
import { Testimonials } from "@/sections/testimonials";
import { TrustStrip } from "@/components/trust-strip";
import { WhyChooseUs } from "@/sections/why-choose-us";
import { JsonLd, getRealEstateAgentSchema } from "@/components/seo/JsonLd";

export default function Home() {
  const agentSchema = getRealEstateAgentSchema();

  return (
    <main id="main-content">
      <JsonLd data={agentSchema} />
      <HeroSection />
      <TrustStrip />
      <Stats />
      <Gallery />
      <WhyChooseUs />
      <Testimonials />
      <CallToAction />
      <FaqSection />
      <Contact />
    </main>
  );
}
