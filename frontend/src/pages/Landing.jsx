import { Header } from "../components/site/Header";
import { Hero } from "../components/site/Hero";
import { About } from "../components/site/About";
import { Activities } from "../components/site/Activities";
import { Cadets } from "../components/site/Cadets";
import { Parents } from "../components/site/Parents";
import { Volunteer } from "../components/site/Volunteer";
import { Qualifications } from "../components/site/Qualifications";
import { Join } from "../components/site/Join";
import { Faq } from "../components/site/Faq";
import { Footer } from "../components/site/Footer";
import { SeoSchema } from "../components/site/SeoSchema";

export default function Landing() {
  return (
    <div data-testid="landing-page">
      <SeoSchema />
      <Header />
      <main>
        <Hero />
        <About />
        <Activities />
        <Cadets />
        <Parents />
        <Volunteer />
        <Qualifications />
        <Join />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
