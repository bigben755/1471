import { Join } from "../../components/site/Join";
import { Seo } from "../../components/site/Seo";

export default function JoinPage() {
  return (
    <div data-testid="join-page">
      <Seo
        title="Join | 1471 Horwich Squadron RAF Air Cadets"
        description="Join 1471 Horwich Squadron RAF Air Cadets through a simple enquiry process for cadets, parents and carers, adult volunteers and committee support, with clear next-step guidance."
      />
      <Join />
    </div>
  );
}
