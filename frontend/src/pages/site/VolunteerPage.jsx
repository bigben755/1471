import { Volunteer } from "../../components/site/Volunteer";
import { Seo } from "../../components/site/Seo";

export default function VolunteerPage() {
  return (
    <div data-testid="volunteer-page">
      <Seo
        title="Volunteer with 1471 Horwich Squadron RAF Air Cadets"
        description="Support young people as a uniformed volunteer, civilian instructor or committee member at 1471 Horwich Squadron, with clear induction and ongoing development."
      />
      <Volunteer />
    </div>
  );
}
