import { useEffect, useState } from "react";
import { api } from "../../api";
import { Loader2, BellRing, Check } from "lucide-react";

// Forces members to read and acknowledge outstanding notices before continuing.
export const NoticesGate = ({ onCleared }) => {
  const [notices, setNotices] = useState(null);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPendingNotices = async () => {
      try {
        const { data } = await api.get("/notices/pending");

        if (!active) return;

        const pendingNotices = Array.isArray(data) ? data : [];
        setNotices(pendingNotices);

        if (pendingNotices.length === 0) {
          onCleared?.();
        }
      } catch {
        if (!active) return;

        // Do not prevent portal access if notices cannot be loaded.
        setNotices([]);
        onCleared?.();
      }
    };

    loadPendingNotices();

    return () => {
      active = false;
    };
  }, [onCleared]);

  const acknowledge = async () => {
    const current = notices?.[idx];

    if (!current || busy) return;

    setBusy(true);

    try {
      await api.post(`/notices/${current.id}/ack`);

      const nextIndex = idx + 1;

      if (nextIndex < notices.length) {
        setIdx(nextIndex);
      } else {
        onCleared?.();
      }
    } finally {
      setBusy(false);
    }
  };

  if (notices === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-raf-navy text-white">
        <Loader2 className="animate-spin" aria-label="Loading notices" />
      </div>
    );
  }

  if (notices.length === 0) {
    return null;
  }

  const current = notices[idx];

  if (!current) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-raf-navy px-5 relative">
      <div
        className="absolute inset-0 route-lines opacity-20"
        aria-hidden="true"
      />

      <div
        data-testid="notices-gate"
        className="relative w-full max-w-lg bg-white border-t-4 border-raf-red"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-gate-title"
        aria-describedby="notice-gate-body"
      >
        <div className="bg-raf-blue text-white px-6 py-4 flex items-center gap-3">
          <BellRing size={20} aria-hidden="true" />

          <span className="font-display font-bold">
            Squadron notice
          </span>

          <span className="ml-auto text-xs text-raf-sky">
            {idx + 1} of {notices.length}
          </span>
        </div>

        <div className="p-7">
          <h2
            id="notice-gate-title"
            className="font-display text-xl font-bold text-raf-navy"
          >
            {current.title}
          </h2>

          <p
            id="notice-gate-body"
            className="mt-4 text-raf-slate leading-relaxed whitespace-pre-line"
          >
            {current.body}
          </p>

          <button
            data-testid="notice-ack-button"
            type="button"
            onClick={acknowledge}
            disabled={busy}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? (
              <Loader2
                className="animate-spin"
                size={18}
                aria-hidden="true"
              />
            ) : (
              <Check size={18} aria-hidden="true" />
            )}

            {busy ? "Acknowledging..." : "I have read this notice"}
          </button>
        </div>
      </div>
    </div>
  );
};