import { useEffect, useState, useRef } from "react";
import { api, ROLE_LABELS } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { Send, Loader2, ArrowLeft, Inbox } from "lucide-react";

export const StaffMessagesPanel = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const loadThreads = async () => {
    try { const { data } = await api.get("/messages/threads"); setThreads(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadThreads(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const openThread = async (t) => {
    setActive(t);
    const { data } = await api.get(`/messages/thread/${t.member_id}`);
    setMessages(data);
    loadThreads();
  };

  const send = async () => {
    if (!body.trim() || !active) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/messages/thread/${active.member_id}`, { body: body.trim() });
      setMessages((m) => [...m, data]);
      setBody("");
    } catch { toast.error("Could not send reply."); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PanelHeading title="Member messages" intro="Conversations from cadets and parents." />
      <div className="grid md:grid-cols-3 gap-4">
        <div className={`md:col-span-1 bg-white border border-white ${active ? "hidden md:block" : ""}`}>
          {loading ? (
            <div className="p-6 text-center text-raf-slate"><Loader2 className="animate-spin inline" /></div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-raf-slate"><Inbox className="mx-auto mb-2 text-raf-sky" /> No messages.</div>
          ) : threads.map((t) => (
            <button key={t.member_id} data-testid={`thread-${t.member_id}`} onClick={() => openThread(t)} className={`w-full text-left p-4 border-b border-raf-sky hover:bg-raf-sky/50 ${active?.member_id === t.member_id ? "bg-raf-sky" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-raf-navy text-sm">{t.member_name}</span>
                {t.unread > 0 && <span className="text-[10px] bg-raf-red text-white px-1.5 py-0.5 rounded-full">{t.unread}</span>}
              </div>
              <div className="text-xs text-raf-slate">{ROLE_LABELS[t.member_role] || t.member_role}</div>
              <div className="text-xs text-raf-slate truncate mt-1">{t.last_body}</div>
            </button>
          ))}
        </div>

        <div className={`md:col-span-2 bg-white border border-white flex flex-col ${active ? "" : "hidden md:flex"}`} style={{ height: "60vh" }}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-raf-slate">Select a conversation</div>
          ) : (
            <>
              <div className="border-b border-raf-sky p-3 flex items-center gap-2">
                <button className="md:hidden text-raf-slate" onClick={() => setActive(null)}><ArrowLeft size={18} /></button>
                <span className="font-semibold text-raf-navy">{active.member_name}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from_staff ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 ${m.from_staff ? "bg-raf-blue text-white" : "bg-raf-sky text-raf-navy"}`}>
                      <div className="text-[11px] opacity-70 mb-0.5">{m.from_staff ? m.author : m.member_name} &middot; {new Date(m.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      <div className="text-sm whitespace-pre-line">{m.body}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="border-t border-raf-sky p-3 flex gap-2">
                <input data-testid="staff-reply-input" value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply..." className="flex-1 border border-raf-sky px-4 py-2.5 outline-none focus:border-raf-blue text-sm" />
                <button data-testid="staff-reply-send" onClick={send} disabled={busy} className="inline-flex items-center gap-2 px-5 bg-raf-red text-white hover:bg-[#A00926] transition-colors disabled:opacity-60">
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
