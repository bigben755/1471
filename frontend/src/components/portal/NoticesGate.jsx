import { useEffect, useState } from "react";
import { api } from "../../api";
import { Loader2, BellRing, Check } from "lucide-react";

// Forces members to read & acknowledge outstanding notices before continuing.
export const NoticesGate = ({ onCleared }) => {
  const [notices, setNotices] = useState(null);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/notices/pending")
      .then(({ data }) => {
        setNotices(data);
        if (data.length === 0) onCleared();
      })
      .catch(() => onCleared());
  }, [onCleared]);

  if (notices === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-raf-navy text-white">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (notices.length === 0) return null;

  const current = notices[idx];

  const acknowledge = async () => {
    setBusy(true);
    try {
      await api.post(`/notices/${current.id}/ack`);
      if (idx + 1 < notices.length) {
        setIdx(idx + 1);
      } else {
        onCleared();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-raf-navy px-5 relative">
      <div className="absolute inset-0 route-lines opacity-20" />
      <div data-testid="notices-gate" className="relative w-full max-w-lg bg-white border-t-4 border-raf-red">
        <div className="bg-raf-blue text-white px-6 py-4 flex items-center gap-3">
          <BellRing size={20} />
          <span className="font-display font-bold">Squadron notice</span>
          <span className="ml-auto text-xs text-raf-sky">{idx + 1} of {notices.length}</span>
        </div>
        <div className="p-7">
          <h2 className="font-display text-xl font-bold text-raf-navy">{current.title}</h2>
          <p className="mt-4 text-raf-slate leading-relaxed whitespace-pre-line">{current.body}</p>
          <button
            data-testid="notice-ack-button"
            onClick={acknowledge}
            disabled={busy}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            I have read this notice
          </button>
        </div>
      </div>
    </div>
  );
};
