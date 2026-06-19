import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { UserFormDialog } from "./UserFormDialog";
import { Loader2, Mail, Phone, Trash2, UserPlus, Inbox } from "lucide-react";

const STATUS = { new: "bg-raf-red text-white", read: "bg-raf-sky text-raf-blue", actioned: "bg-emerald-600 text-white" };

const roleFromType = (t) => {
  if (/cadet/i.test(t)) return "cadet";
  if (/parent|carer/i.test(t)) return "parent";
  if (/volunteer/i.test(t)) return "cfav";
  return "cadet";
};

export const EnquiriesPanel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [prefill, setPrefill] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/enquiries"); setItems(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try { await api.patch(`/enquiries/${id}`, { status }); setItems((l) => l.map((e) => e.id === id ? { ...e, status } : e)); }
    catch { toast.error("Could not update."); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    await api.delete(`/enquiries/${id}`); setItems((l) => l.filter((e) => e.id !== id)); toast.success("Deleted.");
  };

  const createAccount = (e) => {
    const [first, ...rest] = e.name.trim().split(" ");
    setPrefill({ email: e.email, first_name: first, last_name: rest.join(" "), role: roleFromType(e.enquiry_type) });
    setFormOpen(true);
  };

  const shown = items.filter((e) => filter === "all" || e.status === filter);

  return (
    <div>
      <PanelHeading title="Enquiries" intro="Website enquiries from prospective cadets, parents and volunteers. Create member accounts from here." />
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "new", "read", "actioned"].map((f) => (
          <button key={f} data-testid={`enq-filter-${f}`} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm capitalize transition-colors ${filter === f ? "bg-raf-blue text-white" : "bg-white text-raf-slate hover:text-raf-blue"}`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : shown.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white"><Inbox className="mx-auto mb-2 text-raf-sky" /> No enquiries.</div>
      ) : (
        <div className="space-y-3" data-testid="enquiries-list">
          {shown.map((e) => (
            <div key={e.id} data-testid={`enq-${e.id}`} className="bg-white border border-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-raf-navy">{e.name}</h3>
                    <span className={`text-[10px] uppercase px-2 py-0.5 ${STATUS[e.status]}`}>{e.status}</span>
                    <span className="text-xs px-2 py-0.5 bg-raf-sky text-raf-blue">{e.enquiry_type}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-raf-slate">
                    <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 hover:text-raf-blue"><Mail size={14} /> {e.email}</a>
                    {e.phone && <span className="inline-flex items-center gap-1"><Phone size={14} /> {e.phone}</span>}
                  </div>
                </div>
                <span className="text-xs text-raf-slate">{new Date(e.created_at).toLocaleDateString("en-GB")}</span>
              </div>
              <p className="mt-3 text-raf-slate text-sm bg-raf-sky/50 border-l-2 border-raf-blue p-3">{e.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button data-testid={`enq-create-${e.id}`} onClick={() => createAccount(e)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-raf-blue text-white hover:bg-raf-navy transition-colors"><UserPlus size={13} /> Create account</button>
                <button onClick={() => setStatus(e.id, "read")} className="px-3 py-2 text-xs bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors">Mark read</button>
                <button onClick={() => setStatus(e.id, "actioned")} className="px-3 py-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors">Mark actioned</button>
                <button onClick={() => remove(e.id)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => toast.success("Account ready — they can now sign in.")} prefill={prefill} />
    </div>
  );
};
