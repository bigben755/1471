import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COLOUR = {
  green: "bg-emerald-500 text-white",
  amber: "bg-amber-400 text-raf-navy",
  red: "bg-raf-red text-white",
};

function buildMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

function eventDateRange(event) {
  const start = new Date(event.start);
  if (Number.isNaN(start.getTime())) return null;
  const parsedEnd = event.end ? new Date(event.end) : null;
  const end = parsedEnd && !Number.isNaN(parsedEnd.getTime()) ? parsedEnd : start;
  return end < start ? { start, end: start } : { start, end };
}

function spansDay(event, day) {
  const range = eventDateRange(event);
  if (!range) return false;
  return range.start <= endOfDay(day) && range.end >= startOfDay(day);
}

function formatEventTimeRange(event) {
  const range = eventDateRange(event);
  if (!range) return "";
  const startLabel = range.start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const startTime = range.start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const endLabel = range.end.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const endTime = range.end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (sameDay(range.start, range.end)) {
    return `${startLabel} ${startTime}${startTime !== endTime ? ` - ${endTime}` : ""}`;
  }
  return `${startLabel} ${startTime} - ${endLabel} ${endTime}`;
}

export const Calendar = ({ events, onSelect }) => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const cells = buildMatrix(cursor.getFullYear(), cursor.getMonth());

  const eventsOn = (day) =>
    events.filter((e) => spansDay(e, day));

  return (
    <div data-testid="calendar" className="bg-white border border-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-raf-sky">
        <h3 className="font-display text-lg font-bold text-raf-navy">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <button data-testid="cal-prev" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-2 hover:bg-raf-sky"><ChevronLeft size={18} /></button>
          <button onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))} className="px-3 py-1.5 text-xs bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors">Today</button>
          <button data-testid="cal-next" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-2 hover:bg-raf-sky"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wide text-raf-slate border-b border-raf-sky">
        {DOW.map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => (
          <div key={i} className={`min-h-[64px] sm:min-h-[92px] border-b border-r border-raf-sky/70 p-1 sm:p-1.5 ${day ? "" : "bg-raf-sky/30"}`}>
            {day && (
              <>
                <div className={`text-xs mb-1 ${sameDay(day, today) ? "font-bold text-raf-red" : "text-raf-slate"}`}>
                  {day.getDate()}
                </div>
                {/* Mobile: compact colour dots */}
                <div className="flex flex-wrap gap-1 sm:hidden">
                  {eventsOn(day).map((e) => (
                    <button
                      key={e.id}
                      data-testid={`cal-event-${e.id}`}
                      onClick={() => onSelect(e)}
                      aria-label={e.title}
                      title={e.title}
                      className={`w-2.5 h-2.5 rounded-full ${COLOUR[e.colour]}`}
                    />
                  ))}
                </div>
                {/* sm+: full title chips */}
                <div className="hidden sm:block space-y-1">
                  {eventsOn(day).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onSelect(e)}
                      className={`w-full text-left px-1.5 py-1 text-[11px] leading-tight font-medium truncate ${COLOUR[e.colour]} hover:opacity-90`}
                      title={e.title}
                    >
                      {e.event_type === "premium" && <Star size={9} className="inline mr-0.5 -mt-0.5" />}
                      {e.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 px-5 py-3 text-xs text-raf-slate border-t border-raf-sky">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500" /> Places available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400" /> Filling up</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-raf-red" /> Full</span>
        <span className="flex items-center gap-1.5"><Star size={12} /> Premium event</span>
      </div>
    </div>
  );
};

const BAR = {
  green: "bg-emerald-500",
  amber: "bg-amber-400",
  red: "bg-raf-red",
};
const STATUS = { green: "Open", amber: "Filling up", red: "Full" };

export const Agenda = ({ events, onSelect }) => {
  const now = new Date(new Date().toDateString());
  const list = [...events]
    .filter((e) => new Date(e.start) >= now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (list.length === 0) {
    return (
      <div data-testid="agenda" className="bg-white border border-white p-10 text-center text-raf-slate text-sm">
        No upcoming events yet — check back soon.
      </div>
    );
  }

  const groups = [];
  list.forEach((e) => {
    const d = new Date(e.start);
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    let g = groups.find((x) => x.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(e);
  });

  return (
    <div data-testid="agenda" className="bg-white border border-white divide-y divide-raf-sky/60">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="px-4 py-2 bg-raf-sky/40 text-[11px] uppercase tracking-wide font-bold text-raf-navy sticky top-16 z-10">
            {g.label}
          </div>
          {g.items.map((e) => {
            const d = new Date(e.start);
            return (
              <button
                key={e.id}
                data-testid={`agenda-event-${e.id}`}
                onClick={() => onSelect(e)}
                className="w-full flex items-stretch gap-3 px-4 py-3 text-left hover:bg-raf-sky/20 active:bg-raf-sky/30 transition-colors"
              >
                <div className="flex flex-col items-center justify-center w-11 shrink-0">
                  <span className="text-[10px] uppercase text-raf-slate leading-none">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                  <span className="text-2xl font-display font-extrabold text-raf-navy leading-tight">{d.getDate()}</span>
                </div>
                <span className={`w-1.5 rounded-full shrink-0 ${BAR[e.colour]}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-raf-navy truncate flex items-center gap-1">
                    {e.event_type === "premium" && <Star size={13} className="text-amber-500 shrink-0" />}
                    {e.title}
                  </div>
                  <div className="text-xs text-raf-slate mt-0.5 truncate">
                    {formatEventTimeRange(e)}
                    {e.location ? ` | ${e.location}` : ""}
                  </div>
                </div>
                <span className={`self-center text-[10px] uppercase px-2 py-0.5 shrink-0 ${COLOUR[e.colour]}`}>{STATUS[e.colour]}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const UpcomingList = ({ events, onSelect }) => {
  const upcoming = events
    .filter((e) => new Date(e.start) >= new Date(new Date().toDateString()))
    .slice(0, 6);
  if (upcoming.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="font-display text-lg font-bold text-raf-navy mb-3">Upcoming</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcoming.map((e) => (
          <button key={e.id} data-testid={`upcoming-${e.id}`} onClick={() => onSelect(e)} className="text-left bg-white border border-white p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase px-2 py-0.5 ${COLOUR[e.colour]}`}>{e.colour === "red" ? "Full" : "Open"}</span>
              {e.event_type === "premium" && <Star size={14} className="text-amber-500" />}
            </div>
            <div className="mt-2 font-display font-bold text-raf-navy">{e.title}</div>
            <div className="text-xs text-raf-slate mt-1">
              {formatEventTimeRange(e)}
            </div>
            {e.location && <div className="text-xs text-raf-slate mt-1 flex items-center gap-1"><MapPin size={12} /> {e.location}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};
