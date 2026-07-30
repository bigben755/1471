import { Parents } from "../../components/site/Parents";
import { Seo } from "../../components/site/Seo";

export default function ParentsPage() {
  return (
    <div data-testid="parents-page">
      <Seo
        title="For Parents & Carers | 1471 Horwich Squadron RAF Air Cadets"
        description="Information for parents and carers about RAF Air Cadets in Horwich, including joining steps, structure, supervision, safeguarding context, communication and the wider opportunities cadets can access."
      />
      <Parents />
    </div>
  );
}
