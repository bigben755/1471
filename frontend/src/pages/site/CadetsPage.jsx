import { Cadets } from "../../components/site/Cadets";
import { Seo } from "../../components/site/Seo";

export default function CadetsPage() {
  return (
    <div data-testid="cadets-page">
      <Seo
        title="Join as a Cadet | 1471 Horwich Squadron RAF Air Cadets"
        description="Thinking about joining near Horwich, Westhoughton, Adlington, Blackrod or Lostock? See your first month and how cadets progress through activities and skills."
      />
      <Cadets />
    </div>
  );
}
