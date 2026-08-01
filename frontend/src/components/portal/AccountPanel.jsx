import { useState, useEffect } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { useAuth } from "../../context/AuthContext";
import { Loader2, KeyRound, Bell, BellOff } from "lucide-react";
import { enablePush, disablePush, pushSupported, isStandalone, isIOS } from "../../pwa";

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

      <NotificationsCard />
    </div>
  );
};

const NotificationsCard = () => {
  const [status, setStatus] = useState("checking"); // on | off | blocked | unsupported | ios | checking
  const [busy, setBusy] = useState(false);

  const detect = async () => {
    if (!pushSupported()) {
      setStatus(isIOS() && !isStandalone() ? "ios" : "unsupported");
      return;
    }
    if (typeof Notification !== "undefined" && Notification.permission === "denied") { setStatus("blocked"); return; }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub && Notification.permission === "granted" ? "on" : "off");
    } catch (e) { setStatus("off"); }
  };

  useEffect(() => { detect(); }, []);

  const toggle = async () => {
    setBusy(true);
    try {
      if (status === "on") {
        const res = await disablePush();
        if (res.ok) { toast.success("Notifications turned off."); setStatus("off"); }
        else toast.error("Couldn't turn off notifications.");
      } else {
        const res = await enablePush();
        if (res.ok) { toast.success("Notifications on — you'll be alerted here and on your device."); setStatus("on"); }
        else if (res.reason === "denied") { toast.error("Notifications are blocked. Allow them in your browser settings."); setStatus("blocked"); }
        else if (res.reason === "disabled") toast.error("Push isn't configured on the server yet.");
        else if (res.reason === "unsupported") toast.error("This device or browser doesn't support notifications.");
        else toast.error("Couldn't turn on notifications. If you're in private browsing, try a normal window.");
      }
    } finally { setBusy(false); }
  };

  const on = status === "on";
  const canToggle = status === "on" || status === "off";

  return (
    <div data-testid="notifications-card" className="bg-white border border-white p-6 mt-6">
      <h3 className="font-display font-bold text-raf-navy mb-1 flex items-center gap-2">
        {on ? <Bell size={18} /> : <BellOff size={18} />} Notifications
      </h3>
      <p className="text-sm text-raf-slate mb-4">Get push alerts on this device for new events, notices and messages — even when the app is closed.</p>

      {status === "checking" && <div className="flex items-center gap-2 text-sm text-raf-slate"><Loader2 className="animate-spin" size={16} /> Checking…</div>}

      {canToggle && (
        <div className="flex items-center justify-between gap-4">
          <span data-testid="notifications-status" className={`text-sm font-medium ${on ? "text-green-700" : "text-raf-slate"}`}>
            {on ? "On — you're all set" : "Off"}
          </span>
          <button
            data-testid="notifications-toggle"
            onClick={toggle}
            disabled={busy}
            role="switch"
            aria-checked={on}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${on ? "bg-raf-blue" : "bg-raf-sky"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      )}

      {status === "blocked" && (
        <p data-testid="notifications-status" className="text-sm text-raf-red">Notifications are blocked in your browser. To turn them on, allow notifications for this site in your browser settings, then reload.</p>
      )}
      {status === "ios" && (
        <p data-testid="notifications-status" className="text-sm text-raf-slate">On iPhone/iPad, first add this app to your Home Screen (Share → Add to Home Screen), then open it from there to enable notifications.</p>
      )}
      {status === "unsupported" && (
        <p data-testid="notifications-status" className="text-sm text-raf-slate">This device or browser doesn't support push notifications.</p>
      )}
    </div>
  );
};
