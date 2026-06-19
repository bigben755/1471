import { useState } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { useAuth } from "../../context/AuthContext";
import { Loader2, KeyRound } from "lucide-react";

export const AccountPanel = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.new_password.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (form.new_password !== form.confirm) { toast.error("New passwords do not match."); return; }
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current_password: form.current_password, new_password: form.new_password });
      toast.success("Password updated.");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update password.");
    } finally { setBusy(false); }
  };

  const inp = "w-full border border-raf-sky px-4 py-3 outline-none focus:border-raf-blue text-sm";

  return (
    <div>
      <PanelHeading title="My account" intro="Manage your sign-in details." />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-white p-6">
          <h3 className="font-display font-bold text-raf-navy mb-4">Your details</h3>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-raf-slate">Name</dt><dd className="text-raf-navy font-medium">{user?.first_name} {user?.last_name}</dd></div>
            <div className="flex justify-between"><dt className="text-raf-slate">Email</dt><dd className="text-raf-navy font-medium">{user?.email}</dd></div>
            <div className="flex justify-between"><dt className="text-raf-slate">Role</dt><dd className="text-raf-navy font-medium capitalize">{user?.role}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-raf-slate">To change your name, email or role, please contact squadron staff.</p>
        </div>

        <form onSubmit={submit} data-testid="change-password-form" className="bg-white border border-white p-6">
          <h3 className="font-display font-bold text-raf-navy mb-4 flex items-center gap-2"><KeyRound size={18} /> Change password</h3>
          <input data-testid="current-password" type="password" placeholder="Current password" className={`${inp} mb-3`} value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} required />
          <input data-testid="new-password" type="password" placeholder="New password" className={`${inp} mb-3`} value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required />
          <input data-testid="confirm-password" type="password" placeholder="Confirm new password" className={`${inp} mb-4`} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          <button data-testid="change-password-submit" type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60">
            {busy && <Loader2 className="animate-spin" size={16} />} Update password
          </button>
        </form>
      </div>
    </div>
  );
};
