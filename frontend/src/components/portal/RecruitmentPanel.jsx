import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { UserFormDialog } from "./UserFormDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../ui/dialog";
import {
  Loader2, Mail, Phone, UserPlus, Clock, CheckCircle2, CalendarClock, Send, MailCheck,
} from "lucide-react";

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
  const [emailFor, setEmailFor] = useState(null); // { enquiry, bucket }
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

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

  const openEmail = (enquiry, bucket) => { setEmailFor({ enquiry, bucket }); setNote(""); };

  const sendEmail = async () => {
    setBusy(true);
    try {
      const { data: res } = await api.post(`/enquiries/${emailFor.enquiry.id}/recruit-email`,
        { kind: emailFor.bucket.kind, note });
      if (res.email_status === "error") {
        toast.error("Could not send the email. Please try again.");
        return;
      }
      const name = emailFor.enquiry.name;
      toast.success(emailFor.bucket.kind === "joining"
        ? `Joining instructions emailed to ${name}.`
        : `Countdown email sent to ${name}.`,
        { description: emailFor.bucket.kind === "countdown" ? `They can join from ${fmtDate(res.eligible_date)}.` : undefined });
      setEmailFor(null); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Could not send email."); }
    finally { setBusy(false); }
  };

  const sendBulk = async (bucket) => {
    const list = data?.buckets?.[bucket.key] || [];
    if (list.length === 0) return;
    if (!window.confirm(`Send ${bucket.kind === "joining" ? "joining instructions" : "a countdown email"} to all ${list.length} prospect(s) in "${bucket.label}"?`)) return;
    try {
      const { data: res } = await api.post("/enquiries/recruit-email/bulk", { eligibility: bucket.key, note: "" });
      toast.success(`${res.sent} email(s) sent.`, { description: res.skipped ? `${res.skipped} skipped (missing details).` : undefined });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Could not send emails."); }
  };

  if (loading) return <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>;

  const counts = data?.counts || {};
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
                  <button data-testid={`bucket-email-all-${b.key}`} onClick={() => sendBulk(b)} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-raf-navy text-white hover:bg-raf-blue transition-colors">
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

      {/* Recruit email dialog */}
      <Dialog open={!!emailFor} onOpenChange={(o) => !o && setEmailFor(null)}>
        <DialogContent data-testid="recruit-email-dialog" className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-raf-navy">{emailFor?.bucket.kind === "joining" ? "Send joining instructions" : "Send countdown email"}</DialogTitle>
            <DialogDescription className="sr-only">Send a recruitment email to this prospect</DialogDescription>
          </DialogHeader>
          {emailFor && (
            <div className="space-y-3 text-sm">
              <p className="text-raf-slate">To <strong className="text-raf-navy">{emailFor.enquiry.name}</strong> ({emailFor.enquiry.email})</p>
              {emailFor.bucket.kind === "countdown" && emailFor.enquiry.eligible_date && (
                <div className="bg-raf-sky/50 border-l-4 border-raf-blue p-3 text-raf-slate">
                  Countdown to <strong>{fmtDate(emailFor.enquiry.eligible_date)}</strong> — {countdown(emailFor.enquiry.eligible_date)} to go.
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-raf-navy mb-1">Add a personal note (optional)</label>
                <textarea data-testid="recruit-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. We look forward to meeting you on Thursday!" className="w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm" />
              </div>
              <p className="text-xs text-raf-slate">The rest of the email (parade nights, venue and next steps) is added automatically.</p>
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
