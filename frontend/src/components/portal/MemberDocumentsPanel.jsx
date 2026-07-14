import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { PanelHeading } from "./PortalShell";
import { Loader2, FileText, Download, FolderOpen } from "lucide-react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const fmtSize = (b) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

export const MemberDocumentsPanel = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/documents/library"); setDocs(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const byCat = docs.reduce((acc, d) => { (acc[d.category] = acc[d.category] || []).push(d); return acc; }, {});

  return (
    <div>
      <PanelHeading title="Documents" intro="Squadron documents shared with you — forms, policies, kit lists and more." />
      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : docs.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white"><FolderOpen className="mx-auto mb-2 text-raf-sky" /> No documents shared with you yet.</div>
      ) : (
        <div className="space-y-6" data-testid="member-documents-list">
          {Object.entries(byCat).map(([cat, list]) => (
            <div key={cat}>
              <h3 className="font-display font-bold text-raf-navy text-sm uppercase tracking-wide mb-2">{cat}</h3>
              <div className="space-y-2">
                {list.map((d) => (
                  <a key={d.id} data-testid={`member-document-${d.id}`} href={`${BASE_URL}/api/documents/${d.id}/download`} target="_blank" rel="noreferrer"
                     className="bg-white border border-white p-4 flex items-center gap-3 hover:shadow-md transition-shadow group">
                    <div className="w-9 h-9 flex items-center justify-center bg-raf-sky text-raf-blue shrink-0 group-hover:bg-raf-blue group-hover:text-white transition-colors"><FileText size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-raf-navy truncate">{d.title}</div>
                      <div className="text-xs text-raf-slate">{d.filename} · {fmtSize(d.size)}</div>
                    </div>
                    <Download size={16} className="text-raf-red shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
