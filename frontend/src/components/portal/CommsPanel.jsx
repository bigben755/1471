import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { RecipientPicker, emptyAudience, audienceValid } from "./RecipientPicker";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../ui/dialog";
import {
  Send, Newspaper, MessageSquare, Loader2, Plus, Pencil, Trash2, Eye, Mail, Monitor,
} from "lucide-react";

const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

const ChannelToggles = ({ channels, setChannels }) => {
  const toggle = (c) => setChannels((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]);
  return (
    <div className="flex gap-2">
      <button type="button" data-testid="channel-dashboard" onClick={() => toggle("dashboard")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-colors ${channels.includes("dashboard") ? "bg-raf-blue text-white border-raf-blue" : "bg-white text-raf-slate border-raf-sky"}`}>
        <Monitor size={14} /> Dashboard
      </button>
      <button type="button" data-testid="channel-email" onClick={() => toggle("email")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-colors ${channels.includes("email") ? "bg-raf-blue text-white border-raf-blue" : "bg-white text-raf-slate border-raf-sky"}`}>
        <Mail size={14} /> Email
      </button>
    </div>
  );
};

const BroadcastForm = ({ users }) => {
  const [form, setForm] = useState({ title: "", body: "" });
  const [audience, setAudience] = useState(emptyAudience());
  const [channels, setChannels] = useState(["dashboard"]);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!form.title || !form.body) { toast.error("Add a title and message."); return; }
    if (!audienceValid(audience)) { toast.error("Choose who this goes to."); return; }
    if (channels.length === 0) { toast.error("Choose at least one channel."); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/broadcast", { ...form, audience, channels });
      toast.success(`Sent to ${data.recipients} recipient(s).`, {
        description: `${data.dashboard_delivered} to dashboards, ${data.emails_sent} email(s) sent.`,
      });
      setForm({ title: "", body: "" });
      setAudience(emptyAudience());
    } catch (err) { toast.error(err.response?.data?.detail || "Could not send."); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-white border border-white p-6 max-w-2xl space-y-4" data-testid="broadcast-form">
      <input data-testid="broadcast-title" className={inp} placeholder="Message title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea data-testid="broadcast-body" className={inp} rows={5} placeholder="Write your message..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      <div>
        <div className="text-xs font-semibold text-raf-navy mb-2">Recipients</div>
        <RecipientPicker value={audience} onChange={setAudience} users={users} />
      </div>
      <div>
        <div className="text-xs font-semibold text-raf-navy mb-2">Deliver via</div>
        <ChannelToggles channels={channels} setChannels={setChannels} />
      </div>
      <button data-testid="broadcast-send" onClick={send} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
        {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Send
      </button>
    </div>
  );
};

const NewsletterMode = ({ users }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compose, setCompose] = useState(null); // {id?, subject, heading, intro, body}
  const [previewHtml, setPreviewHtml] = useState(null);
  const [sendFor, setSendFor] = useState(null); // newsletter being sent
  const [audience, setAudience] = useState(emptyAudience());
  const [channels, setChannels] = useState(["dashboard", "email"]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/newsletters"); setList(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveDraft = async () => {
    if (!compose.subject || !compose.body) { toast.error("Subject and body are required."); return; }
    setBusy(true);
    try {
      const payload = { subject: compose.subject, heading: compose.heading || "", intro: compose.intro || "", body: compose.body };
      if (compose.id) await api.patch(`/newsletters/${compose.id}`, payload);
      else await api.post("/newsletters", payload);
      toast.success("Newsletter saved.");
      setCompose(null); load();
    } catch { toast.error("Could not save."); }
    finally { setBusy(false); }
  };

  const preview = async (nl) => {
    try {
      const { data } = await api.post("/newsletters/preview", {
        subject: nl.subject, heading: nl.heading || "", intro: nl.intro || "", body: nl.body,
      });
      setPreviewHtml(data.html);
    } catch { toast.error("Could not build preview."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this newsletter?")) return;
    await api.delete(`/newsletters/${id}`); setList((l) => l.filter((x) => x.id !== id)); toast.success("Deleted.");
  };

  const doSend = async () => {
    if (!audienceValid(audience)) { toast.error("Choose who this goes to."); return; }
    if (channels.length === 0) { toast.error("Choose at least one channel."); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`/newsletters/${sendFor.id}/send`, { audience, channels });
      toast.success(`Newsletter sent to ${data.recipients} recipient(s).`, {
        description: `${data.dashboard_delivered} to dashboards, ${data.emails_sent} email(s) sent.`,
      });
      setSendFor(null); setAudience(emptyAudience()); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Could not send."); }
    finally { setBusy(false); }
  };

  return (
    <div data-testid="newsletter-mode">
      <div className="mb-4">
        <button data-testid="new-newsletter" onClick={() => setCompose({ subject: "", heading: "", intro: "", body: "" })} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
          <Plus size={18} /> New newsletter
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white">No newsletters yet. Create your first one.</div>
      ) : (
        <div className="space-y-3" data-testid="newsletters-list">
          {list.map((n) => (
            <div key={n.id} data-testid={`newsletter-${n.id}`} className="bg-white border border-white p-5 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-raf-navy">{n.subject}</h3>
                  <span className={`text-[10px] uppercase px-2 py-0.5 ${n.status === "sent" ? "bg-emerald-600 text-white" : "bg-raf-sky text-raf-blue"}`}>{n.status}</span>
                </div>
                <div className="text-xs text-raf-slate mt-1">
                  {n.status === "sent" && n.result ? `Sent to ${n.result.recipients} · ${new Date(n.sent_at).toLocaleDateString("en-GB")}` : `Draft · ${new Date(n.created_at).toLocaleDateString("en-GB")}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid={`newsletter-preview-${n.id}`} onClick={() => preview(n)} className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="Preview"><Eye size={15} /></button>
                <button data-testid={`newsletter-edit-${n.id}`} onClick={() => setCompose(n)} className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="Edit"><Pencil size={15} /></button>
                <button data-testid={`newsletter-send-${n.id}`} onClick={() => { setSendFor(n); setChannels(["dashboard", "email"]); }} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-raf-red text-white hover:bg-[#A00926] transition-colors"><Send size={13} /> Send</button>
                <button data-testid={`newsletter-delete-${n.id}`} onClick={() => remove(n.id)} className="p-2 bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose dialog */}
      <Dialog open={!!compose} onOpenChange={(o) => !o && setCompose(null)}>
        <DialogContent data-testid="newsletter-compose" className="max-w-2xl rounded-none max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-raf-navy">{compose?.id ? "Edit newsletter" : "New newsletter"}</DialogTitle><DialogDescription className="sr-only">Compose a squadron newsletter</DialogDescription></DialogHeader>
          {compose && (
            <div className="space-y-3">
              <input data-testid="nl-subject" className={inp} placeholder="Email subject line" value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} />
              <input data-testid="nl-heading" className={inp} placeholder="Headline (shown at the top)" value={compose.heading} onChange={(e) => setCompose({ ...compose, heading: e.target.value })} />
              <textarea data-testid="nl-intro" className={inp} rows={2} placeholder="Short intro (optional)" value={compose.intro} onChange={(e) => setCompose({ ...compose, intro: e.target.value })} />
              <textarea data-testid="nl-body" className={inp} rows={8} placeholder="Newsletter content... (blank lines start a new paragraph)" value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} />
            </div>
          )}
          <DialogFooter className="gap-2">
            <button data-testid="nl-preview-btn" onClick={() => preview(compose)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors"><Eye size={16} /> Preview</button>
            <button data-testid="nl-save-btn" onClick={saveDraft} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60">
              {busy && <Loader2 className="animate-spin" size={16} />} Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent data-testid="newsletter-preview-dialog" className="max-w-2xl rounded-none p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5"><DialogTitle className="font-display text-raf-navy">Email preview</DialogTitle><DialogDescription className="sr-only">Preview of the newsletter email</DialogDescription></DialogHeader>
          <iframe title="preview" srcDoc={previewHtml || ""} className="w-full h-[60vh] border-0" />
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={!!sendFor} onOpenChange={(o) => !o && setSendFor(null)}>
        <DialogContent data-testid="newsletter-send-dialog" className="max-w-lg rounded-none">
          <DialogHeader><DialogTitle className="font-display text-raf-navy">Send &ldquo;{sendFor?.subject}&rdquo;</DialogTitle><DialogDescription className="sr-only">Choose recipients and channels</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-raf-navy mb-2">Recipients</div>
              <RecipientPicker value={audience} onChange={setAudience} users={users} />
            </div>
            <div>
              <div className="text-xs font-semibold text-raf-navy mb-2">Deliver via</div>
              <ChannelToggles channels={channels} setChannels={setChannels} />
            </div>
          </div>
          <DialogFooter>
            <button data-testid="newsletter-confirm-send" onClick={doSend} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Send now
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const CommsPanel = () => {
  const [mode, setMode] = useState("message");
  const [users, setUsers] = useState([]);

  useEffect(() => { api.get("/users").then(({ data }) => setUsers(data)).catch(() => {}); }, []);

  return (
    <div>
      <PanelHeading title="Communications" intro="Send targeted messages and notifications, or compose and send a newsletter." />
      <div className="flex gap-2 mb-6">
        <button data-testid="comms-mode-message" onClick={() => setMode("message")} className={`inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors ${mode === "message" ? "bg-raf-blue text-white" : "bg-white text-raf-slate hover:text-raf-blue"}`}>
          <MessageSquare size={16} /> Send message
        </button>
        <button data-testid="comms-mode-newsletter" onClick={() => setMode("newsletter")} className={`inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors ${mode === "newsletter" ? "bg-raf-blue text-white" : "bg-white text-raf-slate hover:text-raf-blue"}`}>
          <Newspaper size={16} /> Newsletter
        </button>
      </div>
      {mode === "message" ? <BroadcastForm users={users} /> : <NewsletterMode users={users} />}
    </div>
  );
};
