import { Join } from "../../components/site/Join";
import { Seo } from "../../components/site/Seo";

export default function JoinPage() {
  return (
    <div data-testid="join-page">
      <Seo
        title="Join | 1471 Horwich Squadron RAF Air Cadets"
        description="Join 1471 Horwich Squadron RAF Air Cadets. Send an enquiry as a prospective cadet, a parent or carer, or an adult volunteer."
      />
      <Join />
    </div>
  );
}
