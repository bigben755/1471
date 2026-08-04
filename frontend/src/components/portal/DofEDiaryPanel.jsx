import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import {
  Loader2, Upload, ChevronLeft, ChevronRight, Download,
  Trash2, FileText, Image, AlertTriangle,
} from "lucide-react";

const SECTIONS = [
  { key: "volunteering", label: "Volunteering", colour: "bg-emerald-600" },
  { key: "skills", label: "Skills", colour: "bg-raf-blue" },
  { key: "physical", label: "Physical", colour: "bg-raf-red" },
];

const box = "bg-white border border-white p-5";
const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

/** Return the ISO date string of the Monday of the week containing `d`. */
function weekMonday(d = new Date()) {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function shiftWeek(monday, delta) {
  const d = new Date(monday);
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(monday) {
  const d = new Date(monday);
  const end = new Date(monday);
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

function isImage(ct = "") {
  return ct.startsWith("image/");
}

export const DofEDiaryPanel = () => {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "cfav";
  const isParent = user?.role === "parent";
  const canEdit = user?.role === "cadet";
  const linkedCadetId = (isParent && (user?.child_ids || []).length > 0) ? user.child_ids[0] : null;

  const [currentWeek, setCurrentWeek] = useState(weekMonday);
  const [section, setSection] = useState("volunteering");
  const [entries, setEntries] = useState([]);
  const [missing, setMissing] = useState([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  // Current entry for the selected week+section
  const currentEntry = entries.find(
    (e) => e.week_date === currentWeek && e.section === section,
  );

  const loadEntries = useCallback(async () => {
    try {
      const params = isParent && linkedCadetId ? { cadet_id: linkedCadetId } : {};
      const { data } = await api.get("/dofe/diary", { params });
      setEntries(data);
    } catch {
      toast.error("Could not load DofE diary.");
    } finally {
      setLoading(false);
    }
  }, [isParent, linkedCadetId]);

  const loadPrompts = useCallback(async () => {
    if (!canEdit) return;
    try {
      const { data } = await api.get("/dofe/diary/prompt-check");
      setMissing(data.missing || []);
    } catch { /* ignore */ }
  }, [canEdit]);

  useEffect(() => {
    loadEntries();
    loadPrompts();
  }, [loadEntries, loadPrompts]);

  // Sync text editor when week/section changes
  useEffect(() => {
    setText(currentEntry?.content || "");
  }, [currentEntry]);

  const saveEntry = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const { data } = await api.post("/dofe/diary", {
        section,
        week_date: currentWeek,
        content: text,
      });
      setEntries((prev) => {
        const idx = prev.findIndex(
          (e) => e.week_date === data.week_date && e.section === data.section,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [data, ...prev];
      });
      toast.success("Diary entry saved.");
      loadPrompts();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save entry.");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file) => {
    if (!canEdit) return;
    if (!file) return;
    // Ensure an entry exists first
    let entryId = currentEntry?.id;
    if (!entryId) {
      setSaving(true);
      try {
        const { data } = await api.post("/dofe/diary", {
          section,
          week_date: currentWeek,
          content: text,
        });
        setEntries((prev) => [data, ...prev]);
        entryId = data.id;
      } catch {
        toast.error("Could not create entry before uploading file.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data: fdoc } = await api.post(`/dofe/diary/${entryId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, files: [...(e.files || []), fdoc], file_ids: [...(e.file_ids || []), fdoc.id] } : e,
        ),
      );
      toast.success(`${fdoc.filename} uploaded.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not upload file.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteFile = async (fileId) => {
    if (!currentEntry) return;
    try {
      await api.delete(`/dofe/diary/${currentEntry.id}/files/${fileId}`);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === currentEntry.id
            ? { ...e, files: (e.files || []).filter((f) => f.id !== fileId), file_ids: (e.file_ids || []).filter((id) => id !== fileId) }
            : e,
        ),
      );
      toast.success("File removed.");
    } catch {
      toast.error("Could not remove file.");
    }
  };

  const downloadDiary = async () => {
    try {
      const params = isParent && linkedCadetId ? { cadet_id: linkedCadetId } : {};
      const { data } = await api.get("/dofe/diary/export", { params, responseType: "blob" });
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DofE_Diary_${isParent ? "cadet" : (user?.first_name || "cadet")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      let detail = "Could not download diary.";
      const data = err?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (parsed?.detail) detail = parsed.detail;
        } catch {
          // Keep fallback detail
        }
      }
      toast.error(detail);
    }
  };

  const fileUrl = (fileId) => `${process.env.REACT_APP_BACKEND_URL}/api/dofe/diary/files/${fileId}/download`;

  // Group missing prompts by week for the banner
  const missingThisWeek = missing.filter((m) => m.week_date === weekMonday());
  const missingOther = missing.filter((m) => m.week_date !== weekMonday());

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-raf-slate p-10 justify-center">
        <Loader2 className="animate-spin" /> Loading diary...
      </div>
    );
  }

  return (
    <div>
      <PanelHeading
        title="DofE Diary"
        intro={canEdit
          ? `Record your ${user?.dofe_level ? user.dofe_level.charAt(0).toUpperCase() + user.dofe_level.slice(1) : ""} Award activities each week. Fill in all three sections — Volunteering, Skills and Physical — then download the diary to submit to eDofE.`
          : "View cadet DofE weekly diary entries and supporting files."}
        action={
          <button
            onClick={downloadDiary}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors"
          >
            <Download size={18} /> Download diary PDF
          </button>
        }
      />

      {/* ── Missing sections prompt banner ── */}
      {canEdit && (missingThisWeek.length > 0 || missingOther.length > 0) && (
        <div className="bg-amber-50 border border-amber-300 p-4 mb-5">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              {missingThisWeek.length > 0 && (
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  This week you still need to fill in:{" "}
                  {missingThisWeek.map((m) => m.section.charAt(0).toUpperCase() + m.section.slice(1)).join(", ")}
                </p>
              )}
              {missingOther.length > 0 && (
                <p className="text-xs text-amber-700">
                  You also have {missingOther.length} missing section{missingOther.length > 1 ? "s" : ""} from previous weeks.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Week navigation ── */}
      <div className={`${box} mb-5`}>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentWeek((w) => shiftWeek(w, -1))}
            className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors"
            title="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="font-display font-bold text-raf-navy">{formatWeekLabel(currentWeek)}</div>
            {currentWeek === weekMonday() && (
              <span className="text-[10px] px-2 py-0.5 bg-raf-red text-white uppercase">Current week</span>
            )}
          </div>
          <button
            onClick={() => setCurrentWeek((w) => shiftWeek(w, 1))}
            className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors"
            title="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Section tabs ── */}
      <div className="flex gap-0 mb-5">
        {SECTIONS.map((s) => {
          const hasEntry = entries.some(
            (e) => e.week_date === currentWeek && e.section === s.key && e.content?.trim(),
          );
          const isMissing = missing.some(
            (m) => m.week_date === currentWeek && m.section === s.key,
          );
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
                section === s.key
                  ? `${s.colour} text-white`
                  : "bg-white text-raf-slate hover:text-raf-blue"
              }`}
            >
              {s.label}
              {hasEntry && section !== s.key && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500" title="Entry saved" />
              )}
              {!hasEntry && isMissing && section !== s.key && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-400" title="No entry yet" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Entry editor ── */}
      <div className={`${box} mb-5`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-raf-navy">
            {SECTIONS.find((s) => s.key === section)?.label} — {formatWeekLabel(currentWeek)}
          </h3>
          {currentEntry?.updated_at && (
            <span className="text-xs text-raf-slate">
              Last saved {new Date(currentEntry.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {canEdit ? (
          <>
            <textarea
              className={`${inp} min-h-[160px]`}
              placeholder={`Describe your ${section} activity this week. What did you do? What did you learn? How long did you spend? Include dates where possible.`}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={saveEntry}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 className="animate-spin" size={15} />}
                Save entry
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-raf-slate">
            {currentEntry?.content
              ? <p className="whitespace-pre-wrap">{currentEntry.content}</p>
              : <p className="italic">(No entry for this section / week)</p>}
          </div>
        )}
      </div>

      {/* ── File upload ── */}
      {canEdit && (
        <div className={`${box} mb-5`}>
          <h3 className="font-display font-bold text-raf-navy mb-2">Attach photos &amp; documents</h3>
          <p className="text-xs text-raf-slate mb-3">Upload photos, certificates or any evidence for this section. Images are shown as previews.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={(e) => uploadFile(e.target.files?.[0])}
          />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); uploadFile(e.dataTransfer.files?.[0]); }}
            className="border border-dashed border-raf-sky p-4 text-center"
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors disabled:opacity-60"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              {uploading ? "Uploading…" : "Choose file or drag here"}
            </button>
            <p className="mt-2 text-xs text-raf-slate">Images, PDF, Word, Excel · max 15 MB</p>
          </div>
        </div>
      )}

      {/* ── Uploaded files for current entry ── */}
      {(currentEntry?.files || []).length > 0 && (
        <div className={`${box} mb-5`}>
          <h3 className="font-display font-bold text-raf-navy mb-3">
            Attachments ({currentEntry.files.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentEntry.files.map((f) => (
              <div key={f.id} className="border border-raf-sky p-2 flex flex-col gap-2">
                {isImage(f.content_type) ? (
                  <a href={fileUrl(f.id)} target="_blank" rel="noreferrer">
                    <img
                      src={fileUrl(f.id)}
                      alt={f.filename}
                      className="w-full h-32 object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={fileUrl(f.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-raf-blue hover:underline min-h-[80px] justify-center flex-col"
                  >
                    {f.content_type === "application/pdf"
                      ? <FileText size={32} className="text-raf-red" />
                      : <FileText size={32} className="text-raf-blue" />}
                    <span className="text-xs text-center break-all">{f.filename}</span>
                  </a>
                )}
                <div className="flex items-center justify-between gap-1 text-xs text-raf-slate">
                  <span className="truncate">{f.filename}</span>
                  {canEdit && (
                    <button
                      onClick={() => deleteFile(f.id)}
                      className="p-1 text-raf-red hover:bg-red-50 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Full diary summary (all entries) ── */}
      {entries.length > 0 && (
        <div className={box}>
          <h3 className="font-display font-bold text-raf-navy mb-3">Full diary history</h3>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {Array.from(
              entries.reduce((map, e) => {
                if (!map.has(e.week_date)) map.set(e.week_date, []);
                map.get(e.week_date).push(e);
                return map;
              }, new Map()),
            )
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([week, weekEntries]) => (
                <div key={week} className="border border-raf-sky p-3">
                  <button
                    className="text-sm font-semibold text-raf-navy mb-2 hover:text-raf-red transition-colors"
                    onClick={() => setCurrentWeek(week)}
                  >
                    {formatWeekLabel(week)}
                  </button>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {SECTIONS.map((s) => {
                      const e = weekEntries.find((x) => x.section === s.key);
                      const hasContent = e?.content?.trim();
                      const fileCount = (e?.files || []).length;
                      return (
                        <div
                          key={s.key}
                          className={`text-xs p-2 border ${hasContent ? "border-emerald-300 bg-emerald-50" : "border-raf-sky"}`}
                        >
                          <div className="font-semibold text-raf-navy mb-1">{s.label}</div>
                          {hasContent
                            ? <p className="text-raf-slate line-clamp-3">{e.content}</p>
                            : <p className="text-raf-slate italic">No entry</p>}
                          {fileCount > 0 && (
                            <p className="mt-1 text-raf-blue">{fileCount} file{fileCount > 1 ? "s" : ""}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
