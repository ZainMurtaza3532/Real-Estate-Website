import { CallToAction } from "@/sections/call-to-action";
import { Contact } from "@/sections/contact";
import { Gallery } from "@/sections/gallery";
import { HeroSection } from "@/sections/hero-sections";
import { Stats } from "@/sections/stats";
import { Testimonials } from "@/sections/testimonials";
import { WhyChooseUs } from "@/sections/why-choose-us";
import { JsonLd, getRealEstateAgentSchema } from "@/components/seo/JsonLd";

export default function Home() {
  const agentSchema = getRealEstateAgentSchema();

  return (
    <main>
      <JsonLd data={agentSchema} />
      <HeroSection />
      <Stats />
      <Gallery />
      <WhyChooseUs />
      <Testimonials />
      <CallToAction />
      <Contact />
    </main>
  );
}
