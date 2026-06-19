import { useEffect, useState, useRef } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { Send, Loader2 } from "lucide-react";

export const MessagesPanel = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const load = async () => {
    try { const { data } = await api.get("/messages/thread"); setMessages(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!body.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post("/messages/thread", { body: body.trim() });
      setMessages((m) => [...m.filter((x) => x.id !== data.id), data]);
      setBody("");
    } catch { toast.error("Could not send message."); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PanelHeading title="Message the squadron" intro="A private message board between you and squadron staff." />
      <div className="bg-white border border-white flex flex-col" style={{ height: "60vh" }}>
        <div data-testid="message-list" className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-raf-slate justify-center py-10"><Loader2 className="animate-spin" /> Loading...</div>
          ) : messages.length === 0 ? (
            <p className="text-center text-raf-slate py-10">No messages yet. Say hello to the team below.</p>
          ) : messages.map((m) => (
            <div key={m.id} className={`flex ${m.from_staff ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 ${m.from_staff ? "bg-raf-sky text-raf-navy" : "bg-raf-blue text-white"}`}>
                <div className="text-[11px] opacity-70 mb-0.5">{m.from_staff ? `${m.author} (Staff)` : "You"} &middot; {new Date(m.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                <div className="text-sm whitespace-pre-line">{m.body}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t border-raf-sky p-3 flex gap-2">
          <input
            data-testid="message-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 border border-raf-sky px-4 py-2.5 outline-none focus:border-raf-blue text-sm"
          />
          <button data-testid="message-send" onClick={send} disabled={busy} className="inline-flex items-center gap-2 px-5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
