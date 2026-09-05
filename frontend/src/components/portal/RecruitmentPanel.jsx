import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { UserFormDialog } from "./UserFormDialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../ui/dialog";
import {
  AlertTriangle, CalendarClock, CheckCircle2, Loader2, Mail, MailCheck, Paperclip,
  Phone, Send, UserPlus, X,
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { key: "uncategorised", label: "Needs categorising", bar: "bg-amber-500", tone: "text-amber-800" },
  { key: "ready_now", label: "Ready now", bar: "bg-emerald-600", tone: "text-emerald-700" },
  { key: "september_2028", label: "September 2028", bar: "bg-raf-blue", tone: "text-raf-blue" },
  { key: "not_ready", label: "Not ready", bar: "bg-raf-slate", tone: "text-raf-slate" },
];

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  : "";

const ActionSummary = ({ label, count, icon: Icon, tone = "text-raf-blue" }) => (
  <div className="bg-white border border-raf-sky p-4 flex items-center gap-3">
    <div className="w-10 h-10 bg-raf-sky/50 grid place-items-center">
      <Icon size={19} className={tone} />
    </div>
    <div>
      <div className="text-2xl leading-none font-display font-bold text-raf-navy">{count ?? 0}</div>
      <div className="text-xs text-raf-slate mt-1">{label}</div>
    </div>
  </div>
);

const ProgressStage = ({ title, sentAt, blocked, blockedText, onMark, onClear, children }) => (
  <div className={`border p-3 ${sentAt ? "border-emerald-200 bg-emerald-50/40" : "border-raf-sky bg-white"}`}>
    <div className="flex items-start gap-2">
      {sentAt
        ? <CheckCircle2 size={17} className="text-emerald-700 mt-0.5 shrink-0" />
        : <span className="w-[17px] h-[17px] rounded-full border border-raf-slate/50 mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-raf-navy">{title}</div>
        {sentAt && <div className="text-[11px] text-emerald-700 mt-0.5">Sent {fmtDate(sentAt)}</div>}
        {!sentAt && blocked && <div className="text-[11px] text-raf-slate mt-0.5">{blockedText}</div>}
      </div>
    </div>
    {!blocked && (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {children || (!sentAt ? (
          <button onClick={onMark} className="px-2.5 py-1.5 text-[11px] font-semibold bg-raf-blue text-white hover:bg-raf-navy">
            Mark sent
          </button>
        ) : null)}
        {sentAt && onClear && (
          <button onClick={onClear} className="px-2 py-1 text-[10px] text-raf-slate hover:text-raf-red underline">
            Undo
          </button>
        )}
      </div>
    )}
  </div>
);

export const RecruitmentPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("uncategorised");
  const [busyId, setBusyId] = useState("");
  const [prefill, setPrefill] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [emailFor, setEmailFor] = useState(null);
  const [note, setNote] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data: tracker } = await api.get("/recruitment/tracker");
      setData(tracker);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not load recruitment tracker.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (enquiry, body, successMessage) => {
    setBusyId(enquiry.id);
    try {
      await api.patch(`/recruitment/enquiries/${enquiry.id}`, body);
      if (successMessage) toast.success(successMessage);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update recruitment record.");
    } finally {
      setBusyId("");
    }
  };

  const createAccount = (e) => {
    const [first, ...rest] = e.name.trim().split(" ");
    setPrefill({ email: e.email, first_name: first, last_name: rest.join(" "), role: "cadet" });
    setFormOpen(true);
  };

  const openJoiningEmail = (e) => {
    setEmailFor(e);
    setNote("");
    setAttachments([]);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const { data: uploaded } = await api.post("/attachments", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAttachments((current) => [...current, { id: uploaded.id, filename: uploaded.filename }]);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const sendJoiningEmail = async () => {
    if (!emailFor) return;
    setSending(true);
    try {
      const { data: result } = await api.post(`/recruitment/enquiries/${emailFor.id}/joining-email`, {
        note,
        attachment_ids: attachments.map((a) => a.id),
        base_url: BASE_URL,
      });
      if (result.email_status !== "sent") {
        toast.error("The joining email was not sent. The tracker has not marked it as complete.");
        return;
      }
      toast.success(`Joining instructions emailed to ${emailFor.name}.`, {
        description: result.documents_sent
          ? "Joining documents were attached and have also been marked as sent."
          : "No documents were attached; the documents stage is still outstanding.",
      });
      setEmailFor(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not send joining instructions.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>;
  }

  const counts = data?.counts || {};
  const actions = data?.action_counts || {};
  const shown = activeCategory === "all"
    ? CATEGORIES.flatMap((c) => data?.buckets?.[c.key] || [])
    : (data?.buckets?.[activeCategory] || []);

  return (
    <div>
      <PanelHeading
        title="Recruitment tracker"
        intro="Categorise every prospective cadet first, then track the open-evening invitation, joining instructions and joining documents as separate steps."
      />

      <div className="mb-5 border-l-4 border-raf-blue bg-raf-sky/35 px-4 py-3 text-sm text-raf-slate">
        For the current intake, prospects who have not started Year 8 this year should be placed in <strong className="text-raf-navy">September 2028</strong>. New enquiries remain uncategorised until a member of staff confirms the correct category.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <ActionSummary label="Need categorising" count={actions.needs_categorising} icon={AlertTriangle} tone="text-amber-700" />
        <ActionSummary label="Open-evening invites outstanding" count={actions.needs_open_evening_invite} icon={Mail} />
        <ActionSummary label="Joining instructions outstanding" count={actions.needs_joining_instructions} icon={Send} />
        <ActionSummary label="Joining documents outstanding" count={actions.needs_joining_documents} icon={Paperclip} />
      </div>

      <div className="flex flex-wrap gap-2 mb-5" aria-label="Recruitment categories">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-2 text-xs font-bold border ${activeCategory === "all" ? "bg-raf-navy text-white border-raf-navy" : "bg-white text-raf-blue border-raf-sky"}`}
        >
          All ({data?.total ?? 0})
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            data-testid={`recruitment-filter-${category.key}`}
            onClick={() => setActiveCategory(category.key)}
            className={`px-3 py-2 text-xs font-bold border ${activeCategory === category.key ? "bg-raf-navy text-white border-raf-navy" : "bg-white text-raf-blue border-raf-sky"}`}
          >
            {category.label} ({counts[category.key] ?? 0})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {shown.length === 0 ? (
          <div className="bg-white border border-raf-sky p-10 text-center text-sm text-raf-slate">No enquiries in this category.</div>
        ) : shown.map((e) => {
          const readyNow = e.recruitment_category === "ready_now";
          const canInvite = ["ready_now", "september_2028"].includes(e.recruitment_category);
          const categorised = e.recruitment_category !== "uncategorised";
          const inviteSent = !!e.open_evening_invite_sent_at;
          const instructionsSent = !!e.joining_instructions_sent_at;
          const documentsSent = !!e.joining_documents_sent_at;
          const busy = busyId === e.id;

          return (
            <div key={e.id} data-testid={`recruitment-prospect-${e.id}`} className="bg-white border border-raf-sky">
              <div className={`h-1 ${CATEGORIES.find((c) => c.key === e.recruitment_category)?.bar || "bg-raf-slate"}`} />
              <div className="p-4 lg:p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="lg:w-[280px] shrink-0">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-raf-navy text-lg leading-tight">{e.name}</h3>
                        <div className="text-xs text-raf-slate mt-1">Enquired {fmtDate(e.created_at)}</div>
                      </div>
                      {e.age_mismatch && <AlertTriangle size={17} className="text-amber-600 shrink-0" title={e.age_mismatch_reason || "Age details need review"} />}
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-raf-slate">
                      <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-raf-blue"><Mail size={12} /> {e.email}</a>
                      {e.phone && <div className="flex items-center gap-1.5"><Phone size={12} /> {e.phone}</div>}
                      {e.dob && <div>DoB: {fmtDate(e.dob)}</div>}
                      {e.age_band_label && <div>{e.age_band_label}</div>}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-4">
                      <label className="block text-[11px] uppercase tracking-wide font-bold text-raf-slate mb-1.5">Recruitment category</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.filter((c) => c.key !== "uncategorised").map((category) => (
                          <button
                            key={category.key}
                            disabled={busy}
                            onClick={() => patch(e, { recruitment_category: category.key }, `${e.name} moved to ${category.label}.`)}
                            className={`px-3 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-50 ${e.recruitment_category === category.key ? "bg-raf-navy text-white border-raf-navy" : "bg-white text-raf-blue border-raf-sky hover:border-raf-blue"}`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!categorised ? (
                      <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                        Select Ready now, September 2028 or Not ready before progressing this enquiry.
                      </div>
                    ) : e.recruitment_category === "not_ready" ? (
                      <div className="border border-raf-sky bg-raf-sky/25 px-4 py-3 text-xs text-raf-slate">
                        This enquiry is retained for reference but has no active recruitment actions.
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-3">
                        <ProgressStage
                          title="1. Open-evening invite"
                          sentAt={e.open_evening_invite_sent_at}
                          blocked={!canInvite}
                          blockedText="Not applicable to this category."
                          onMark={() => patch(e, { open_evening_invite_sent: true }, `Open-evening invite recorded for ${e.name}.`)}
                          onClear={() => patch(e, { open_evening_invite_sent: false })}
                        />

                        <ProgressStage
                          title="2. Joining instructions"
                          sentAt={e.joining_instructions_sent_at}
                          blocked={!readyNow || !inviteSent}
                          blockedText={!readyNow ? "Available when categorised Ready now." : "Record the open-evening invite first."}
                          onClear={() => patch(e, { joining_instructions_sent: false })}
                        >
                          {!instructionsSent && (
                            <>
                              <button
                                onClick={() => openJoiningEmail(e)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-raf-red text-white hover:bg-[#A00926]"
                              >
                                <Send size={11} /> Email joining pack
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => patch(e, { joining_instructions_sent: true }, `Joining instructions marked as sent for ${e.name}.`)}
                                className="px-2.5 py-1.5 text-[11px] font-semibold border border-raf-blue text-raf-blue hover:bg-raf-sky/30 disabled:opacity-50"
                              >
                                Mark sent manually
                              </button>
                            </>
                          )}
                          {instructionsSent && (
                            <button
                              onClick={() => openJoiningEmail(e)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold border border-raf-blue text-raf-blue hover:bg-raf-sky/30"
                            >
                              <Send size={11} /> Email again
                            </button>
                          )}
                        </ProgressStage>

                        <ProgressStage
                          title="3. Joining documents"
                          sentAt={e.joining_documents_sent_at}
                          blocked={!readyNow || !instructionsSent}
                          blockedText={!readyNow ? "Available when categorised Ready now." : "Complete joining instructions first."}
                          onMark={() => patch(e, { joining_documents_sent: true }, `Joining documents marked as sent for ${e.name}.`)}
                          onClear={() => patch(e, { joining_documents_sent: false })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-raf-sky flex flex-wrap items-center gap-2">
                  {e.recruitment_category === "september_2028" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-raf-blue"><CalendarClock size={13} /> Target intake: September 2028</span>
                  )}
                  <span className="flex-1" />
                  {readyNow && (
                    <button
                      onClick={() => createAccount(e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-raf-blue text-white hover:bg-raf-navy"
                    >
                      <UserPlus size={12} /> Create cadet account
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!emailFor} onOpenChange={(open) => !open && setEmailFor(null)}>
        <DialogContent data-testid="joining-email-dialog" className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-raf-navy">Send joining instructions</DialogTitle>
            <DialogDescription>
              {emailFor ? `Email ${emailFor.name}. Attach the joining documents here if you want both stages completed automatically.` : ""}
            </DialogDescription>
          </DialogHeader>

          {emailFor && (
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-raf-navy mb-1">Personal note (optional)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. It was great to meet you at our open evening."
                  className="w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-raf-navy mb-1">Joining documents (optional)</label>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => uploadFiles(Array.from(event.target.files || []))}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-raf-sky text-raf-blue hover:border-raf-blue disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="animate-spin" size={13} /> : <Paperclip size={13} />} Add file
                </button>

                {attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {attachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center gap-2 text-xs bg-raf-sky/40 px-2 py-1.5">
                        <Paperclip size={12} className="text-raf-blue" />
                        <span className="truncate text-raf-navy">{attachment.filename}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                          className="ml-auto text-raf-red hover:text-raf-navy"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-1 text-[11px] text-raf-slate">
                  If one or more files are attached and the email sends successfully, both Joining instructions and Joining documents are timestamped automatically.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={sendJoiningEmail}
              disabled={sending || uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] disabled:opacity-60"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <MailCheck size={16} />} Send email
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => toast.success("Cadet account ready — they can now sign in.")}
        prefill={prefill}
      />
    </div>
  );
};
