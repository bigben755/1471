import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Calendar, UpcomingList } from "./Calendar";
import { EventDialog } from "./EventDialog";
import { PanelHeading } from "./PortalShell";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../ui/dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";

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
        <DialogHeader><DialogTitle className="font-display text-raf-navy">{editing ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
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

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEvent = (e) => {
    if (canManage) { setEditing(e); setFormOpen(true); }
    else { setSelected(e); }
  };

  return (
    <div>
      <PanelHeading
        title="Events calendar"
        intro={canManage ? "Create events, manage bids and mark attendance." : "Tap an event to see details" + (user?.role === "cadet" ? " and bid for a place." : ".")}
        action={canManage && (
          <button data-testid="new-event-button" onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
            <Plus size={18} /> New event
          </button>
        )}
      />
      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : (
        <>
          <Calendar events={events} onSelect={openEvent} />
          <UpcomingList events={events} onSelect={openEvent} />
        </>
      )}

      <EventDialog event={selected} open={!!selected} onClose={() => setSelected(null)} onChanged={load} />
      {canManage && <EventForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} editing={editing} />}
    </div>
  );
};
