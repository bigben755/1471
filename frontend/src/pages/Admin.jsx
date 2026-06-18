import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CREST_URL } from "../data/content";
import {
  Loader2, LogOut, Mail, Phone, Trash2, Inbox, CheckCircle2, Circle, ShieldCheck,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "horwich_admin_token";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
});

const STATUS_STYLES = {
  new: "bg-raf-red text-white",
  read: "bg-raf-sky text-raf-blue",
  actioned: "bg-emerald-600 text-white",
};

function LoginView({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-raf-navy px-5">
      <div className="absolute inset-0 route-lines opacity-20" />
      <form
        data-testid="admin-login-form"
        onSubmit={submit}
        className="relative w-full max-w-md bg-white p-8 md:p-10 border-t-4 border-raf-red"
      >
        <div className="flex items-center gap-3 mb-7">
          <img src={CREST_URL} alt="crest" className="h-12 w-12 object-contain" />
          <div>
            <div className="font-display font-extrabold text-raf-navy leading-tight">Squadron Admin</div>
            <div className="text-xs uppercase tracking-[0.18em] text-raf-slate">1471 Horwich</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-raf-navy mb-2">Email</label>
        <input
          data-testid="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-raf-sky px-4 py-3 mb-4 outline-none focus:border-raf-blue"
          required
        />
        <label className="block text-sm font-semibold text-raf-navy mb-2">Password</label>
        <input
          data-testid="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-raf-sky px-4 py-3 mb-2 outline-none focus:border-raf-blue"
          required
        />
        {error && <p data-testid="admin-login-error" className="text-raf-red text-sm mb-2">{error}</p>}
        <button
          data-testid="admin-login-submit"
          type="submit"
          disabled={loading}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="animate-spin" size={18} />} Sign in
        </button>
        <a href="/" className="block text-center mt-5 text-sm text-raf-slate hover:text-raf-blue">&larr; Back to website</a>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/enquiries`, authHeaders());
      setEnquiries(data);
    } catch (err) {
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/enquiries/${id}`, { status }, authHeaders());
      setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
    } catch { toast.error("Could not update status."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try {
      await axios.delete(`${API}/enquiries/${id}`, authHeaders());
      setEnquiries((list) => list.filter((e) => e.id !== id));
      toast.success("Enquiry deleted.");
    } catch { toast.error("Could not delete enquiry."); }
  };

  const shown = enquiries.filter((e) => filter === "all" || e.status === filter);
  const newCount = enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="min-h-screen bg-raf-sky">
      <header className="bg-raf-navy text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={CREST_URL} alt="crest" className="h-10 w-10 object-contain" />
            <div>
              <div className="font-display font-bold leading-tight">Squadron Enquiries</div>
              <div className="text-xs text-raf-sky">{user?.email}</div>
            </div>
          </div>
          <button
            data-testid="admin-logout"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-sm"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 border border-white">
            <div className="text-3xl font-display font-extrabold text-raf-navy">{enquiries.length}</div>
            <div className="text-xs uppercase tracking-wide text-raf-slate mt-1">Total</div>
          </div>
          <div className="bg-white p-5 border border-white">
            <div className="text-3xl font-display font-extrabold text-raf-red">{newCount}</div>
            <div className="text-xs uppercase tracking-wide text-raf-slate mt-1">New</div>
          </div>
          <div className="bg-white p-5 border border-white">
            <div className="text-3xl font-display font-extrabold text-emerald-600">{enquiries.filter((e) => e.status === "actioned").length}</div>
            <div className="text-xs uppercase tracking-wide text-raf-slate mt-1">Actioned</div>
          </div>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {["all", "new", "read", "actioned"].map((f) => (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm capitalize transition-colors ${
                filter === f ? "bg-raf-blue text-white" : "bg-white text-raf-slate hover:text-raf-blue"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
        ) : shown.length === 0 ? (
          <div data-testid="admin-empty" className="bg-white p-12 text-center text-raf-slate border border-white">
            <Inbox className="mx-auto mb-3 text-raf-sky" size={40} />
            No enquiries here yet.
          </div>
        ) : (
          <div className="space-y-4" data-testid="admin-enquiry-list">
            {shown.map((e) => (
              <div key={e.id} data-testid={`enquiry-${e.id}`} className="bg-white border border-white p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display font-bold text-raf-navy text-lg">{e.name}</h3>
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-1 ${STATUS_STYLES[e.status]}`}>{e.status}</span>
                      <span className="text-xs px-2 py-1 bg-raf-sky text-raf-blue">{e.enquiry_type}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-raf-slate">
                      <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 hover:text-raf-blue"><Mail size={14} /> {e.email}</a>
                      {e.phone && <span className="inline-flex items-center gap-1"><Phone size={14} /> {e.phone}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-raf-slate">{new Date(e.created_at).toLocaleString("en-GB")}</div>
                </div>
                <p className="mt-4 text-raf-slate leading-relaxed bg-raf-sky/50 border-l-2 border-raf-blue p-4">{e.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button data-testid={`mark-read-${e.id}`} onClick={() => setStatus(e.id, "read")} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors"><Circle size={13} /> Mark read</button>
                  <button data-testid={`mark-actioned-${e.id}`} onClick={() => setStatus(e.id, "actioned")} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"><CheckCircle2 size={13} /> Mark actioned</button>
                  <button data-testid={`delete-${e.id}`} onClick={() => remove(e.id)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors"><Trash2 size={13} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-8 flex items-center gap-2 text-xs text-raf-slate"><ShieldCheck size={14} /> Enquiries submitted via the public website appear here in real time.</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setChecking(false); return; }
    axios.get(`${API}/auth/me`, authHeaders())
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecking(false));
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-raf-navy text-white"><Loader2 className="animate-spin" /></div>;
  }
  return user ? <Dashboard user={user} onLogout={logout} /> : <LoginView onLogin={setUser} />;
}
