import { Cadets } from "../../components/site/Cadets";
import { Seo } from "../../components/site/Seo";

export default function CadetsPage() {
  return (
    <div data-testid="cadets-page">
      <Seo
        title="For Cadets | 1471 Horwich Squadron RAF Air Cadets"
        description="Thinking about joining as a cadet in Horwich? No experience needed. Learn about aviation, build confidence, develop leadership and work towards awards with 1471 Squadron."
      />
      <Cadets />
    </div>
  );
}
