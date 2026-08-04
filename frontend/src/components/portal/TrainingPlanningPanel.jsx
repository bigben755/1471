import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { Loader2, Upload, CalendarDays, Lightbulb, Wrench, ShieldAlert, Download, Clock3 } from "lucide-react";

const box = "bg-white border border-white p-5";
const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

const splitCsv = (v) => (v || "").split(",").map((x) => x.trim()).filter(Boolean);

export const TrainingPlanningPanel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [busy, setBusy] = useState(false);

  const [trackerRows, setTrackerRows] = useState([]);
  const [planning, setPlanning] = useState({ availability: [], event_ideas: [], skills: [] });
  const [uniformedFilter, setUniformedFilter] = useState("all");
  const [planSlots, setPlanSlots] = useState([]);
  const [planBids, setPlanBids] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [slotEdits, setSlotEdits] = useState({});
  const [bidForSlot, setBidForSlot] = useState(null);
  const [bidForm, setBidForm] = useState({ title: "", summary: "" });
  const [pdfMonth, setPdfMonth] = useState(() => {
    const d = new Date();
    const m = d.getMonth() + 2;
    const y = d.getFullYear() + (m > 12 ? 1 : 0);
    const mm = ((m - 1) % 12) + 1;
    return `${y}-${String(mm).padStart(2, "0")}`;
  });
  const [templateMonth, setTemplateMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [availability, setAvailability] = useState({ parade_date: "", available: true, capabilities: "", note: "" });
  const [idea, setIdea] = useState({ title: "", parade_date: "", summary: "" });
  const [skills, setSkills] = useState({ skills: "", qualifications: "", interested_activities: "", willing_to_support: "", note: "" });

  const fileRef = useRef(null);

  const loadAdminData = async () => {
    if (!isAdmin) return;
    const qp = uniformedFilter === "all" ? {} : { uniformed: uniformedFilter === "uniformed" };
    const [{ data: tracker }, { data: p }, { data: slots }, { data: bids }, { data: tpls }] = await Promise.all([
      api.get("/cadet-tracker"),
      api.get("/planning/cfav-inputs", { params: qp }),
      api.get("/training-plan", { params: { months: 4 } }),
      api.get("/training-plan/bids"),
      api.get("/training-plan/templates"),
    ]);
    setTrackerRows(tracker);
    setPlanning(p);
    setPlanSlots(slots);
    setPlanBids(bids);
    setTemplates(tpls);
  };

  const loadPlanSlots = async () => {
    const { data } = await api.get("/training-plan", { params: { months: 4 } });
    setPlanSlots(data);
  };

  const loadMySkills = async () => {
    if (isAdmin) return;
    try {
      const { data } = await api.get("/cfav/skills/me");
      setSkills({
        skills: (data.skills || []).join(", "),
        qualifications: (data.qualifications || []).join(", "),
        interested_activities: (data.interested_activities || []).join(", "),
        willing_to_support: (data.willing_to_support || []).join(", "),
        note: data.note || "",
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAdminData().catch(() => {});
  }, [isAdmin, uniformedFilter]);
  useEffect(() => {
    loadMySkills();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) loadPlanSlots().catch(() => {});
  }, [isAdmin]);

  const uploadTracker = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/cadet-tracker/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Cadet tracker imported (${data.created} created, ${data.updated} updated).`);
      await loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not upload tracker.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const runAlertsNow = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/cadet-tracker/run-alerts");
      toast.success("Progression alerts run complete.", {
        description: `${data.cadet_messages} cadet message(s), ${data.admin_notifications} admin notification(s).`,
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not run alerts.");
    } finally {
      setBusy(false);
    }
  };

  const populateNextMonth = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/training-plan/populate-next-month");
      toast.success(`Training plan populated for ${data.month}.`, { description: `${data.created} slot(s) created.` });
      await loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not populate training plan.");
    } finally { setBusy(false); }
  };

  const publishMonthToCalendar = async () => {
    if (!/^\d{4}-\d{2}$/.test(pdfMonth)) { toast.error("Month must be YYYY-MM."); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/training-plan/publish-month", null, { params: { month: pdfMonth } });
      toast.success(`Training plan published to calendar for ${data.month}.`, {
        description: `${data.created} created, ${data.updated} updated, ${data.removed} removed.`,
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not publish training plan to calendar.");
    } finally { setBusy(false); }
  };

  const saveSlot = async (slot) => {
    const edit = slotEdits[slot.id] || {
      first_period_activity: slot.first_period_activity || "",
      second_period_activity: slot.second_period_activity || "",
      uniform_needed: slot.uniform_needed || "",
    };
    setBusy(true);
    try {
      await api.patch(`/training-plan/${slot.id}`, edit);
      toast.success("Training slot updated.");
      await loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update slot.");
    } finally { setBusy(false); }
  };

  const submitSlotBid = async (slot) => {
    if (!bidForm.title.trim()) { toast.error("Add a bid title."); return; }
    setBusy(true);
    try {
      await api.post(`/training-plan/${slot.id}/bid`, {
        title: bidForm.title,
        summary: bidForm.summary,
      });
      toast.success("Bid submitted for training plan slot.");
      setBidForSlot(null);
      setBidForm({ title: "", summary: "" });
      await loadPlanSlots();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not submit bid.");
    } finally { setBusy(false); }
  };

  const downloadA4 = async () => {
    setBusy(true);
    try {
      const res = await api.get("/training-plan/a4", {
        params: { month: pdfMonth, format: "html" },
        responseType: "blob",
      });
      const contentType = res.headers?.["content-type"] || "text/html";
      const blob = new Blob([res.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers?.["content-disposition"] || "";
      const m = disposition.match(/filename="?([^\"]+)"?/i);
      a.download = m?.[1] || `training-plan-${pdfMonth}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      let detail = "Could not download training plan.";
      const data = err?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (parsed?.detail) detail = parsed.detail;
        } catch {
          // Keep fallback detail
        }
      } else if (data?.detail) {
        detail = data.detail;
      }
      toast.error(detail);
    } finally { setBusy(false); }
  };

  const saveTemplate = async () => {
    if (!/^\d{4}-\d{2}$/.test(templateMonth)) { toast.error("Template month must be YYYY-MM."); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`/training-plan/templates/${templateMonth}/save`);
      toast.success(`Template saved for ${data.month}.`, { description: `${data.rows} rows captured.` });
      await loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save template.");
    } finally { setBusy(false); }
  };

  const applyTemplate = async () => {
    if (!/^\d{4}-\d{2}$/.test(templateMonth)) { toast.error("Template month must be YYYY-MM."); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`/training-plan/templates/${templateMonth}/apply`);
      toast.success(`Template applied for ${data.month}.`, { description: `${data.updated} slots updated.` });
      await loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not apply template.");
    } finally { setBusy(false); }
  };

  const acceptBid = async (bid, period) => {
    setBusy(true);
    try {
      await api.post(`/training-plan/${bid.slot_id}/bids/${bid.id}/accept`, { period });
      toast.success(`Bid accepted into ${period === "second" ? "second" : "first"} period.`);
      await loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not accept bid.");
    } finally { setBusy(false); }
  };

  const submitAvailability = async () => {
    if (!availability.parade_date) { toast.error("Choose a parade date."); return; }
    setBusy(true);
    try {
      await api.post("/cfav/availability", {
        parade_date: availability.parade_date,
        available: availability.available,
        capabilities: splitCsv(availability.capabilities),
        note: availability.note,
      });
      toast.success("Availability submitted.");
      setAvailability({ parade_date: "", available: true, capabilities: "", note: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not submit availability.");
    } finally { setBusy(false); }
  };

  const submitIdea = async () => {
    if (!idea.title.trim()) { toast.error("Add an event idea title."); return; }
    setBusy(true);
    try {
      await api.post("/cfav/event-ideas", idea);
      toast.success("Event proposal submitted.");
      setIdea({ title: "", parade_date: "", summary: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not submit event idea.");
    } finally { setBusy(false); }
  };

  const submitSkills = async () => {
    setBusy(true);
    try {
      await api.post("/cfav/skills", {
        skills: splitCsv(skills.skills),
        qualifications: splitCsv(skills.qualifications),
        interested_activities: splitCsv(skills.interested_activities),
        willing_to_support: splitCsv(skills.willing_to_support),
        note: skills.note,
      });
      toast.success("Skill matrix saved.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save skill matrix.");
    } finally { setBusy(false); }
  };

  const topCadets = useMemo(() => trackerRows.slice(0, 60), [trackerRows]);
  const groupedByMonth = useMemo(() => {
    const map = new Map();
    planSlots.forEach((s) => {
      const m = (s.slot_date || "").slice(0, 7);
      if (!map.has(m)) map.set(m, []);
      map.get(m).push(s);
    });
    return Array.from(map.entries());
  }, [planSlots]);

  return (
    <div>
      <PanelHeading
        title="Training & Planning"
        intro={isAdmin
          ? "Cadet tracker import, progression monitoring, and CFAV planning inputs."
          : "Submit availability, event ideas, and your skills to support parade-night planning."}
      />

      {isAdmin && (
        <>
          <div className={`${box} mb-5`}>
            <div className="flex flex-wrap items-center gap-2 justify-between mb-3">
              <h3 className="font-display font-bold text-raf-navy">Training plan builder</h3>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={populateNextMonth} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">
                  <CalendarDays size={16} /> Populate next month
                </button>
                <input value={templateMonth} onChange={(e) => setTemplateMonth(e.target.value)} className={inp} placeholder="Template YYYY-MM" />
                <button type="button" onClick={saveTemplate} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">
                  Save template
                </button>
                <button type="button" onClick={applyTemplate} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors disabled:opacity-60">
                  Apply template
                </button>
                <input value={pdfMonth} onChange={(e) => setPdfMonth(e.target.value)} className={inp} placeholder="YYYY-MM" />
                <button type="button" onClick={publishMonthToCalendar} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors disabled:opacity-60">
                  <CalendarDays size={16} /> Publish to calendar
                </button>
                <button type="button" onClick={downloadA4} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-red text-white hover:bg-[#A00926] transition-colors disabled:opacity-60">
                  <Download size={16} /> Download A4 plan
                </button>
              </div>
            </div>

            {templates.length > 0 && (
              <div className="mb-3 text-xs text-raf-slate">
                Saved templates: {templates.slice(0, 8).map((t) => t.month).join(", ")}
              </div>
            )}

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {groupedByMonth.map(([month, rows]) => (
                <div key={month} className="border border-raf-sky p-3">
                  <div className="font-semibold text-raf-navy mb-2">{month}</div>
                  <div className="space-y-2">
                    {rows.map((slot) => {
                      const edit = slotEdits[slot.id] || {
                        first_period_activity: slot.first_period_activity || "",
                        second_period_activity: slot.second_period_activity || "",
                        uniform_needed: slot.uniform_needed || "",
                      };
                      return (
                        <div key={slot.id} className={`border p-2 ${slot.no_parade ? "bg-amber-50 border-amber-300" : "border-raf-sky"}`}>
                          <div className="text-xs text-raf-slate mb-2">{slot.day_label} {slot.slot_date} {slot.no_parade ? `· ${slot.no_parade_reason}` : ""}</div>
                          <div className="grid md:grid-cols-4 gap-2">
                            <input className={inp} placeholder="First period" value={edit.first_period_activity} onChange={(e) => setSlotEdits((s) => ({ ...s, [slot.id]: { ...edit, first_period_activity: e.target.value } }))} />
                            <input className={inp} placeholder="Second period" value={edit.second_period_activity} onChange={(e) => setSlotEdits((s) => ({ ...s, [slot.id]: { ...edit, second_period_activity: e.target.value } }))} />
                            <input className={inp} placeholder="Uniform needed" value={edit.uniform_needed} onChange={(e) => setSlotEdits((s) => ({ ...s, [slot.id]: { ...edit, uniform_needed: e.target.value } }))} />
                            <button type="button" onClick={() => saveSlot(slot)} disabled={busy || slot.no_parade} className="px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">Save slot</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${box} mb-5`}>
            <h3 className="font-display font-bold text-raf-navy mb-2">Cadet status tracker import</h3>
            <p className="text-xs text-raf-slate mb-3">Drag and drop or choose a tracker file (.xlsx or .csv). Rank, classification and major badges are extracted and displayed below.</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => uploadTracker(e.target.files?.[0])} />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); uploadTracker(e.dataTransfer.files?.[0]); }}
              className="border border-dashed border-raf-sky p-5 text-center"
            >
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Upload tracker
              </button>
            </div>
            <button type="button" onClick={runAlertsNow} disabled={busy} className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-raf-red text-white hover:bg-[#A00926] transition-colors disabled:opacity-60">
              <ShieldAlert size={16} /> Run progression alerts now
            </button>
          </div>

          <div className={`${box} mb-5`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-display font-bold text-raf-navy">Cadet progression highlights</h3>
              <span className="text-xs text-raf-slate">{trackerRows.length} cadet records</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {topCadets.map((c) => (
                <div key={c.tracker_key} className="border border-raf-sky p-3 bg-white">
                  <div className="font-semibold text-raf-navy">{c.name}</div>
                  <div className="mt-1 text-xs text-raf-slate">Rank: <strong className="text-raf-navy">{c.rank || "-"}</strong></div>
                  <div className="text-xs text-raf-slate">Classification: <strong className="text-raf-navy">{c.classification || "-"}</strong></div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(c.major_badges || []).slice(0, 6).map((b) => (
                      <span key={b} className="text-[10px] px-2 py-0.5 bg-raf-sky text-raf-blue">{b}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={box}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-display font-bold text-raf-navy">CFAV planning inputs</h3>
              <select className={inp} value={uniformedFilter} onChange={(e) => setUniformedFilter(e.target.value)}>
                <option value="all">All CFAV</option>
                <option value="uniformed">Uniformed only</option>
                <option value="non_uniformed">Non-uniformed only</option>
              </select>
            </div>
            <div className="grid lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-raf-navy mb-2">Availability ({planning.availability.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {planning.availability.map((a) => (
                    <div key={a.id} className="border border-raf-sky p-2">
                      <div className="font-medium">{a.cfav_name}</div>
                      <div className="text-xs text-raf-slate">{a.parade_date} · {a.available ? "Available" : "Unavailable"}</div>
                      <div className="text-xs text-raf-slate">{(a.capabilities || []).join(", ")}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-raf-navy mb-2">Event ideas ({planning.event_ideas.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {planning.event_ideas.map((e) => (
                    <div key={e.id} className="border border-raf-sky p-2">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-raf-slate">{e.cfav_name} · {e.parade_date || "No date suggested"}</div>
                      <div className="text-xs text-raf-slate">{e.summary}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-raf-navy mb-2">Skill matrix ({planning.skills.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {planning.skills.map((s) => (
                    <div key={s.cfav_id} className="border border-raf-sky p-2">
                      <div className="font-medium">{s.cfav_name}</div>
                      <div className="text-xs text-raf-slate">Skills: {(s.skills || []).join(", ") || "-"}</div>
                      <div className="text-xs text-raf-slate">Interested in: {(s.interested_activities || []).join(", ") || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-raf-navy mb-2">Training plan bids ({planBids.length})</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {planBids.map((b) => (
                  <div key={b.id} className="border border-raf-sky p-2 text-xs">
                    <div className="font-semibold text-raf-navy">{b.slot_date} · {b.title}</div>
                    <div className="text-raf-slate">{b.cfav_name} {b.is_uniformed ? "(uniformed)" : "(non-uniformed)"}</div>
                    <div className="text-raf-slate">{b.summary}</div>
                    {b.status !== "accepted" && (
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => acceptBid(b, "first")} disabled={busy} className="px-2 py-1 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">Accept as Period 1</button>
                        <button type="button" onClick={() => acceptBid(b, "second")} disabled={busy} className="px-2 py-1 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors disabled:opacity-60">Accept as Period 2</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {!isAdmin && (
        <div className="space-y-5">
          <div className={box}>
            <h3 className="font-display font-bold text-raf-navy mb-2 flex items-center gap-2"><Clock3 size={17} /> Training plan slots (months 1-3)</h3>
            <p className="text-xs text-raf-slate mb-3">You can bid/suggest activities for training plan slots in months 1 to 3 ahead. Bank holidays are marked as no parade.</p>
            <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
              {planSlots.map((slot) => (
                <div key={slot.id} className={`border p-3 ${slot.no_parade ? "bg-amber-50 border-amber-300" : "border-raf-sky"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-raf-navy text-sm">{slot.day_label} {slot.slot_date}</div>
                      <div className="text-xs text-raf-slate">{slot.no_parade ? slot.no_parade_reason : `P1: ${slot.first_period_activity || "TBC"} · P2: ${slot.second_period_activity || "TBC"} · Uniform: ${slot.uniform_needed || "TBC"}`}</div>
                    </div>
                    {slot.can_bid && (
                      <button type="button" onClick={() => { setBidForSlot(slot.id); setBidForm({ title: "", summary: "" }); }} className="px-3 py-1.5 text-xs bg-raf-blue text-white hover:bg-raf-navy transition-colors">
                        Bid this slot
                      </button>
                    )}
                  </div>
                  {bidForSlot === slot.id && (
                    <div className="mt-2 grid md:grid-cols-[1fr_1fr_auto] gap-2">
                      <input className={inp} placeholder="Activity to run" value={bidForm.title} onChange={(e) => setBidForm((f) => ({ ...f, title: e.target.value }))} />
                      <input className={inp} placeholder="Summary / equipment / support needed" value={bidForm.summary} onChange={(e) => setBidForm((f) => ({ ...f, summary: e.target.value }))} />
                      <button type="button" onClick={() => submitSlotBid(slot)} disabled={busy} className="px-4 py-2.5 bg-raf-red text-white hover:bg-[#A00926] transition-colors disabled:opacity-60">Send bid</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className={box}>
            <h3 className="font-display font-bold text-raf-navy mb-2 flex items-center gap-2"><CalendarDays size={17} /> Availability</h3>
            <input type="date" className={`${inp} mb-2`} value={availability.parade_date} onChange={(e) => setAvailability({ ...availability, parade_date: e.target.value })} />
            <select className={`${inp} mb-2`} value={availability.available ? "yes" : "no"} onChange={(e) => setAvailability({ ...availability, available: e.target.value === "yes" })}>
              <option value="yes">Available</option>
              <option value="no">Unavailable</option>
            </select>
            <input className={`${inp} mb-2`} placeholder="Capabilities this night (comma separated)" value={availability.capabilities} onChange={(e) => setAvailability({ ...availability, capabilities: e.target.value })} />
            <textarea className={inp} rows={3} placeholder="Note" value={availability.note} onChange={(e) => setAvailability({ ...availability, note: e.target.value })} />
            <button onClick={submitAvailability} disabled={busy} className="mt-3 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">Submit availability</button>
          </div>

            <div className={box}>
            <h3 className="font-display font-bold text-raf-navy mb-2 flex items-center gap-2"><Lightbulb size={17} /> Event proposal</h3>
            <input className={`${inp} mb-2`} placeholder="I'd like to plan..." value={idea.title} onChange={(e) => setIdea({ ...idea, title: e.target.value })} />
            <input type="date" className={`${inp} mb-2`} value={idea.parade_date} onChange={(e) => setIdea({ ...idea, parade_date: e.target.value })} />
            <textarea className={inp} rows={4} placeholder="Outline and requirements" value={idea.summary} onChange={(e) => setIdea({ ...idea, summary: e.target.value })} />
            <button onClick={submitIdea} disabled={busy} className="mt-3 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">Submit event idea</button>
          </div>

            <div className={box}>
            <h3 className="font-display font-bold text-raf-navy mb-2 flex items-center gap-2"><Wrench size={17} /> Skill matrix</h3>
            <input className={`${inp} mb-2`} placeholder="Skills (comma separated)" value={skills.skills} onChange={(e) => setSkills({ ...skills, skills: e.target.value })} />
            <input className={`${inp} mb-2`} placeholder="Qualifications" value={skills.qualifications} onChange={(e) => setSkills({ ...skills, qualifications: e.target.value })} />
            <input className={`${inp} mb-2`} placeholder="Activities you want to support" value={skills.interested_activities} onChange={(e) => setSkills({ ...skills, interested_activities: e.target.value })} />
            <input className={`${inp} mb-2`} placeholder="Events/activities willing to run" value={skills.willing_to_support} onChange={(e) => setSkills({ ...skills, willing_to_support: e.target.value })} />
            <textarea className={inp} rows={3} placeholder="Additional notes" value={skills.note} onChange={(e) => setSkills({ ...skills, note: e.target.value })} />
            <button onClick={submitSkills} disabled={busy} className="mt-3 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">Save skill matrix</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
