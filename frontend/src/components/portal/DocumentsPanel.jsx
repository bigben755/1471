import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { RecipientPicker, emptyAudience, audienceValid } from "./RecipientPicker";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../ui/dialog";
import {
  Loader2, Upload, FileText, Send, Trash2, Download, Eye, Monitor, Mail, Plus, FolderOpen,
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";
const ROLE_OPTS = [
  { key: "cadet", label: "Cadets" }, { key: "parent", label: "Parents" },
  { key: "cfav", label: "Volunteers" }, { key: "admin", label: "Staff" },
];

const fmtSize = (b) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

export const DocumentsPanel = () => {
  const [docs, setDocs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upOpen, setUpOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "General", visible_roles: [] });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sendFor, setSendFor] = useState(null);
  const [audience, setAudience] = useState(emptyAudience());
  const [channels, setChannels] = useState(["dashboard", "email"]);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/documents"); setDocs(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); api.get("/users").then(({ data }) => setUsers(data)).catch(() => {}); }, [load]);

  const toggleRole = (r) => setForm((f) => ({ ...f, visible_roles: f.visible_roles.includes(r) ? f.visible_roles.filter((x) => x !== r) : [...f.visible_roles, r] }));

  const upload = async () => {
    if (!form.title || !file) { toast.error("Add a title and choose a file."); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", form.title);
      fd.append("category", form.category || "General");
      fd.append("visible_roles", form.visible_roles.join(","));
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document added to the library.");
      setUpOpen(false); setForm({ title: "", category: "General", visible_roles: [] }); setFile(null);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Upload failed."); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this document from the library?")) return;
    await api.delete(`/documents/${id}`); setDocs((d) => d.filter((x) => x.id !== id)); toast.success("Deleted.");
  };

  const doSend = async () => {
    if (!audienceValid(audience)) { toast.error("Choose who to send to."); return; }
    if (channels.length === 0) { toast.error("Choose at least one channel."); return; }
    setBusy(true);
    try {
      const { data: res } = await api.post(`/documents/${sendFor.id}/send`,
        { audience, channels, message, base_url: BASE_URL });
      toast.success(`Sent to ${res.recipients} recipient(s).`, { description: `${res.dashboard_delivered} to dashboards, ${res.emails_sent} email(s).` });
      setSendFor(null); setAudience(emptyAudience()); setMessage("");
    } catch (err) { toast.error(err.response?.data?.detail || "Could not send."); }
    finally { setBusy(false); }
  };

  const byCat = docs.reduce((acc, d) => { (acc[d.category] = acc[d.category] || []).push(d); return acc; }, {});

  return (
    <div>
      <PanelHeading title="Document library" intro="Upload documents once, let members browse them, and send them out quickly to selected groups or individuals." />
      <button data-testid="upload-document-btn" onClick={() => setUpOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors mb-6">
        <Plus size={18} /> Add document
      </button>

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : docs.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white"><FolderOpen className="mx-auto mb-2 text-raf-sky" /> No documents yet.</div>
      ) : (
        <div className="space-y-6" data-testid="documents-list">
          {Object.entries(byCat).map(([cat, list]) => (
            <div key={cat}>
              <h3 className="font-display font-bold text-raf-navy text-sm uppercase tracking-wide mb-2">{cat}</h3>
              <div className="space-y-2">
                {list.map((d) => (
                  <div key={d.id} data-testid={`document-${d.id}`} className="bg-white border border-white p-4 flex flex-wrap items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-raf-sky text-raf-blue shrink-0"><FileText size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-raf-navy truncate">{d.title}</div>
                      <div className="text-xs text-raf-slate">{d.filename} · {fmtSize(d.size)} · visible to: {d.visible_roles.length ? d.visible_roles.join(", ") : "staff only"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a data-testid={`document-download-${d.id}`} href={`${BASE_URL}/api/documents/${d.id}/download`} target="_blank" rel="noreferrer" className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="Download"><Download size={15} /></a>
                      <button data-testid={`document-send-${d.id}`} onClick={() => { setSendFor(d); setChannels(["dashboard", "email"]); }} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-raf-red text-white hover:bg-[#A00926] transition-colors"><Send size={13} /> Send</button>
                      <button data-testid={`document-delete-${d.id}`} onClick={() => remove(d.id)} className="p-2 bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={upOpen} onOpenChange={setUpOpen}>
        <DialogContent data-testid="document-upload-dialog" className="max-w-md rounded-none">
          <DialogHeader><DialogTitle className="font-display text-raf-navy">Add document</DialogTitle><DialogDescription className="sr-only">Upload a document to the library</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <input data-testid="doc-title" className={inp} placeholder="Title (e.g. Kit List 2026)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input data-testid="doc-category" className={inp} placeholder="Category (e.g. Uniform, Forms, Policies)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <div>
              <div className="text-xs font-semibold text-raf-navy mb-2">Who can browse this in their Documents area?</div>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTS.map((r) => (
                  <button key={r.key} type="button" data-testid={`doc-role-${r.key}`} onClick={() => toggleRole(r.key)} className={`px-3 py-1.5 text-sm border transition-colors ${form.visible_roles.includes(r.key) ? "bg-raf-blue text-white border-raf-blue" : "bg-white text-raf-slate border-raf-sky"}`}>{r.label}</button>
                ))}
              </div>
              <p className="text-xs text-raf-slate mt-1">Leave all off to keep it staff-only (you can still send it to anyone).</p>
            </div>
            <input ref={fileRef} type="file" data-testid="doc-file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-raf-sky text-raf-slate hover:border-raf-blue transition-colors">
              <Upload size={16} /> {file ? file.name : "Choose file (max 15MB)"}
            </button>
          </div>
          <DialogFooter>
            <button data-testid="doc-upload-submit" onClick={upload} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
              {busy && <Loader2 className="animate-spin" size={16} />} Add to library
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={!!sendFor} onOpenChange={(o) => !o && setSendFor(null)}>
        <DialogContent data-testid="document-send-dialog" className="max-w-lg rounded-none">
          <DialogHeader><DialogTitle className="font-display text-raf-navy">Send &ldquo;{sendFor?.title}&rdquo;</DialogTitle><DialogDescription className="sr-only">Send this document to recipients</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <textarea data-testid="doc-send-message" className={inp} rows={2} placeholder="Add a short message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
            <div><div className="text-xs font-semibold text-raf-navy mb-2">Recipients</div><RecipientPicker value={audience} onChange={setAudience} users={users} /></div>
            <div>
              <div className="text-xs font-semibold text-raf-navy mb-2">Deliver via</div>
              <div className="flex gap-2">
                <button type="button" data-testid="doc-channel-dashboard" onClick={() => setChannels((c) => c.includes("dashboard") ? c.filter((x) => x !== "dashboard") : [...c, "dashboard"])} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-colors ${channels.includes("dashboard") ? "bg-raf-blue text-white border-raf-blue" : "bg-white text-raf-slate border-raf-sky"}`}><Monitor size={14} /> Dashboard</button>
                <button type="button" data-testid="doc-channel-email" onClick={() => setChannels((c) => c.includes("email") ? c.filter((x) => x !== "email") : [...c, "email"])} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-colors ${channels.includes("email") ? "bg-raf-blue text-white border-raf-blue" : "bg-white text-raf-slate border-raf-sky"}`}><Mail size={14} /> Email</button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button data-testid="doc-send-confirm" onClick={doSend} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Send now
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
