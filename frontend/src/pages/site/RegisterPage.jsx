import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api";
import { toast } from "sonner";
import { Loader2, QrCode, ExternalLink, ShieldCheck } from "lucide-react";

const ROLE_OPTIONS = [
  { key: "cadet", label: "Cadet" },
  { key: "cfav", label: "CFAV" },
];

export default function RegisterPage() {
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "cfav" ? "cfav" : "cadet";
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", is_uniformed: false });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const canSubmit = useMemo(() => {
    if (!form.first_name.trim()) return false;
    if (role === "cfav" && !form.email.trim()) return false;
    return true;
  }, [form, role]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      const payload = {
        role,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        is_uniformed: role === "cfav" ? !!form.is_uniformed : false,
      };
      const { data } = await api.post("/public/register-self", payload);
      setResult(data);
      toast.success("Account created.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not create account.");
    } finally {
      setBusy(false);
    }
  };

  const qrBase = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-raf-navy via-[#0F2E5A] to-raf-blue text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="border border-white/20 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 text-raf-sky text-sm uppercase tracking-wide font-semibold">
            <QrCode size={15} /> QR Registration
          </div>
          <h1 className="font-display text-3xl sm:text-4xl mt-2">Create your squadron account</h1>
          <p className="text-white/85 mt-3 text-sm sm:text-base">
            Select your role, enter your details, and you will receive your login username with the standard first-login password.
          </p>

          <div className="mt-5 inline-flex border border-white/30">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRole(opt.key)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${role === opt.key ? "bg-white text-raf-navy" : "bg-transparent text-white hover:bg-white/10"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                placeholder="First name"
                className="w-full px-3 py-2.5 text-raf-navy bg-white border border-white/30 outline-none"
              />
              <input
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                placeholder="Last name"
                className="w-full px-3 py-2.5 text-raf-navy bg-white border border-white/30 outline-none"
              />
            </div>

            {role === "cfav" && (
              <>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="RAFAC email (name@rafac.mod.gov.uk)"
                  className="w-full px-3 py-2.5 text-raf-navy bg-white border border-white/30 outline-none"
                />
                <label className="inline-flex items-center gap-2 text-sm text-white/90">
                  <input
                    type="checkbox"
                    checked={form.is_uniformed}
                    onChange={(e) => setForm((f) => ({ ...f, is_uniformed: e.target.checked }))}
                    className="accent-raf-red"
                  />
                  Uniformed CFAV
                </label>
              </>
            )}

            {role === "cadet" && (
              <p className="text-xs text-white/80">
                Cadet email is optional. You can still sign in with your generated username.
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !canSubmit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />} Create account
            </button>
          </form>

          {result && (
            <div className="mt-6 bg-white text-raf-navy p-4">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck size={16} /> Account ready</div>
              <div className="mt-2 text-sm">
                Username: <strong>{result.login_username}</strong>
              </div>
              <div className="text-sm">
                Password: <strong>{result.default_password}</strong>
              </div>
              <p className="text-xs mt-2 text-raf-slate">You will be prompted to change this password at first login.</p>
              <a
                href="/portal"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-raf-blue text-white hover:bg-raf-navy transition-colors"
              >
                <ExternalLink size={14} /> Open members portal
              </a>
            </div>
          )}

          <div className="mt-7 border-t border-white/20 pt-4 text-xs text-white/80 space-y-1">
            <div>QR link for cadets: {qrBase}/register?role=cadet</div>
            <div>QR link for CFAV: {qrBase}/register?role=cfav</div>
          </div>
        </div>
      </section>
    </main>
  );
}
