import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../../api";
import { PanelHeading } from "./PortalShell";
import { Loader2, FileText, Download, FolderOpen, Upload, BookOpenCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const fmtSize = (b) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

export const MemberDocumentsPanel = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const fileRefs = useRef({});

  const load = useCallback(async () => {
    try {
      const [{ data: docRows }, { data: assignmentRows }] = await Promise.all([
        api.get("/documents/library"),
        api.get("/learning-assignments/my"),
      ]);
      setDocs(docRows);
      setAssignments(Array.isArray(assignmentRows) ? assignmentRows : []);
    }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submitAssignment = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) { toast.error("Choose your completed workbook first."); return; }
    setBusyId(assignmentId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/learning-assignments/${assignmentId}/submit`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Completed workbook sent to the Training Officer.");
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[assignmentId];
        return next;
      });
      if (fileRefs.current[assignmentId]) fileRefs.current[assignmentId].value = "";
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not submit completed workbook.");
    } finally {
      setBusyId("");
    }
  };

  const byCat = docs.reduce((acc, d) => { (acc[d.category] = acc[d.category] || []).push(d); return acc; }, {});

  return (
    <div>
      <PanelHeading title="Documents" intro="Squadron documents shared with you — forms, policies, kit lists and more." />
      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : docs.length === 0 && assignments.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white"><FolderOpen className="mx-auto mb-2 text-raf-sky" /> No documents shared with you yet.</div>
      ) : (
        <div className="space-y-6" data-testid="member-documents-list">
          {user?.role === "cadet" && assignments.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-raf-navy text-sm uppercase tracking-wide mb-2">Assigned learning</h3>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white border border-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center bg-raf-sky text-raf-blue shrink-0"><BookOpenCheck size={16} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-raf-navy truncate">{assignment.document?.title || "Workbook"}</div>
                        <div className="text-xs text-raf-slate">
                          {assignment.document?.filename || "Document"}
                          {assignment.due_date ? ` · due ${assignment.due_date}` : ""}
                        </div>
                      </div>
                      <a href={`${BASE_URL}/api/documents/${assignment.document_id}/download`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-raf-blue text-white hover:bg-raf-navy transition-colors">
                        <Download size={13} /> Download workbook
                      </a>
                    </div>
                    {assignment.instructions && <p className="text-sm text-raf-slate mt-3">{assignment.instructions}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        ref={(node) => { fileRefs.current[assignment.id] = node; }}
                        type="file"
                        className="hidden"
                        onChange={(e) => setSelectedFiles((prev) => ({ ...prev, [assignment.id]: e.target.files?.[0] || null }))}
                      />
                      <button type="button" onClick={() => fileRefs.current[assignment.id]?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-raf-sky text-raf-navy hover:border-raf-blue transition-colors">
                        <Upload size={13} /> {selectedFiles[assignment.id]?.name || "Choose completed file"}
                      </button>
                      <button type="button" disabled={busyId === assignment.id} onClick={() => submitAssignment(assignment.id)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-raf-red text-white hover:bg-[#A00926] transition-colors disabled:opacity-60">
                        {busyId === assignment.id ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Send for marking
                      </button>
                      {assignment.my_submission && (
                        <a href={`${BASE_URL}/api/learning-submissions/${assignment.my_submission.id}/download`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                          <Download size={13} /> Submitted copy
                        </a>
                      )}
                    </div>
                    {assignment.my_submission && (
                      <div className="mt-2 text-xs text-emerald-700">Submitted {new Date(assignment.my_submission.submitted_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
