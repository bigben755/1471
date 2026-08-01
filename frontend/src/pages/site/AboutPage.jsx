import { About } from "../../components/site/About";
import { Qualifications } from "../../components/site/Qualifications";
import { Seo } from "../../components/site/Seo";

export default function AboutPage() {
  return (
    <div data-testid="about-page" className="pt-2">
      <Seo
        title="About 1471 Horwich Squadron RAF Air Cadets | Horwich"
        description="Learn about 1471 Horwich Squadron RAF Air Cadets, our values, parade structure and progression from first parade night to leadership and achievements."
      />
      <About />
      <Qualifications />
    </div>
  );
}
