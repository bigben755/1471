import { useEffect, useState } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../ui/dialog";
import { MapPin, Calendar as CalIcon, Users, Star, Award, Loader2, Check, Link as LinkIcon, FileText, ExternalLink } from "lucide-react";

const fmt = (iso) => new Date(iso).toLocaleString("en-GB", {
  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
});

const fmtRange = (startIso, endIso) => {
  if (!endIso) return fmt(startIso);
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return fmt(startIso);
  const sameDate = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate();
  if (sameDate) {
    return `${fmt(startIso)} - ${end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return `${fmt(startIso)} - ${fmt(endIso)}`;
};

export const EventDialog = ({ event, open, onClose, onChanged }) => {
  const { user, refresh } = useAuth();
  const staff = user?.role === "admin" || user?.role === "cfav";
  const cadetOrParent = user?.role === "cadet" || user?.role === "parent";
  const [detail, setDetail] = useState(event);
  const [busy, setBusy] = useState(false);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (!open || !event) return;
    setDetail(event);
    api.get(`/events/${event.id}`).then(({ data }) => {
      setDetail(data);
      setAttendance(data.attendees || []);
    }).catch(() => {});
  }, [open, event]);

  if (!event) return null;
  const cap = detail.capacity || 0;
  const pct = cap > 0 ? Math.min(100, Math.round((detail.bid_count / cap) * 100)) : 0;
  const barColour = detail.colour === "red" ? "bg-raf-red" : detail.colour === "amber" ? "bg-amber-400" : "bg-emerald-500";

  const bid = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/events/${event.id}/bid`);
      setDetail((d) => ({ ...d, my_bid: data.my_bid, bid_count: data.bid_count }));
      toast.success(data.action === "placed" ? "Your bid has been placed." : "Bid withdrawn.");
      onChanged && onChanged();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update your bid.");
    } finally {
      setBusy(false);
    }
  };

  const toggleAttend = (id) =>
    setAttendance((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const saveAttendance = async () => {
    setBusy(true);
    try {
      await api.post(`/events/${event.id}/attendance`, { attendee_ids: attendance });
      toast.success("Attendance saved and points awarded.");
      onChanged && onChanged();
      await refresh();
    } catch {
      toast.error("Could not save attendance.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="event-dialog" className="max-w-lg max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-raf-navy flex items-center gap-2">
            {detail.event_type === "premium" && <Star size={18} className="text-amber-500" />}
            {detail.title}
          </DialogTitle>
          <DialogDescription className="sr-only">Event details, capacity and bidding</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-raf-slate">
          <div className="flex items-center gap-2"><CalIcon size={16} className="text-raf-blue" /> {fmtRange(detail.start, detail.end)}</div>
          {detail.location && <div className="flex items-center gap-2"><MapPin size={16} className="text-raf-blue" /> {detail.location}</div>}
          {cadetOrParent && (
            <div className="bg-raf-sky/30 border border-raf-sky p-3 text-sm text-raf-navy">
              <p className="font-semibold mb-1">To sign up to this event, open Cadet Portal.</p>
              <button
                onClick={() => window.open(detail.link_url || "https://cadets.bader.mod.uk/", "_blank", "noopener,noreferrer")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-raf-blue text-white hover:bg-raf-navy transition-colors"
              >
                <ExternalLink size={14} /> Open Cadet Portal
              </button>
            </div>
          )}
          {Array.isArray(detail.attachments) && detail.attachments.length > 0 && (
            <div>
              <div className="font-semibold text-raf-navy mb-2 flex items-center gap-2"><FileText size={15} className="text-raf-blue" /> Event documents</div>
              <div className="space-y-2">
                {detail.attachments.map((a) => (
                  <a key={a.id} href={`${process.env.REACT_APP_BACKEND_URL}/api/attachments/${a.id}/download`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-raf-blue hover:underline">
                    <LinkIcon size={14} /> {a.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2"><Award size={16} className="text-raf-blue" /> {detail.points_value} points &middot; {detail.participation === "volunteer" ? "Volunteer event (builds streak)" : "Attendance event"}</div>
          {detail.description && <p className="leading-relaxed pt-1">{detail.description}</p>}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-raf-slate mb-1">
            <span className="flex items-center gap-1"><Users size={13} /> Bids: {detail.bid_count}{cap > 0 ? ` / ${cap}` : " (no limit)"}</span>
            {detail.colour === "red" && <span className="text-raf-red font-semibold">Full</span>}
          </div>
          {cap > 0 && (
            <div className="h-2 bg-raf-sky w-full overflow-hidden">
              <div className={`h-full ${barColour}`} style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>

        {cadetOrParent && (
          <button
            data-testid="event-signup-button"
            onClick={() => window.open(detail.link_url || "https://cadets.bader.mod.uk/", "_blank", "noopener,noreferrer")}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold bg-raf-red text-white hover:bg-[#A00926] transition-colors"
          >
            <ExternalLink size={16} /> Open Cadet Portal to sign up
          </button>
        )}

        {staff && (
          <div className="mt-5 border-t border-raf-sky pt-4">
            <div className="text-sm font-semibold text-raf-navy mb-2">Bidders & attendance ({(detail.bidders || []).length})</div>
            {(detail.bidders || []).length === 0 ? (
              <p className="text-sm text-raf-slate">No bids yet.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {detail.bidders.map((b) => (
                  <label key={b.id} data-testid={`attend-row-${b.id}`} className="flex items-center gap-3 p-2 bg-raf-sky/50 cursor-pointer">
                    <input type="checkbox" checked={attendance.includes(b.id)} onChange={() => toggleAttend(b.id)} className="w-4 h-4 accent-raf-blue" />
                    <span className="text-sm text-raf-navy">{b.first_name} {b.last_name}</span>
                    {attendance.includes(b.id) && <Check size={14} className="text-emerald-600 ml-auto" />}
                  </label>
                ))}
              </div>
            )}
            <button
              data-testid="save-attendance"
              onClick={saveAttendance}
              disabled={busy}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60"
            >
              {busy && <Loader2 className="animate-spin" size={16} />} Save attendance & award points
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
