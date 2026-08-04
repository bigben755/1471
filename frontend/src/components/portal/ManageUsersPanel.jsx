import { useEffect, useState, useCallback, useRef } from "react";
import { api, ROLE_LABELS } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { UserFormDialog } from "./UserFormDialog";
import { Plus, Loader2, KeyRound, Trash2, Pencil, Check, X, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ROLE_BADGE = {
  admin: "bg-raf-red text-white", cfav: "bg-raf-red/80 text-white",
  cadet: "bg-emerald-600 text-white", parent: "bg-raf-blue text-white",
};

const APPOINTMENT_FIELDS = [
  ["training_officer", "Training Officer"],
  ["adjutant", "Adjutant"],
  ["stores_officer", "Stores Officer"],
  ["community_officer", "Community Officer"],
  ["health_safety_officer", "Health & Safety Officer"],
  ["shooting_officer", "Shooting Officer"],
  ["stem_officer", "STEM Officer"],
  ["oc", "OC"],
  ["deputy_oc", "Deputy OC"],
  ["leadership_officer", "Leadership Officer"],
  ["sports_officer", "Sports Officer"],
  ["sqn_wo", "Sqn WO"],
  ["dofe_officer", "DofE Officer"],
  ["adventure_training_officer", "Adventure Training Officer"],
  ["fieldcraft_officer", "Fieldcraft Officer"],
  ["cyber_officer", "Cyber Officer"],
  ["space_officer", "Space Officer"],
];

export const ManageUsersPanel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [bonusEdit, setBonusEdit] = useState({});
  const [importRoleHint, setImportRoleHint] = useState("cadet");
  const [importResult, setImportResult] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const importRef = useRef(null);
  const [appointments, setAppointments] = useState({
    training_officer: "",
    adjutant: "",
    stores_officer: "",
    community_officer: "",
    health_safety_officer: "",
    shooting_officer: "",
    stem_officer: "",
    oc: "",
    deputy_oc: "",
    leadership_officer: "",
    sports_officer: "",
    sqn_wo: "",
    dofe_officer: "",
    adventure_training_officer: "",
    fieldcraft_officer: "",
    cyber_officer: "",
    space_officer: "",
  });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
      if (isAdmin) {
        const { data: a } = await api.get("/appointments");
        setAppointments({
          training_officer: a.training_officer?.id || "",
          adjutant: a.adjutant?.id || "",
          stores_officer: a.stores_officer?.id || "",
          community_officer: a.community_officer?.id || "",
          health_safety_officer: a.health_safety_officer?.id || "",
          shooting_officer: a.shooting_officer?.id || "",
          stem_officer: a.stem_officer?.id || "",
          oc: a.oc?.id || "",
          deputy_oc: a.deputy_oc?.id || "",
          leadership_officer: a.leadership_officer?.id || "",
          sports_officer: a.sports_officer?.id || "",
          sqn_wo: a.sqn_wo?.id || "",
          dofe_officer: a.dofe_officer?.id || "",
          adventure_training_officer: a.adventure_training_officer?.id || "",
          fieldcraft_officer: a.fieldcraft_officer?.id || "",
          cyber_officer: a.cyber_officer?.id || "",
          space_officer: a.space_officer?.id || "",
        });
      }
    }
    finally { setLoading(false); }
  }, [isAdmin]);
  useEffect(() => { load(); }, [load]);

  const resetPw = async (u) => {
    if (u.role === "cadet") {
      const ok = window.confirm(
        `Reset ${u.first_name} ${u.last_name} to the standard cadet password (Squadron123!)?`,
      );
      if (!ok) return;
      try {
        await api.post(`/users/${u.id}/reset-cadet-password`);
        toast.success("Cadet password reset to Squadron123!", {
          description: "Cadet must change this password after signing in.",
        });
      } catch (err) {
        toast.error(err.response?.data?.detail || "Could not reset cadet password.");
      }
      return;
    }
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

  const shown = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "cfav_uniformed") return u.role === "cfav" && !!u.is_uniformed;
    if (filter === "cfav_non_uniformed") return u.role === "cfav" && !u.is_uniformed;
    return u.role === filter;
  });

  const staffOptions = users.filter((u) => u.role === "admin" || u.role === "cfav");

  const saveAppointments = async () => {
    try {
      await api.put("/appointments", appointments);
      toast.success("Officer appointments updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update appointments.");
    }
  };

  const uploadBulk = async (file) => {
    if (!file) return;
    setImportBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("role_hint", importRoleHint);
      const { data } = await api.post("/users/import-upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(data);
      toast.success(`${data.created} account(s) created.`, {
        description: `${data.skipped} skipped, ${data.errors} with issues.`,
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not import members.");
    } finally {
      setImportBusy(false);
      if (importRef.current) importRef.current.value = "";
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = async (format) => {
    try {
      const { data } = await api.get("/users/import-template", {
        params: { format, role: importRoleHint },
        responseType: "blob",
      });
      downloadBlob(data, `member-import-template-${importRoleHint}.${format === "xlsx" ? "xlsx" : "docx"}`);
      toast.success("Template downloaded.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not download template.");
    }
  };

  const downloadQr = async () => {
    try {
      const { data } = await api.get("/users/register-qr", {
        params: { role: importRoleHint },
        responseType: "blob",
      });
      downloadBlob(data, `register-${importRoleHint}-qr.png`);
      toast.success("QR code downloaded.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not download QR code.");
    }
  };

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

      <div className="bg-white border border-white p-4 mb-5" data-testid="bulk-register-panel">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-raf-slate">Role hint</label>
            <select
              value={importRoleHint}
              onChange={(e) => setImportRoleHint(e.target.value)}
              className="block border border-raf-sky px-3 py-2 text-sm outline-none focus:border-raf-blue"
            >
              <option value="cadet">Cadet</option>
              <option value="cfav">CFAV</option>
            </select>
          </div>

          <input
            ref={importRef}
            type="file"
            accept=".xlsx,.xls,.csv,.docx"
            className="hidden"
            onChange={(e) => uploadBulk(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={importBusy}
            onClick={() => importRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-raf-blue text-raf-blue hover:bg-raf-blue hover:text-white transition-colors disabled:opacity-60"
          >
            {importBusy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Import Excel/CSV/Word
          </button>
          <button
            type="button"
            onClick={() => downloadTemplate("xlsx")}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-raf-sky text-raf-navy hover:border-raf-blue transition-colors"
          >
            Download Excel template
          </button>
          <button
            type="button"
            onClick={() => downloadTemplate("docx")}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-raf-sky text-raf-navy hover:border-raf-blue transition-colors"
          >
            Download Word template
          </button>
          <button
            type="button"
            onClick={downloadQr}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-red text-white hover:bg-[#A00926] transition-colors"
          >
            Download {importRoleHint.toUpperCase()} QR
          </button>
        </div>
        <p className="text-xs text-raf-slate mt-2">
          Upload .xlsx, .xls, .csv or .docx containing first name, surname, and optional role/email/uniformed columns.
        </p>
        {importResult && (
          <div className="mt-3 text-xs text-raf-slate">
            Created: <strong className="text-raf-navy">{importResult.created}</strong>
            {" · "}
            Skipped: <strong className="text-raf-navy">{importResult.skipped}</strong>
            {" · "}
            Errors: <strong className="text-raf-navy">{importResult.errors}</strong>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "cadet", "parent", "cfav", "cfav_uniformed", "cfav_non_uniformed", "admin"].map((r) => (
          <button key={r} data-testid={`user-filter-${r}`} onClick={() => setFilter(r)} className={`px-4 py-2 text-sm capitalize transition-colors ${filter === r ? "bg-raf-blue text-white" : "bg-white text-raf-slate hover:text-raf-blue"}`}>
            {r === "all" ? "All" : r === "cfav_uniformed" ? "CFAV (uniformed)" : r === "cfav_non_uniformed" ? "CFAV (non-uniformed)" : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="bg-white border border-white p-4 mb-5" data-testid="appointments-panel">
          <h3 className="font-display font-bold text-raf-navy mb-3">Officer appointments</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {APPOINTMENT_FIELDS.map(([k, label]) => (
              <div key={k}>
                <label className="text-xs text-raf-slate">{label}</label>
                <select className="w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm" value={appointments[k]} onChange={(e) => setAppointments((a) => ({ ...a, [k]: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} {s.role === "cfav" ? (s.is_uniformed ? "(CFAV U)" : "(CFAV NU)") : "(Admin)"}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button onClick={saveAppointments} className="mt-3 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors">Save appointments</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : (
        <div className="space-y-3" data-testid="users-list">
          {shown.map((u) => (
            <div key={u.id} data-testid={`user-${u.id}`} className="bg-white border border-white p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-raf-navy">{u.first_name} {u.last_name}</span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 ${ROLE_BADGE[u.role]}`}>{u.role === "cfav" ? (u.is_uniformed ? "CFAV (uniformed)" : "CFAV (non-uniformed)") : ROLE_LABELS[u.role]}</span>
                  {u.role === "parent" && <span className="text-xs text-raf-slate">{(u.child_ids || []).length} linked cadet(s)</span>}
                </div>
                <div className="text-xs text-raf-slate mt-1">{u.email}</div>
                {u.role === "cadet" && (
                  <div className="text-xs text-raf-slate mt-1">
                    DofE: <strong className="text-raf-navy">{u.dofe_level || "-"} {u.dofe_status ? `(${u.dofe_status})` : ""}</strong>
                    {" · "}
                    BTech: <strong className="text-raf-navy">{u.btech_pathway || "-"} {u.btech_status ? `(${u.btech_status})` : ""}</strong>
                    <span className="ml-2">Last login: <strong className="text-raf-navy">{u.last_login_at ? new Date(u.last_login_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never"}</strong></span>
                  </div>
                )}
                {u.role !== "cadet" && u.last_login_at && (
                  <div className="text-xs text-raf-slate mt-1">Last login: <strong className="text-raf-navy">{new Date(u.last_login_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</strong></div>
                )}
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
                <button
                  data-testid={`reset-pw-${u.id}`}
                  onClick={() => resetPw(u)}
                  className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white transition-colors"
                  title={u.role === "cadet" ? "Reset to Squadron123!" : "Reset password"}
                >
                  <KeyRound size={15} />
                </button>
                <button data-testid={`delete-user-${u.id}`} onClick={() => remove(u)} className="p-2 bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} editing={editing} />
    </div>
  );
};
