import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { UserFormDialog } from "./UserFormDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../ui/dialog";
import {
  Loader2, Mail, Phone, UserPlus, Clock, CheckCircle2, CalendarClock, Send, MailCheck, Paperclip, X, AlertTriangle,
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const BUCKETS = [
  { key: "now", label: "Can join now", icon: CheckCircle2, tone: "text-emerald-700", bar: "bg-emerald-600",
    kind: "joining", cta: "Send joining instructions", bulkCta: "Email joining instructions to all" },
  { key: "september", label: "Eligible in September", icon: CalendarClock, tone: "text-amber-700", bar: "bg-amber-500",
    kind: "countdown", cta: "Send countdown email", bulkCta: "Email countdown to all" },
  { key: "future", label: "Eligible in the future", icon: Clock, tone: "text-raf-blue", bar: "bg-raf-blue",
    kind: "countdown", cta: "Send countdown email", bulkCta: "Email countdown to all" },
];

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
const countdown = (iso) => {
  if (!iso) return "";
  const days = Math.ceil((new Date(iso) - new Date()) / 86400000);
  if (days <= 0) return "now";
  const m = Math.floor(days / 30), d = days % 30;
  if (m >= 1) return `about ${m} month${m !== 1 ? "s" : ""}${d ? `, ${d} day${d !== 1 ? "s" : ""}` : ""}`;
  return `${days} day${days !== 1 ? "s" : ""}`;
};

export const RecruitmentPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prefill, setPrefill] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [emailFor, setEmailFor] = useState(null); // { enquiry?, bucket, bulk? }
  const [note, setNote] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

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

  const openEmail = (enquiry, bucket, bulk = false) => {
    setEmailFor({ enquiry, bucket, bulk }); setNote(""); setAttachments([]);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const { data } = await api.post("/attachments", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setAttachments((a) => [...a, { id: data.id, filename: data.filename }]);
      }
    } catch (err) { toast.error(err.response?.data?.detail || "Upload failed."); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const sendEmail = async () => {
    setBusy(true);
    try {
      const bucket = emailFor.bucket;
      const ids = attachments.map((a) => a.id);
      if (emailFor.bulk) {
        const { data: res } = await api.post("/enquiries/recruit-email/bulk",
          { eligibility: bucket.key, note, attachment_ids: ids, base_url: BASE_URL });
        toast.success(`${res.sent} email(s) sent.`, { description: res.skipped ? `${res.skipped} skipped (missing details).` : undefined });
      } else {
        const { data: res } = await api.post(`/enquiries/${emailFor.enquiry.id}/recruit-email`,
          { kind: bucket.kind, note, attachment_ids: ids, base_url: BASE_URL });
        if (res.email_status === "error") { toast.error("Could not send the email. Please try again."); return; }
        const name = emailFor.enquiry.name;
        toast.success(bucket.kind === "joining"
          ? `Joining instructions emailed to ${name}.`
          : `Countdown email sent to ${name}.`,
          { description: bucket.kind === "countdown" ? `They can join from ${fmtDate(res.eligible_date)}.` : undefined });
      }
      setEmailFor(null); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Could not send email."); }
    finally { setBusy(false); }
  };

  const handleBulk = (bucket) => {
    const list = data?.buckets?.[bucket.key] || [];
    if (list.length === 0) return;
    if (bucket.kind === "joining") { openEmail(null, bucket, true); return; }
    if (!window.confirm(`Send a countdown email to all ${list.length} prospect(s) in "${bucket.label}"?`)) return;
    api.post("/enquiries/recruit-email/bulk", { eligibility: bucket.key, note: "", base_url: BASE_URL })
      .then(({ data: res }) => { toast.success(`${res.sent} email(s) sent.`, { description: res.skipped ? `${res.skipped} skipped (missing details).` : undefined }); load(); })
      .catch((err) => toast.error(err.response?.data?.detail || "Could not send emails."));
  };

  if (loading) return <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>;

  const counts = data?.counts || {};
  const followUps = data?.follow_up?.age_mismatch || [];
  return (
    <div>
      <PanelHeading title="Recruitment tracker" intro="Prospective cadets from the website, grouped by when they can join. Message joining instructions to those eligible now, or send a countdown to those waiting." />

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
              {list.length > 0 && (
                <div className="px-4 pt-3">
                  <button data-testid={`bucket-email-all-${b.key}`} onClick={() => handleBulk(b)} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-raf-navy text-white hover:bg-raf-blue transition-colors">
                    <MailCheck size={13} /> {b.bulkCta} ({list.length})
                  </button>
                </div>
              )}
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
                      {b.key !== "now" && e.eligible_date && (
                        <span className={`font-semibold ${b.tone}`}>Can join {fmtDate(e.eligible_date)} · {countdown(e.eligible_date)} to go</span>
                      )}
                    </div>
                    {e.last_recruit_email && (
                      <div className="mt-1 text-[10px] text-emerald-700 inline-flex items-center gap-1"><MailCheck size={11} /> {e.last_recruit_email.kind} email sent</div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button data-testid={`prospect-email-${e.id}`} onClick={() => openEmail(e, b)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-raf-red text-white hover:bg-[#A00926] transition-colors">
                        <Send size={12} /> {b.cta}
                      </button>
                      <button data-testid={`prospect-create-${e.id}`} onClick={() => createAccount(e)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-raf-blue text-white hover:bg-raf-navy transition-colors">
                        <UserPlus size={12} /> Create account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white border border-amber-200" data-testid="follow-up-age-mismatch">
        <div className="h-1 bg-amber-500" />
        <div className="p-4 border-b border-amber-200 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-700" />
          <h3 className="font-display font-bold text-raf-navy">Follow Up - Age Mismatch</h3>
          <span className="ml-auto text-sm font-bold text-raf-slate">{data?.follow_up_counts?.age_mismatch ?? 0}</span>
        </div>
        <div className="p-4 space-y-3 min-h-[96px]">
          {followUps.length === 0 ? (
            <p className="text-xs text-raf-slate text-center py-4">No mismatches currently flagged.</p>
          ) : followUps.map((e) => (
            <div key={`mismatch-${e.id}`} className="border border-amber-200 bg-amber-50/40 p-3" data-testid={`age-mismatch-${e.id}`}>
              <div className="font-semibold text-raf-navy text-sm">{e.name}</div>
              <div className="mt-1 text-xs text-raf-slate">
                Selected: <strong>{e.age_band_label || e.age_band}</strong>
                {" · "}
                DoB suggests: <strong>{e.expected_age_band_label || e.expected_age_band || "Needs review"}</strong>
              </div>
              {e.age_mismatch_reason && (
                <div className="mt-1 text-xs text-amber-800">{e.age_mismatch_reason}</div>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-raf-slate">
                <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 hover:text-raf-blue"><Mail size={12} /> {e.email}</a>
                {e.phone && <span className="inline-flex items-center gap-1"><Phone size={12} /> {e.phone}</span>}
                {e.dob && <span>DoB: {new Date(e.dob).toLocaleDateString("en-GB")}</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => createAccount(e)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-raf-blue text-white hover:bg-raf-navy transition-colors">
                  <UserPlus size={12} /> Create account
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recruit email dialog */}
      <Dialog open={!!emailFor} onOpenChange={(o) => !o && setEmailFor(null)}>
        <DialogContent data-testid="recruit-email-dialog" className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-raf-navy">{emailFor?.bucket.kind === "joining" ? "Send joining instructions" : "Send countdown email"}</DialogTitle>
            <DialogDescription className="sr-only">Send a recruitment email to this prospect</DialogDescription>
          </DialogHeader>
          {emailFor && (
            <div className="space-y-3 text-sm">
              {emailFor.bulk ? (
                <p className="text-raf-slate">This will email <strong className="text-raf-navy">all {data?.buckets?.[emailFor.bucket.key]?.length || 0} prospect(s)</strong> in &ldquo;{emailFor.bucket.label}&rdquo;.</p>
              ) : (
                <p className="text-raf-slate">To <strong className="text-raf-navy">{emailFor.enquiry.name}</strong> ({emailFor.enquiry.email})</p>
              )}
              {emailFor.bucket.kind === "countdown" && !emailFor.bulk && emailFor.enquiry.eligible_date && (
                <div className="bg-raf-sky/50 border-l-4 border-raf-blue p-3 text-raf-slate">
                  Countdown to <strong>{fmtDate(emailFor.enquiry.eligible_date)}</strong> — {countdown(emailFor.enquiry.eligible_date)} to go.
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-raf-navy mb-1">Add a personal note (optional)</label>
                <textarea data-testid="recruit-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. We look forward to meeting you on Thursday!" className="w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm" />
              </div>

              {emailFor.bucket.kind === "joining" && (
                <div data-testid="attachment-section">
                  <label className="block text-xs font-semibold text-raf-navy mb-1">Attachments (e.g. joining form, welcome pack)</label>
                  <input ref={fileRef} type="file" multiple data-testid="attachment-input" className="hidden" onChange={(e) => uploadFiles(Array.from(e.target.files || []))} />
                  <button type="button" data-testid="attachment-add" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-raf-sky text-raf-blue hover:border-raf-blue transition-colors disabled:opacity-60">
                    {uploading ? <Loader2 className="animate-spin" size={13} /> : <Paperclip size={13} />} Add file
                  </button>
                  {attachments.length > 0 && (
                    <ul className="mt-2 space-y-1" data-testid="attachment-list">
                      {attachments.map((a) => (
                        <li key={a.id} className="flex items-center gap-2 text-xs bg-raf-sky/40 px-2 py-1.5">
                          <Paperclip size={12} className="text-raf-blue" />
                          <span className="truncate text-raf-navy">{a.filename}</span>
                          <button type="button" onClick={() => setAttachments((x) => x.filter((y) => y.id !== a.id))} className="ml-auto text-raf-red hover:text-raf-navy"><X size={13} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1 text-xs text-raf-slate">Files are sent as secure download links in the email. Max 15MB each.</p>
                </div>
              )}
              {emailFor.bucket.kind !== "joining" && (
                <p className="text-xs text-raf-slate">The rest of the email (the countdown and squadron details) is added automatically.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <button data-testid="recruit-email-send" onClick={sendEmail} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Send email
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => toast.success("Cadet account ready — they can now sign in.")} prefill={prefill} />
    </div>
  );
};
