import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { CREST_URL } from "../../data/content";
import { Loader2, ArrowLeft } from "lucide-react";

export const SignIn = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.response?.data?.detail || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-raf-navy px-5 relative">
      <div className="absolute inset-0 route-lines opacity-20" />
      <form
        data-testid="signin-form"
        onSubmit={submit}
        className="relative w-full max-w-md bg-white p-8 md:p-10 border-t-4 border-raf-red"
      >
        <div className="flex items-center gap-3 mb-2">
          <img src={CREST_URL} alt="crest" className="h-14 w-14 object-contain" />
          <div>
            <div className="font-display font-extrabold text-raf-navy text-lg leading-tight">Members Area</div>
            <div className="text-xs uppercase tracking-[0.18em] text-raf-slate">1471 Horwich Squadron</div>
          </div>
        </div>
        <p className="text-sm text-raf-slate mt-4 mb-6">
          Sign in with the account details provided by squadron staff.
        </p>

        <label className="block text-sm font-semibold text-raf-navy mb-2">Email</label>
        <input
          data-testid="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-raf-sky px-4 py-3 mb-4 outline-none focus:border-raf-blue"
          required
        />
        <label className="block text-sm font-semibold text-raf-navy mb-2">Password</label>
        <input
          data-testid="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-raf-sky px-4 py-3 mb-2 outline-none focus:border-raf-blue"
          required
        />
        {error && <p data-testid="signin-error" className="text-raf-red text-sm mb-2">{error}</p>}

        <button
          data-testid="signin-submit"
          type="submit"
          disabled={loading}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="animate-spin" size={18} />} Sign in
        </button>

        <a href="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-raf-slate hover:text-raf-blue">
          <ArrowLeft size={15} /> Back to website
        </a>
      </form>
    </div>
  );
};
