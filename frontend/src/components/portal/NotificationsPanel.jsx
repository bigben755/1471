import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { PanelHeading } from "./PortalShell";
import { Loader2, Inbox, Mail, Newspaper, MessageSquare, CheckCheck, Download, FileText } from "lucide-react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const NotificationsPanel = ({ onRead }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data);
      if (data.some((n) => !n.read)) {
        await api.post("/notifications/read-all");
        onRead && onRead();
      }
    } finally { setLoading(false); }
  }, [onRead]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PanelHeading title="Inbox" intro="Messages, notifications and newsletters from the squadron team." />
      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white"><Inbox className="mx-auto mb-2 text-raf-sky" /> Nothing in your inbox yet.</div>
      ) : (
        <div className="space-y-3" data-testid="notifications-list">
          {items.map((n) => {
            const Icon = n.kind === "newsletter" ? Newspaper : n.kind === "document" ? FileText : MessageSquare;
            return (
              <div key={n.id} data-testid={`notification-${n.id}`} className={`bg-white border border-white p-5 border-l-4 ${n.read ? "border-l-raf-sky" : "border-l-raf-red"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-raf-sky text-raf-blue shrink-0"><Icon size={16} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-raf-navy">{n.title}</h3>
                      {!n.read && <span className="text-[10px] uppercase bg-raf-red text-white px-2 py-0.5">New</span>}
                      {n.kind === "newsletter" && <span className="text-[10px] uppercase bg-raf-blue text-white px-2 py-0.5">Newsletter</span>}
                      {n.channels?.includes("email") && <span className="text-[10px] uppercase bg-raf-sky text-raf-blue px-2 py-0.5 flex items-center gap-1"><Mail size={10} /> Emailed</span>}
                    </div>
                    <p className="mt-2 text-raf-slate leading-relaxed whitespace-pre-line text-sm">{n.body}</p>
                    {Array.isArray(n.links) && n.links.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2" data-testid={`notification-links-${n.id}`}>
                        {n.links.map((l, i) => (
                          <a
                            key={`${n.id}-${i}`}
                            data-testid={`notification-link-${n.id}-${i}`}
                            href={(l.url || "").startsWith("/api") ? `${BASE_URL}${l.url}` : l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-raf-red text-white hover:bg-[#A00926] transition-colors"
                          >
                            <Download size={14} /> {l.label || "Open"}
                          </a>
                        ))}
                      </div>
                    ) : n.link ? (
                      <a data-testid={`notification-link-${n.id}`} href={n.link.startsWith("/api") ? `${BASE_URL}${n.link}` : n.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-raf-red text-white hover:bg-[#A00926] transition-colors">
                        <Download size={14} /> {n.link_label || "Open"}
                      </a>
                    ) : null}
                    <div className="mt-3 text-xs text-raf-slate">
                      {n.from_name} &middot; {new Date(n.created_at).toLocaleString("en-GB")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
