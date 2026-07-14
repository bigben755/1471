import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { UserFormDialog } from "./UserFormDialog";
import { Loader2, Mail, Phone, UserPlus, Clock, CheckCircle2, CalendarClock } from "lucide-react";

const BUCKETS = [
  { key: "now", label: "Can join now", icon: CheckCircle2, tone: "text-emerald-700", bar: "bg-emerald-600" },
  { key: "september", label: "Eligible in September", icon: CalendarClock, tone: "text-amber-700", bar: "bg-amber-500" },
  { key: "future", label: "Eligible in the future", icon: Clock, tone: "text-raf-blue", bar: "bg-raf-blue" },
];

export const RecruitmentPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prefill, setPrefill] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/enquiries/tracker"); setData(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const createAccount = (e) => {
    const [first, ...rest] = e.name.trim().split(" ");
    setPrefill({ email: e.email, first_name: first, last_name: rest.join(" "), role: "cadet" });
    setFormOpen(true);
  };

  if (loading) return <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>;

  const counts = data?.counts || {};
  return (
    <div>
      <PanelHeading title="Recruitment tracker" intro="Prospective cadets from the website, grouped by when they can join. Based on the Join form details." />

      <div className="grid gap-5 lg:grid-cols-3">
        {BUCKETS.map((b) => {
          const list = data?.buckets?.[b.key] || [];
          return (
            <div key={b.key} data-testid={`bucket-${b.key}`} className="bg-white border border-white">
              <div className={`h-1 ${b.bar}`} />
              <div className="p-4 border-b border-raf-sky flex items-center gap-2">
                <b.icon size={18} className={b.tone} />
                <h3 className="font-display font-bold text-raf-navy">{b.label}</h3>
                <span data-testid={`bucket-count-${b.key}`} className="ml-auto text-sm font-bold text-raf-slate">{counts[b.key] ?? 0}</span>
              </div>
              <div className="p-4 space-y-3 min-h-[120px]">
                {list.length === 0 ? (
                  <p className="text-xs text-raf-slate text-center py-6">No enquiries here.</p>
                ) : list.map((e) => (
                  <div key={e.id} data-testid={`prospect-${e.id}`} className="border border-raf-sky p-3">
                    <div className="font-semibold text-raf-navy text-sm">{e.name}</div>
                    <div className="text-xs text-raf-slate mt-1">{e.age_band_label}</div>
                    <div className="mt-2 flex flex-col gap-1 text-xs text-raf-slate">
                      <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 hover:text-raf-blue"><Mail size={12} /> {e.email}</a>
                      {e.phone && <span className="inline-flex items-center gap-1"><Phone size={12} /> {e.phone}</span>}
                      {e.dob && <span>DoB: {new Date(e.dob).toLocaleDateString("en-GB")}</span>}
                    </div>
                    <button data-testid={`prospect-create-${e.id}`} onClick={() => createAccount(e)} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-raf-blue text-white hover:bg-raf-navy transition-colors">
                      <UserPlus size={12} /> Create cadet account
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => toast.success("Cadet account ready — they can now sign in.")} prefill={prefill} />
    </div>
  );
};
