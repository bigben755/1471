import { useEffect, useState, useCallback } from "react";
import { api, ROLE_LABELS } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { UserFormDialog } from "./UserFormDialog";
import { Plus, Loader2, KeyRound, Trash2, Pencil, Check, X } from "lucide-react";

const ROLE_BADGE = {
  admin: "bg-raf-red text-white", cfav: "bg-raf-red/80 text-white",
  cadet: "bg-emerald-600 text-white", parent: "bg-raf-blue text-white",
};

export const ManageUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [bonusEdit, setBonusEdit] = useState({});

  const load = useCallback(async () => {
    try { const { data } = await api.get("/users"); setUsers(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const resetPw = async (u) => {
    const pw = window.prompt(`Set a new password for ${u.first_name} ${u.last_name}:`);
    if (!pw) return;
    if (pw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    try { await api.post(`/users/${u.id}/reset-password`, { new_password: pw }); toast.success("Password reset."); }
    catch { toast.error("Could not reset password."); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.first_name} ${u.last_name}?`)) return;
    try { await api.delete(`/users/${u.id}`); setUsers((l) => l.filter((x) => x.id !== u.id)); toast.success("Member removed."); }
    catch (err) { toast.error(err.response?.data?.detail || "Could not delete member."); }
  };

  const saveBonus = async (u) => {
    const val = Number(bonusEdit[u.id]);
    try {
      await api.patch(`/users/${u.id}`, { bonus_points: val });
      toast.success("Points updated.");
      setBonusEdit((b) => { const c = { ...b }; delete c[u.id]; return c; });
      load();
    } catch { toast.error("Could not update points."); }
  };

  const shown = users.filter((u) => filter === "all" || u.role === filter);

  return (
    <div>
      <PanelHeading
        title="Members"
        intro="Create accounts, assign profile types, link parents to cadets, reset passwords and adjust points."
        action={(
          <button data-testid="new-member-button" onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
            <Plus size={18} /> New member
          </button>
        )}
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "cadet", "parent", "cfav", "admin"].map((r) => (
          <button key={r} data-testid={`user-filter-${r}`} onClick={() => setFilter(r)} className={`px-4 py-2 text-sm capitalize transition-colors ${filter === r ? "bg-raf-blue text-white" : "bg-white text-raf-slate hover:text-raf-blue"}`}>
            {r === "all" ? "All" : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : (
        <div className="space-y-3" data-testid="users-list">
          {shown.map((u) => (
            <div key={u.id} data-testid={`user-${u.id}`} className="bg-white border border-white p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-raf-navy">{u.first_name} {u.last_name}</span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                  {u.role === "parent" && <span className="text-xs text-raf-slate">{(u.child_ids || []).length} linked cadet(s)</span>}
                </div>
                <div className="text-xs text-raf-slate mt-1">{u.email}</div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {u.role === "cadet" && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-raf-slate">Total {u.stats?.points ?? 0} pts</span>
                    {bonusEdit[u.id] !== undefined ? (
                      <>
                        <input data-testid={`bonus-input-${u.id}`} type="number" value={bonusEdit[u.id]} onChange={(e) => setBonusEdit((b) => ({ ...b, [u.id]: e.target.value }))} className="w-16 border border-raf-sky px-2 py-1" />
                        <button data-testid={`bonus-save-${u.id}`} onClick={() => saveBonus(u)} className="p-1.5 bg-emerald-600 text-white"><Check size={14} /></button>
                        <button onClick={() => setBonusEdit((b) => { const c = { ...b }; delete c[u.id]; return c; })} className="p-1.5 bg-raf-sky text-raf-slate"><X size={14} /></button>
                      </>
                    ) : (
                      <button data-testid={`edit-bonus-${u.id}`} onClick={() => setBonusEdit((b) => ({ ...b, [u.id]: u.bonus_points ?? 0 }))} className="px-2 py-1 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors">Bonus {u.bonus_points ?? 0}</button>
                    )}
                  </div>
                )}
                <button data-testid={`edit-user-${u.id}`} onClick={() => { setEditing(u); setFormOpen(true); }} className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="Edit"><Pencil size={15} /></button>
                <button data-testid={`reset-pw-${u.id}`} onClick={() => resetPw(u)} className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white transition-colors" title="Reset password"><KeyRound size={15} /></button>
                {u.role !== "admin" && <button data-testid={`delete-user-${u.id}`} onClick={() => remove(u)} className="p-2 bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors" title="Delete"><Trash2 size={15} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} editing={editing} />
    </div>
  );
};
