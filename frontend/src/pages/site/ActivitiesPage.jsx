import { Activities } from "../../components/site/Activities";
import { Seo } from "../../components/site/Seo";

export default function ActivitiesPage() {
  return (
    <div data-testid="activities-page">
      <Seo
        title="Activities | 1471 Horwich Squadron RAF Air Cadets"
        description="Explore the full 1471 Horwich Squadron activity programme: flying, gliding, adventure training, overseas camp, RAF station visits, airshows, awards, classification training, DofE, first aid, leadership, fieldcraft, sport, aviation studies and community events."
      />
      <Activities />
    </div>
  );
}
