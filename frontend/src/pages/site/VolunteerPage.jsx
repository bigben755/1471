import { Volunteer } from "../../components/site/Volunteer";
import { Seo } from "../../components/site/Seo";

export default function VolunteerPage() {
  return (
    <div data-testid="volunteer-page">
      <Seo
        title="Volunteer | 1471 Horwich Squadron RAF Air Cadets"
        description="Become an adult volunteer with 1471 Horwich Squadron RAF Air Cadets. No military or aviation experience needed — uniformed and civilian roles available, with full induction and training."
      />
      <Volunteer />
    </div>
  );
}
