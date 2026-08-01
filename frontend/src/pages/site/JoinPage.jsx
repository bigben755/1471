import { Join } from "../../components/site/Join";
import { Seo } from "../../components/site/Seo";

export default function JoinPage() {
  return (
    <div data-testid="join-page">
      <Seo
        title="Join 1471 Horwich Squadron RAF Air Cadets in Horwich"
        description="Start your enquiry with 1471 Horwich Squadron for cadets aged 12 to 17, parents and carers, or adult volunteers, with clear next steps and no experience needed."
      />
      <Join />
    </div>
  );
}
