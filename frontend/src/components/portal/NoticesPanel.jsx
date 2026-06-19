import { useEffect, useState, useCallback } from "react";
import { api, ROLE_LABELS } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../ui/dialog";
import { Plus, Loader2, Trash2, Check, BellRing } from "lucide-react";

const AUDIENCES = ["cadet", "parent", "cfav"];

export const NoticesPanel = ({ canManage }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", roles: ["cadet"], requires_ack: false });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/notices"); setNotices(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleRole = (r) =>
    setForm((s) => ({ ...s, roles: s.roles.includes(r) ? s.roles.filter((x) => x !== r) : [...s.roles, r] }));

  const create = async () => {
    if (!form.title || !form.body || form.roles.length === 0) { toast.error("Title, message and at least one audience are required."); return; }
    setBusy(true);
    try {
      await api.post("/notices", form);
      toast.success("Notice posted.");
      setOpen(false);
      setForm({ title: "", body: "", roles: ["cadet"], requires_ack: false });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Could not post notice."); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    await api.delete(`/notices/${id}`);
    setNotices((n) => n.filter((x) => x.id !== id));
    toast.success("Notice deleted.");
  };

  const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

  return (
    <div>
      <PanelHeading
        title="Notices"
        intro={canManage ? "Post squadron notices to cadets, parents or staff." : "Squadron announcements and updates."}
        action={canManage && (
          <button data-testid="new-notice-button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
            <Plus size={18} /> New notice
          </button>
        )}
      />
      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : notices.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white">No notices yet.</div>
      ) : (
        <div className="space-y-3" data-testid="notices-list">
          {notices.map((n) => (
            <div key={n.id} data-testid={`notice-${n.id}`} className="bg-white border border-white p-5 border-l-4 border-l-raf-blue">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BellRing size={16} className="text-raf-blue" />
                  <h3 className="font-display font-bold text-raf-navy">{n.title}</h3>
                  {n.requires_ack && <span className="text-[10px] uppercase bg-raf-red text-white px-2 py-0.5">Must read</span>}
                  {!canManage && n.acknowledged && <span className="text-[10px] uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 flex items-center gap-1"><Check size={10} /> Read</span>}
                </div>
                {canManage && (
                  <button data-testid={`delete-notice-${n.id}`} onClick={() => remove(n.id)} className="text-raf-slate hover:text-raf-red"><Trash2 size={16} /></button>
                )}
              </div>
              <p className="mt-2 text-raf-slate leading-relaxed whitespace-pre-line text-sm">{n.body}</p>
              <div className="mt-3 text-xs text-raf-slate flex flex-wrap gap-2">
                <span>{new Date(n.created_at).toLocaleDateString("en-GB")}</span>
                {canManage && <span>&middot; To: {n.roles.map((r) => ROLE_LABELS[r]).join(", ")}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent data-testid="notice-form" className="max-w-lg rounded-none">
            <DialogHeader><DialogTitle className="font-display text-raf-navy">New notice</DialogTitle><DialogDescription className="sr-only">Create a squadron notice</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <input data-testid="notice-title" className={inp} placeholder="Notice title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea data-testid="notice-body" className={inp} rows={4} placeholder="Message" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              <div>
                <div className="text-xs text-raf-slate mb-2">Audience</div>
                <div className="flex gap-2 flex-wrap">
                  {AUDIENCES.map((r) => (
                    <button key={r} data-testid={`audience-${r}`} type="button" onClick={() => toggleRole(r)} className={`px-3 py-1.5 text-sm border ${form.roles.includes(r) ? "bg-raf-blue text-white border-raf-blue" : "bg-white text-raf-slate border-raf-sky"}`}>
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-raf-slate cursor-pointer">
                <input data-testid="notice-requires-ack" type="checkbox" checked={form.requires_ack} onChange={(e) => setForm({ ...form, requires_ack: e.target.checked })} className="w-4 h-4 accent-raf-blue" />
                Require acknowledgement at next sign in (push notice)
              </label>
            </div>
            <DialogFooter>
              <button data-testid="notice-submit" onClick={create} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60">
                {busy && <Loader2 className="animate-spin" size={16} />} Post notice
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
