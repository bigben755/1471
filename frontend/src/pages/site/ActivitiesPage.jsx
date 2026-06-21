import { Activities } from "../../components/site/Activities";
import { Seo } from "../../components/site/Seo";

export default function ActivitiesPage() {
  return (
    <div data-testid="activities-page">
      <Seo
        title="Activities | 1471 Horwich Squadron RAF Air Cadets"
        description="Flying, gliding, adventure training, Duke of Edinburgh's Award, first aid, leadership, fieldcraft, sport, camps and aviation studies with 1471 Horwich Squadron RAF Air Cadets."
      />
      <Activities />
    </div>
  );
}
