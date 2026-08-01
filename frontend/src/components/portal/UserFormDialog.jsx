import { useEffect, useState } from "react";
import { api, ROLE_LABELS } from "../../api";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "../ui/dialog";
import { Loader2 } from "lucide-react";

const ROLES = ["cadet", "parent", "cfav", "admin"];

export function UserFormDialog({ open, onClose, onSaved, editing, prefill }) {
  const [form, setForm] = useState({
    email: "", first_name: "", last_name: "", role: "cadet", is_uniformed: true, password: "", child_ids: [],
    dofe_level: "", dofe_status: "", btech_pathway: "", btech_status: "", badges: "",
  });
  const [cadets, setCadets] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        email: editing.email,
        first_name: editing.first_name,
        last_name: editing.last_name,
        role: editing.role,
        is_uniformed: editing.is_uniformed ?? true,
        password: "",
        child_ids: editing.child_ids || [],
        dofe_level: editing.dofe_level || "",
        dofe_status: editing.dofe_status || "",
        btech_pathway: editing.btech_pathway || "",
        btech_status: editing.btech_status || "",
        badges: (editing.major_badges || []).join(", "),
      });
    } else if (prefill) {
      setForm({
        email: prefill.email || "",
        first_name: prefill.first_name || "",
        last_name: prefill.last_name || "",
        role: prefill.role || "cadet",
        is_uniformed: true,
        password: "",
        child_ids: [],
        dofe_level: "",
        dofe_status: "",
        btech_pathway: "",
        btech_status: "",
        badges: "",
      });
    } else {
      setForm({
        email: "",
        first_name: "",
        last_name: "",
        role: "cadet",
        is_uniformed: true,
        password: "",
        child_ids: [],
        dofe_level: "",
        dofe_status: "",
        btech_pathway: "",
        btech_status: "",
        badges: "",
      });
    }
    api.get("/users", { params: { role: "cadet" } }).then(({ data }) => setCadets(data)).catch(() => {});
  }, [open, editing, prefill]);

  const f = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const toggleChild = (id) => setForm((s) => ({ ...s, child_ids: s.child_ids.includes(id) ? s.child_ids.filter((x) => x !== id) : [...s.child_ids, id] }));

  const save = async () => {
    if (!form.email || !form.first_name) { toast.error("Email and first name are required."); return; }
    if (!editing && form.password.length < 6) { toast.error("Set a password of at least 6 characters."); return; }
    setBusy(true);
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, {
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
          is_uniformed: form.role === "cfav" ? !!form.is_uniformed : null,
          child_ids: form.role === "parent" ? form.child_ids : [],
          dofe_level: form.role === "cadet" ? form.dofe_level || null : null,
          dofe_status: form.role === "cadet" ? form.dofe_status || null : null,
          btech_pathway: form.role === "cadet" ? form.btech_pathway || null : null,
          btech_status: form.role === "cadet" ? form.btech_status || null : null,
          major_badges: form.role === "cadet" ? form.badges.split(",").map((x) => x.trim()).filter(Boolean) : [],
        });
        toast.success("Member updated.");
      } else {
        await api.post("/users", {
          ...form,
          is_uniformed: form.role === "cfav" ? !!form.is_uniformed : null,
          child_ids: form.role === "parent" ? form.child_ids : [],
          dofe_level: form.role === "cadet" ? form.dofe_level || null : null,
          dofe_status: form.role === "cadet" ? form.dofe_status || null : null,
          btech_pathway: form.role === "cadet" ? form.btech_pathway || null : null,
          btech_status: form.role === "cadet" ? form.btech_status || null : null,
          major_badges: form.role === "cadet" ? form.badges.split(",").map((x) => x.trim()).filter(Boolean) : [],
        });
        toast.success("Member account created.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save member.");
    } finally { setBusy(false); }
  };

  const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="user-form" className="max-w-md max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader><DialogTitle className="font-display text-raf-navy">{editing ? "Edit member" : "New member account"}</DialogTitle><DialogDescription className="sr-only">Member account form</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <input data-testid="user-email" className={inp} placeholder="Email" type="email" value={form.email} disabled={!!editing} onChange={(e) => f("email", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input data-testid="user-firstname" className={inp} placeholder="First name" value={form.first_name} onChange={(e) => f("first_name", e.target.value)} />
            <input className={inp} placeholder="Last name" value={form.last_name} onChange={(e) => f("last_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-raf-slate">Profile type</label>
            <select data-testid="user-role" className={inp} value={form.role} onChange={(e) => f("role", e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          {form.role === "cfav" && (
            <label className="flex items-center gap-2 text-sm text-raf-slate">
              <input type="checkbox" checked={!!form.is_uniformed} onChange={(e) => f("is_uniformed", e.target.checked)} className="w-4 h-4 accent-raf-blue" />
              Uniformed CFAV
            </label>
          )}
          {!editing && (
            <input data-testid="user-password" className={inp} placeholder="Temporary password" value={form.password} onChange={(e) => f("password", e.target.value)} />
          )}
          {form.role === "parent" && (
            <div>
              <div className="text-xs text-raf-slate mb-2">Link to cadet(s)</div>
              <div className="max-h-36 overflow-y-auto border border-raf-sky p-2 space-y-1">
                {cadets.length === 0 ? <p className="text-xs text-raf-slate">No cadets yet.</p> : cadets.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.child_ids.includes(c.id)} onChange={() => toggleChild(c.id)} className="w-4 h-4 accent-raf-blue" />
                    {c.first_name} {c.last_name}
                  </label>
                ))}
              </div>
            </div>
          )}
          {form.role === "cadet" && (
            <div className="space-y-2 border border-raf-sky p-3">
              <div className="text-xs text-raf-slate">Cadet development profile</div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="DofE level (e.g. Bronze)" value={form.dofe_level} onChange={(e) => f("dofe_level", e.target.value)} />
                <input className={inp} placeholder="DofE status (e.g. In progress)" value={form.dofe_status} onChange={(e) => f("dofe_status", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="BTech pathway" value={form.btech_pathway} onChange={(e) => f("btech_pathway", e.target.value)} />
                <input className={inp} placeholder="BTech status" value={form.btech_status} onChange={(e) => f("btech_status", e.target.value)} />
              </div>
              <input className={inp} placeholder="Major badges (comma separated)" value={form.badges} onChange={(e) => f("badges", e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <button data-testid="user-save" onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60">
            {busy && <Loader2 className="animate-spin" size={16} />} {editing ? "Save changes" : "Create account"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
