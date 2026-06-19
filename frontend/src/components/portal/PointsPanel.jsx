import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PanelHeading } from "./PortalShell";
import { Award, Flame, CalendarCheck, Star, Loader2 } from "lucide-react";

export const PointsPanel = () => {
  const { user, refresh } = useAuth();
  const [stats, setStats] = useState(user?.stats);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await refresh();
      setStats(u?.stats);
      try {
        const { data } = await api.get("/events");
        setEvents(data.filter((e) => e.my_attendance));
      } finally { setLoading(false); }
    })();
  }, [refresh]);

  const cards = [
    { label: "Total points", value: stats?.points ?? 0, icon: Award, colour: "bg-raf-blue" },
    { label: "Volunteer streak", value: stats?.streak ?? 0, icon: Flame, colour: "bg-raf-red" },
    { label: "Events attended", value: stats?.events_attended ?? 0, icon: CalendarCheck, colour: "bg-emerald-600" },
  ];

  return (
    <div>
      <PanelHeading title="My points & streaks" intro="Points are earned at events and help decide who goes on premium events." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} data-testid={`stat-${c.label.toLowerCase().replace(/\s+/g, "-")}`} className="bg-white border border-white p-6">
            <div className={`w-11 h-11 flex items-center justify-center text-white ${c.colour}`}><c.icon size={22} /></div>
            <div className="mt-4 text-4xl font-display font-extrabold text-raf-navy">{c.value}</div>
            <div className="text-xs uppercase tracking-wide text-raf-slate mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {stats?.bonus_points ? (
        <p className="mt-4 text-sm text-raf-slate">Includes {stats.event_points} event points and {stats.bonus_points} bonus points awarded by staff.</p>
      ) : null}

      <div className="mt-8 bg-raf-blue text-white p-6 flex items-start gap-3">
        <Star className="shrink-0 mt-0.5 text-amber-300" size={22} />
        <p className="text-sm leading-relaxed">Premium events have limited places. Cadets with the most points are prioritised, so keep attending and volunteering to build yours up.</p>
      </div>

      <h3 className="font-display text-lg font-bold text-raf-navy mt-8 mb-3">Events you've attended</h3>
      {loading ? (
        <div className="text-raf-slate"><Loader2 className="animate-spin inline" /> Loading...</div>
      ) : events.length === 0 ? (
        <p className="text-raf-slate text-sm">No attended events recorded yet.</p>
      ) : (
        <div className="space-y-2" data-testid="attended-events">
          {events.map((e) => (
            <div key={e.id} className="bg-white border border-white p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-raf-navy">{e.title}</div>
                <div className="text-xs text-raf-slate">{new Date(e.start).toLocaleDateString("en-GB")}</div>
              </div>
              <span className="text-sm font-bold text-raf-blue">+{e.points_value} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
