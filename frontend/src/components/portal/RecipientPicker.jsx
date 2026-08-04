import { useState } from "react";
import { ROLE_LABELS } from "../../api";
import { Search } from "lucide-react";

const ROLE_CHIPS = [
  { key: "cadet", label: "Cadets" },
  { key: "parent", label: "Parents" },
  { key: "cfav", label: "Volunteers" },
  { key: "admin", label: "Staff" },
];

const MODES = [
  { key: "all", label: "Everyone" },
  { key: "roles", label: "By role" },
  { key: "users", label: "Specific people" },
  { key: "appointments", label: "By post holder" },
  { key: "parent_of", label: "A cadet's parent" },
];

export const RecipientPicker = ({ value, onChange, users, appointmentOptions = [] }) => {
  const [q, setQ] = useState("");
  const set = (patch) => onChange({ ...value, ...patch });
  const appointmentKeys = value.appointment_keys || [];
  const cadets = users.filter((u) => u.role === "cadet");
  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  const toggleRole = (r) =>
    set({ roles: value.roles.includes(r) ? value.roles.filter((x) => x !== r) : [...value.roles, r] });
  const toggleUser = (id) =>
    set({ user_ids: value.user_ids.includes(id) ? value.user_ids.filter((x) => x !== id) : [...value.user_ids, id] });
  const toggleAppointment = (k) =>
    set({ appointment_keys: appointmentKeys.includes(k)
      ? appointmentKeys.filter((x) => x !== k)
      : [...appointmentKeys, k] });

  return (
    <div data-testid="recipient-picker">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            data-testid={`recipient-mode-${m.key}`}
            onClick={() => set({ mode: m.key })}
            className={`px-3 py-1.5 text-sm border transition-colors ${value.mode === m.key ? "bg-raf-blue text-white border-raf-blue" : "bg-white text-raf-slate border-raf-sky hover:border-raf-blue"}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {value.mode === "all" && (
        <p className="mt-3 text-xs text-raf-slate">This will reach all cadets, parents, volunteers and staff with an account.</p>
      )}

      {value.mode === "roles" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLE_CHIPS.map((r) => (
            <button
              key={r.key}
              type="button"
              data-testid={`recipient-role-${r.key}`}
              onClick={() => toggleRole(r.key)}
              className={`px-3 py-1.5 text-sm border transition-colors ${value.roles.includes(r.key) ? "bg-raf-red text-white border-raf-red" : "bg-white text-raf-slate border-raf-sky"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {value.mode === "users" && (
        <div className="mt-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-raf-slate" />
            <input
              data-testid="recipient-user-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search people..."
              className="w-full border border-raf-sky pl-9 pr-3 py-2 text-sm outline-none focus:border-raf-blue"
            />
          </div>
          <div className="mt-2 max-h-52 overflow-y-auto border border-raf-sky divide-y divide-raf-sky/60">
            {filtered.map((u) => (
              <label key={u.id} data-testid={`recipient-user-${u.id}`} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-raf-sky/40">
                <input type="checkbox" checked={value.user_ids.includes(u.id)} onChange={() => toggleUser(u.id)} className="w-4 h-4 accent-raf-blue" />
                <span className="text-raf-navy">{u.first_name} {u.last_name}</span>
                <span className="ml-auto text-[10px] uppercase text-raf-slate">{ROLE_LABELS[u.role]}</span>
              </label>
            ))}
            {filtered.length === 0 && <div className="px-3 py-4 text-xs text-raf-slate text-center">No matches.</div>}
          </div>
          <p className="mt-1 text-xs text-raf-slate">{value.user_ids.length} selected</p>
        </div>
      )}

      {value.mode === "appointments" && (
        <div className="mt-3">
          <p className="text-xs text-raf-slate mb-2">Send directly to selected appointment holders (ideal for Adjutant dissemination).</p>
          <div className="flex flex-wrap gap-2">
            {appointmentOptions.map((a) => (
              <button
                key={a.key}
                type="button"
                data-testid={`recipient-appointment-${a.key}`}
                onClick={() => toggleAppointment(a.key)}
                className={`px-3 py-1.5 text-sm border transition-colors ${appointmentKeys.includes(a.key) ? "bg-raf-red text-white border-raf-red" : "bg-white text-raf-slate border-raf-sky"}`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-raf-slate">{appointmentKeys.length} post holder role(s) selected.</p>
        </div>
      )}

      {value.mode === "parent_of" && (
        <div className="mt-3">
          <label className="block text-xs text-raf-slate mb-1">Select the cadet — the message goes to their linked parent/carer.</label>
          <select
            data-testid="recipient-cadet-select"
            value={value.cadet_id || ""}
            onChange={(e) => set({ cadet_id: e.target.value })}
            className="w-full border border-raf-sky px-3 py-2.5 text-sm outline-none focus:border-raf-blue bg-white"
          >
            <option value="">Choose a cadet...</option>
            {cadets.map((c) => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-raf-slate">Parent links are set by staff in Members, based on the official contact preferences held in SMS.</p>
        </div>
      )}
    </div>
  );
};

export const emptyAudience = () => ({ mode: "all", roles: [], user_ids: [], cadet_id: null, appointment_keys: [] });

export const audienceValid = (a) => {
  if (a.mode === "all") return true;
  if (a.mode === "roles") return a.roles.length > 0;
  if (a.mode === "users") return a.user_ids.length > 0;
  if (a.mode === "appointments") return a.appointment_keys.length > 0;
  if (a.mode === "parent_of") return !!a.cadet_id;
  return false;
};
