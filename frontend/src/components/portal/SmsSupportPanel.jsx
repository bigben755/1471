import { useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { Loader2, Send, ArrowLeft, Inbox, KeyRound } from "lucide-react";

export const SmsSupportPanel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const loadThreads = async () => {
    try {
      const { data } = await api.get(isAdmin ? "/sms-support/threads" : "/sms-support/my-threads");
      setThreads(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadThreads(); }, []);
  useEffect(() => {
    if (!active && threads.length > 0) {
      openThread(threads[0]);
    }
  }, [threads, active]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const openThread = async (t) => {
    setActive(t);
    const { data } = await api.get(`/sms-support/thread/${t.id}`);
    setMessages(data.messages || []);
    loadThreads();
  };

  const requestReset = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/sms-support/request", { note: requestNote.trim() });
      toast.success("SMS reset request sent.", {
        description: `Email notification sent to oc.1471@rafac.mod.gov.uk (${data.email_status}).`,
      });
      setRequestNote("");
      setLoading(true);
      await loadThreads();
      if (data?.thread?.id) {
        await openThread(data.thread);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not send SMS reset request.");
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!body.trim() || !active) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/sms-support/thread/${active.id}/reply`, { body: body.trim() });
      setMessages((m) => [...m, data]);
      setBody("");
      loadThreads();
    } catch {
      toast.error("Could not send reply.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PanelHeading
        title="SMS Support"
        intro={isAdmin ? "Handle CFAV SMS reset requests and reply in-dashboard." : "Request SMS password reset and chat with admin here instead of email."}
      />

      {!isAdmin && (
        <div className="bg-white border border-white p-5 mb-4" data-testid="sms-reset-request-box">
          <h3 className="font-display font-bold text-raf-navy flex items-center gap-2"><KeyRound size={17} /> Request SMS password reset</h3>
          <p className="text-xs text-raf-slate mt-1">This sends an email notification to oc.1471@rafac.mod.gov.uk and starts a dashboard thread for replies.</p>
          <textarea
            data-testid="sms-reset-note"
            rows={2}
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            placeholder="Optional note..."
            className="w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm mt-3"
          />
          <button
            data-testid="sms-reset-request-btn"
            onClick={requestReset}
            disabled={busy}
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Send reset request
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className={`md:col-span-1 bg-white border border-white ${active ? "hidden md:block" : ""}`}>
          {loading ? (
            <div className="p-6 text-center text-raf-slate"><Loader2 className="animate-spin inline" /></div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-raf-slate"><Inbox className="mx-auto mb-2 text-raf-sky" /> No requests yet.</div>
          ) : threads.map((t) => (
            <button key={t.id} data-testid={`sms-thread-${t.id}`} onClick={() => openThread(t)} className={`w-full text-left p-4 border-b border-raf-sky hover:bg-raf-sky/50 ${active?.id === t.id ? "bg-raf-sky" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-raf-navy text-sm">{t.requester_name || "CFAV"}</span>
                {t.unread > 0 && <span className="text-[10px] bg-raf-red text-white px-1.5 py-0.5 rounded-full">{t.unread}</span>}
              </div>
              <div className="text-xs text-raf-slate">{new Date(t.updated_at || t.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
              <div className="text-xs text-raf-slate truncate mt-1">{t.last_body}</div>
            </button>
          ))}
        </div>

        <div className={`md:col-span-2 bg-white border border-white flex flex-col ${active ? "" : "hidden md:flex"}`} style={{ height: "60vh" }}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-raf-slate">Select a request</div>
          ) : (
            <>
              <div className="border-b border-raf-sky p-3 flex items-center gap-2">
                <button className="md:hidden text-raf-slate" onClick={() => setActive(null)}><ArrowLeft size={18} /></button>
                <span className="font-semibold text-raf-navy">{active.requester_name || "CFAV"}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from_admin ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 ${m.from_admin ? "bg-raf-sky text-raf-navy" : "bg-raf-blue text-white"}`}>
                      <div className="text-[11px] opacity-70 mb-0.5">{m.author_name} &middot; {new Date(m.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      <div className="text-sm whitespace-pre-line">{m.body}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="border-t border-raf-sky p-3 flex gap-2">
                <input data-testid="sms-reply-input" value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply in dashboard..." className="flex-1 border border-raf-sky px-4 py-2.5 outline-none focus:border-raf-blue text-sm" />
                <button data-testid="sms-reply-send" onClick={send} disabled={busy} className="inline-flex items-center gap-2 px-5 bg-raf-red text-white hover:bg-[#A00926] transition-colors disabled:opacity-60">
                  {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
