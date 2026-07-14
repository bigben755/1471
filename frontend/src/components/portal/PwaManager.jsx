import { useEffect, useState } from "react";
import { toast } from "sonner";
import { enablePush, pushSupported, isStandalone, isIOS, refreshBadge } from "../../pwa";
import { Bell, Download, Share, X, Plus } from "lucide-react";

const DISMISS_KEY = "pwa_banner_dismissed";

export const PwaManager = () => {
  const [installable, setInstallable] = useState(!!window.__deferredPrompt);
  const [notifState, setNotifState] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [dismissed, setDismissed] = useState(localStorage.getItem(DISMISS_KEY) === "1");
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    refreshBadge();
    const onInstallable = () => setInstallable(true);
    window.addEventListener("pwa-installable", onInstallable);
    return () => window.removeEventListener("pwa-installable", onInstallable);
  }, []);

  const standalone = isStandalone();
  const ios = isIOS();
  const canPrompt = notifState === "default" && pushSupported() && (standalone || !ios);
  const showInstall = !standalone && (installable || ios);
  const showBanner = !dismissed && (showInstall || canPrompt);

  if (!showBanner) return null;

  const dismiss = () => { localStorage.setItem(DISMISS_KEY, "1"); setDismissed(true); };

  const install = async () => {
    if (ios && !installable) { setIosHelp(true); return; }
    const dp = window.__deferredPrompt;
    if (!dp) return;
    dp.prompt();
    await dp.userChoice;
    window.__deferredPrompt = null;
    setInstallable(false);
  };

  const turnOnNotifications = async () => {
    const res = await enablePush();
    if (res.ok) { toast.success("Notifications on — you'll be alerted here and on your device."); setNotifState("granted"); refreshBadge(); }
    else if (res.reason === "denied") toast.error("Notifications are blocked. You can allow them in your browser settings.");
    else if (res.reason === "disabled") toast.error("Push isn't configured on the server yet.");
    else if (res.reason === "error") toast.error("Couldn't turn on notifications. If you're in private browsing, try a normal window.");
    else toast.error("This device or browser doesn't support notifications.");
  };

  return (
    <div data-testid="pwa-banner" className="mb-6 bg-raf-navy text-white border-l-4 border-raf-red p-4 flex flex-wrap items-center gap-3">
      <Bell size={18} className="text-raf-sky shrink-0" />
      <div className="flex-1 min-w-[180px] text-sm">
        <span className="font-semibold">Get the squadron app.</span>{" "}
        <span className="text-raf-sky/90">Add it to your home screen and turn on notifications so you never miss an event or notice.</span>
      </div>
      <div className="flex items-center gap-2">
        {showInstall && (
          <button data-testid="pwa-install-btn" onClick={install} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-white text-raf-navy font-semibold hover:bg-raf-sky transition-colors">
            <Download size={15} /> Install app
          </button>
        )}
        {canPrompt && (
          <button data-testid="pwa-notify-btn" onClick={turnOnNotifications} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
            <Bell size={15} /> Turn on notifications
          </button>
        )}
        <button data-testid="pwa-dismiss" onClick={dismiss} className="p-2 text-raf-sky hover:text-white transition-colors"><X size={16} /></button>
      </div>

      {iosHelp && (
        <div data-testid="ios-install-help" className="w-full mt-2 bg-white/10 p-3 text-sm text-raf-sky/95 flex items-center gap-2">
          <Share size={16} className="shrink-0" />
          On iPhone/iPad: tap the <strong className="mx-1 text-white">Share</strong> button, then <span className="mx-1 inline-flex items-center gap-1 text-white"><Plus size={13} /> Add to Home Screen</span>. Open the app from your home screen, then turn on notifications.
        </div>
      )}
    </div>
  );
};
