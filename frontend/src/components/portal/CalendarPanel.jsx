import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Calendar, UpcomingList, Agenda } from "./Calendar";
import { EventDialog } from "./EventDialog";
import { PanelHeading } from "./PortalShell";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "../ui/dialog";
import { Plus, Loader2, Trash2, CalendarPlus, Upload, X, FileText, List, LayoutGrid } from "lucide-react";

const ICS_URL = `${process.env.REACT_APP_BACKEND_URL}/api/calendar/events.ics`;

function ImportWordDialog({ open, onClose, onImported }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const reset = () => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await api.post("/events/import-docx", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (!data.events.length) toast.error("No dated events found in that document.");
      setPreview(data.events);
    } catch (err) { toast.error(err.response?.data?.detail || "Could not read the document."); }
    finally { setBusy(false); }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/events/import", { events: preview.map(({ date_label, ...e }) => e) });
      toast.success(`${data.created} event(s) added to the calendar.`);
      reset(); onImported(); onClose();
    } catch (err) { toast.error(err.response?.data?.detail || "Could not import."); }
    finally { setBusy(false); }
  };

  const upd = (i, k, v) => setPreview((p) => p.map((e, j) => j === i ? { ...e, [k]: v } : e));
  const del = (i) => setPreview((p) => p.filter((_, j) => j !== i));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent data-testid="word-import-dialog" className="max-w-2xl rounded-none max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-raf-navy">Import training programme (Word)</DialogTitle><DialogDescription className="sr-only">Upload a Word document to create calendar events</DialogDescription></DialogHeader>
        {!preview ? (
          <div className="py-4">
            <input ref={fileRef} type="file" accept=".docx" data-testid="word-file-input" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <button data-testid="word-choose-btn" onClick={() => fileRef.current?.click()} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 px-4 py-6 border border-dashed border-raf-sky text-raf-slate hover:border-raf-blue transition-colors">
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} {busy ? "Reading document..." : "Choose a .docx file"}
            </button>
            <p className="mt-2 text-xs text-raf-slate">We'll pull out dated rows (date + activity). You can review and edit everything before anything is added.</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="word-preview">
            <p className="text-sm text-raf-slate">{preview.length} event(s) found. Review, edit or remove, then import. Times default to 19:00–21:30.</p>
            {preview.map((e, i) => (
              <div key={i} data-testid={`preview-row-${i}`} className="flex items-center gap-2 border border-raf-sky p-2">
                <input type="datetime-local" value={e.start} onChange={(ev) => upd(i, "start", ev.target.value)} className="border border-raf-sky px-2 py-1.5 text-xs" />
                <input value={e.title} onChange={(ev) => upd(i, "title", ev.target.value)} className="flex-1 border border-raf-sky px-2 py-1.5 text-sm" />
                <button onClick={() => del(i)} className="text-raf-red hover:text-raf-navy p-1"><X size={15} /></button>
              </div>
            ))}
          </div>
        )}
        <DialogFooter className="gap-2">
          {preview && <button onClick={reset} className="px-4 py-2.5 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors">Choose another file</button>}
          {preview && preview.length > 0 && (
            <button data-testid="word-import-confirm" onClick={confirm} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />} Import {preview.length} event(s)
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const blank = {
  title: "", description: "", location: "", start: "", end: "",
  capacity: 12, event_type: "standard", participation: "attend", points_value: 10,
};

function EventForm({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ? {
        ...blank, ...editing,
        start: editing.start ? editing.start.slice(0, 16) : "",
        end: editing.end ? editing.end.slice(0, 16) : "",
      } : blank);
    }
  }, [open, editing]);

  const f = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!form.title || !form.start) { toast.error("Title and start date are required."); return; }
    setBusy(true);
    const payload = {
      ...form,
      capacity: Number(form.capacity), points_value: Number(form.points_value),
      start: new Date(form.start).toISOString(),
      end: form.end ? new Date(form.end).toISOString() : null,
    };
    try {
      if (editing) await api.patch(`/events/${editing.id}`, payload);
      else await api.post("/events", payload);
      toast.success(editing ? "Event updated." : "Event created.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save event.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!editing || !window.confirm("Delete this event?")) return;
    setBusy(true);
    try {
      await api.delete(`/events/${editing.id}`);
      toast.success("Event deleted.");
      onSaved();
      onClose();
    } finally { setBusy(false); }
  };

  const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="event-form" className="max-w-lg max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader><DialogTitle className="font-display text-raf-navy">{editing ? "Edit event" : "New event"}</DialogTitle><DialogDescription className="sr-only">Event form</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <input data-testid="event-title" className={inp} placeholder="Event title" value={form.title} onChange={(e) => f("title", e.target.value)} />
          <textarea className={inp} rows={3} placeholder="Description" value={form.description} onChange={(e) => f("description", e.target.value)} />
          <input className={inp} placeholder="Location" value={form.location} onChange={(e) => f("location", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-raf-slate">Start</label>
              <input data-testid="event-start" type="datetime-local" className={inp} value={form.start} onChange={(e) => f("start", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-raf-slate">End (optional)</label>
              <input type="datetime-local" className={inp} value={form.end} onChange={(e) => f("end", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-raf-slate">Capacity (0=∞)</label>
              <input data-testid="event-capacity" type="number" className={inp} value={form.capacity} onChange={(e) => f("capacity", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-raf-slate">Points</label>
              <input type="number" className={inp} value={form.points_value} onChange={(e) => f("points_value", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-raf-slate">Type</label>
              <select className={inp} value={form.event_type} onChange={(e) => f("event_type", e.target.value)}>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-raf-slate">Participation</label>
            <select className={inp} value={form.participation} onChange={(e) => f("participation", e.target.value)}>
              <option value="attend">Attendance</option>
              <option value="volunteer">Volunteer (builds streak)</option>
            </select>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between gap-2">
          {editing ? (
            <button data-testid="event-delete" onClick={remove} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors"><Trash2 size={15} /> Delete</button>
          ) : <span />}
          <button data-testid="event-save" onClick={save} disabled={busy} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60">
            {busy && <Loader2 className="animate-spin" size={16} />} {editing ? "Save changes" : "Create event"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const CalendarPanel = ({ canManage }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [view, setView] = useState(() =>
    typeof window !== "undefined" && window.innerWidth >= 640 ? "month" : "agenda"
  );

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const subscribe = async () => {
    try { await navigator.clipboard.writeText(ICS_URL); } catch { /* ignore */ }
    toast.success("Calendar link copied", {
      description: "Add it as a subscribed/internet calendar in Google, Apple or Outlook to stay in sync.",
    });
  };

  const openEvent = (e) => {
    if (canManage) { setEditing(e); setFormOpen(true); }
    else { setSelected(e); }
  };

  return (
    <div>
      <PanelHeading
        title="Events calendar"
        intro={canManage ? "Create events, manage bids and mark attendance." : "Tap an event to see details" + (user?.role === "cadet" ? " and bid for a place." : ".")}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex border border-raf-sky rounded-none overflow-hidden" data-testid="calendar-view-toggle">
              <button
                data-testid="view-agenda"
                onClick={() => setView("agenda")}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors ${view === "agenda" ? "bg-raf-blue text-white" : "bg-white text-raf-navy hover:bg-raf-sky"}`}
              >
                <List size={16} /> List
              </button>
              <button
                data-testid="view-month"
                onClick={() => setView("month")}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors ${view === "month" ? "bg-raf-blue text-white" : "bg-white text-raf-navy hover:bg-raf-sky"}`}
              >
                <LayoutGrid size={16} /> Grid
              </button>
            </div>
            <button data-testid="subscribe-ics-button" onClick={subscribe} className="inline-flex items-center gap-2 px-4 py-2.5 border border-raf-blue text-raf-blue hover:bg-raf-blue hover:text-white transition-colors text-sm font-semibold">
              <CalendarPlus size={17} /> Subscribe
            </button>
            {canManage && (
              <button data-testid="import-word-button" onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 border border-raf-sky text-raf-navy hover:border-raf-blue transition-colors text-sm font-semibold">
                <Upload size={17} /> Import Word
              </button>
            )}
            {canManage && (
              <button data-testid="new-event-button" onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
                <Plus size={18} /> New event
              </button>
            )}
          </div>
        }
      />
      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : (
        <>
          {view === "agenda" ? (
            <Agenda events={events} onSelect={openEvent} />
          ) : (
            <>
              <Calendar events={events} onSelect={openEvent} />
              <UpcomingList events={events} onSelect={openEvent} />
            </>
          )}
        </>
      )}

      <EventDialog event={selected} open={!!selected} onClose={() => setSelected(null)} onChanged={load} />
      {canManage && <EventForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} editing={editing} />}
      {canManage && <ImportWordDialog open={importOpen} onClose={() => setImportOpen(false)} onImported={load} />}
    </div>
  );
};
