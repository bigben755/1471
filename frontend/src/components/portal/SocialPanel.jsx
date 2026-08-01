import { useEffect, useState } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { Loader2, RefreshCw, ExternalLink, Info } from "lucide-react";

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.023 4.386 11.016 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.273h3.328l-.532 3.49h-2.796v8.437C19.614 23.089 24 18.096 24 12.073z" />
  </svg>
);

export const SocialPanel = () => {
  const [config, setConfig] = useState({ page_id: "", has_token: false, last_sync: null, post_count: 0 });
  const [form, setForm] = useState({ page_id: "", access_token: "" });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/facebook/config");
      setConfig(data);
      setForm((f) => ({ ...f, page_id: data.page_id }));
    } catch {
      toast.error("Could not load Facebook config.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.page_id.trim() || !form.access_token.trim()) {
      toast.error("Both page ID and access token are required.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/facebook/config", form);
      toast.success("Facebook settings saved.");
      setForm((f) => ({ ...f, access_token: "" }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post("/facebook/sync");
      toast.success(`Facebook sync complete — ${data.synced} post(s) imported.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Sync failed. Check your token and page ID.");
    } finally {
      setSyncing(false);
    }
  };

  const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-raf-slate p-10 justify-center">
        <Loader2 className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div>
      <PanelHeading
        title="Social Media"
        intro="Connect your Facebook page so posts are automatically pulled into the public news feed as articles."
      />

      {/* Connection form */}
      <div className="bg-white border border-white p-6 mb-5">
        <h3 className="font-display font-bold text-raf-navy mb-4 flex items-center gap-2">
          <span className="text-blue-600"><FacebookIcon /></span>
          Facebook page connection
        </h3>
        <div className="space-y-3 max-w-lg">
          <div>
            <label className="block text-xs text-raf-slate mb-1">
              Page ID or username
            </label>
            <input
              className={inp}
              value={form.page_id}
              onChange={(e) => setForm((f) => ({ ...f, page_id: e.target.value }))}
              placeholder="e.g. 1471HorwichRAFAC"
            />
            <p className="text-[11px] text-raf-slate mt-1">
              Found in your page URL: facebook.com/<strong>1471HorwichRAFAC</strong>
            </p>
          </div>
          <div>
            <label className="block text-xs text-raf-slate mb-1">
              Page Access Token {config.has_token && <span className="text-emerald-600 font-semibold">· Token saved</span>}
            </label>
            <input
              className={inp}
              type="password"
              value={form.access_token}
              onChange={(e) => setForm((f) => ({ ...f, access_token: e.target.value }))}
              placeholder={config.has_token ? "Paste new token to replace the saved one" : "Paste your long-lived page access token"}
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="animate-spin" size={15} />}
            Save settings
          </button>
        </div>
      </div>

      {/* Sync status */}
      <div className="bg-white border border-white p-6 mb-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-display font-bold text-raf-navy">Sync status</h3>
          <button
            onClick={sync}
            disabled={syncing || !config.has_token}
            className="inline-flex items-center gap-2 px-4 py-2 bg-raf-red text-white hover:bg-[#A00926] transition-colors disabled:opacity-50 text-sm font-semibold"
          >
            {syncing
              ? <><Loader2 className="animate-spin" size={15} /> Syncing…</>
              : <><RefreshCw size={15} /> Sync posts now</>}
          </button>
        </div>
        <dl className="text-sm grid sm:grid-cols-3 gap-4">
          <div className="bg-raf-sky/40 p-3">
            <dt className="text-xs text-raf-slate uppercase tracking-wide">Status</dt>
            <dd className={`mt-1 font-display font-bold text-lg ${config.has_token ? "text-emerald-600" : "text-raf-red"}`}>
              {config.has_token ? "Connected" : "Not configured"}
            </dd>
          </div>
          <div className="bg-raf-sky/40 p-3">
            <dt className="text-xs text-raf-slate uppercase tracking-wide">Posts cached</dt>
            <dd className="mt-1 font-display font-bold text-lg text-raf-navy">{config.post_count}</dd>
          </div>
          <div className="bg-raf-sky/40 p-3">
            <dt className="text-xs text-raf-slate uppercase tracking-wide">Last synced</dt>
            <dd className="mt-1 font-semibold text-raf-navy text-sm">
              {config.last_sync
                ? new Date(config.last_sync).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                : "Never"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-raf-slate">
          Posts are also refreshed automatically every 2 hours when the news page is visited.
        </p>
      </div>

      {/* Setup instructions */}
      <div className="bg-raf-sky/40 border border-raf-sky p-5">
        <h4 className="flex items-center gap-2 font-display font-bold text-raf-navy mb-3">
          <Info size={16} /> How to get a Page Access Token
        </h4>
        <ol className="text-sm text-raf-slate space-y-2 list-decimal list-inside leading-relaxed">
          <li>
            Go to{" "}
            <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-raf-blue underline inline-flex items-center gap-1">
              developers.facebook.com <ExternalLink size={12} />
            </a>{" "}
            and create a free app (select <strong>Business</strong> type).
          </li>
          <li>
            Open <strong>Graph API Explorer</strong>, select your app, then click{" "}
            <strong>Get Token → Page Access Token</strong> and choose your page.
          </li>
          <li>
            Add permissions: <code className="bg-white px-1 rounded text-xs">pages_read_engagement</code> and{" "}
            <code className="bg-white px-1 rounded text-xs">pages_show_list</code>.
          </li>
          <li>
            Open the{" "}
            <a href="https://developers.facebook.com/tools/debug/accesstoken/" target="_blank" rel="noreferrer" className="text-raf-blue underline inline-flex items-center gap-1">
              Access Token Debugger <ExternalLink size={12} />
            </a>{" "}
            and click <strong>Extend Access Token</strong> to generate a long-lived token (~60 days).
          </li>
          <li>Paste the long-lived token above and click <strong>Save settings</strong>, then <strong>Sync posts now</strong>.</li>
        </ol>
      </div>
    </div>
  );
};
