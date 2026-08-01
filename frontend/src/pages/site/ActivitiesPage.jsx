import { Activities } from "../../components/site/Activities";
import { Seo } from "../../components/site/Seo";

export default function ActivitiesPage() {
  return (
    <div data-testid="activities-page">
      <Seo
        title="Activities at 1471 Horwich Squadron RAF Air Cadets"
        description="Explore 1471 Horwich Squadron activities including flying, gliding, fieldcraft, DofE, first aid, leadership, camps, sport, STEM and RAF station visits."
      />
      <Activities />
    </div>
  );
}
