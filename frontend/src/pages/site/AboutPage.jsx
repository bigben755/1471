import { About } from "../../components/site/About";
import { Qualifications } from "../../components/site/Qualifications";
import { Seo } from "../../components/site/Seo";

export default function AboutPage() {
  return (
    <div data-testid="about-page" className="pt-2">
      <Seo
        title="About | 1471 Horwich Squadron RAF Air Cadets"
        description="1471 Horwich Squadron is part of the Royal Air Force Air Cadets, with a structured pathway from joining and early training to progression, leadership, adventure and recognised achievements."
      />
      <About />
      <Qualifications />
    </div>
  );
}
