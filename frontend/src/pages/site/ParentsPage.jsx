import { Parents } from "../../components/site/Parents";
import { Seo } from "../../components/site/Seo";

export default function ParentsPage() {
  return (
    <div data-testid="parents-page">
      <Seo
        title="Parents and Carers | 1471 Horwich Squadron RAF Air Cadets"
        description="Guidance for parents and carers on joining steps, parade structure, safeguarding context, communication and opportunities at 1471 Horwich Squadron."
      />
      <Parents />
    </div>
  );
}
