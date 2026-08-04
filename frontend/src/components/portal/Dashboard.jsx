import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import { PortalShell } from "./PortalShell";
import { CalendarPanel } from "./CalendarPanel";
import { PointsPanel } from "./PointsPanel";
import { NoticesPanel } from "./NoticesPanel";
import { MessagesPanel } from "./MessagesPanel";
import { StaffMessagesPanel } from "./StaffMessagesPanel";
import { AccountPanel } from "./AccountPanel";
import { ManageUsersPanel } from "./ManageUsersPanel";
import { EnquiriesPanel } from "./EnquiriesPanel";
import { RecruitmentPanel } from "./RecruitmentPanel";
import { CommsPanel } from "./CommsPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { DocumentsPanel } from "./DocumentsPanel";
import { MemberDocumentsPanel } from "./MemberDocumentsPanel";
import { BlogAdminPanel } from "./BlogAdminPanel";
import { MemberNewsPanel } from "./MemberNewsPanel";
import { PwaManager } from "./PwaManager";
import { SiteContentPanel } from "./SiteContentPanel";
import { SmsSupportPanel } from "./SmsSupportPanel";
import { TrainingPlanningPanel } from "./TrainingPlanningPanel";
import { DofEDiaryPanel } from "./DofEDiaryPanel";
import { CustomActivitiesPanel } from "./CustomActivitiesPanel";
import {
  CalendarDays, Award, Bell, MessageSquare, Users, Inbox, Settings, UserSearch, Megaphone, Mail, FolderOpen, Newspaper, FilePenLine, KeyRound, ClipboardList, BookOpen, LayoutGrid, ExternalLink, CheckCircle2,
} from "lucide-react";

const TABS = {
  cadet: [
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "points", label: "Points", icon: Award },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "documents", label: "Documents", icon: FolderOpen },
    { key: "news", label: "News", icon: Newspaper },
    { key: "inbox", label: "Inbox", icon: Mail },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "account", label: "Account", icon: Settings },
  ],
  cadet_dofe: [
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "points", label: "Points", icon: Award },
    { key: "dofe", label: "DofE Diary", icon: BookOpen },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "documents", label: "Documents", icon: FolderOpen },
    { key: "news", label: "News", icon: Newspaper },
    { key: "inbox", label: "Inbox", icon: Mail },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "account", label: "Account", icon: Settings },
  ],
  parent: [
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "dofe", label: "Cadet Diary", icon: BookOpen },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "documents", label: "Documents", icon: FolderOpen },
    { key: "news", label: "News", icon: Newspaper },
    { key: "inbox", label: "Inbox", icon: Mail },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "account", label: "Account", icon: Settings },
  ],
  staff: [
    { key: "calendar", label: "Events", icon: CalendarDays },
    { key: "members", label: "Members", icon: Users },
    { key: "training", label: "Training", icon: ClipboardList },
    { key: "recruitment", label: "Recruitment", icon: UserSearch },
    { key: "sms_support", label: "SMS Support", icon: KeyRound },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "documents", label: "Documents", icon: FolderOpen },
    { key: "news", label: "News", icon: Newspaper },
    { key: "comms", label: "Comms", icon: Megaphone },
    { key: "enquiries", label: "Enquiries", icon: Inbox },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "inbox", label: "Inbox", icon: Mail },
    { key: "account", label: "Account", icon: Settings },
  ],
  cfav_non_uniformed: [
    { key: "calendar", label: "Events", icon: CalendarDays },
    { key: "training", label: "Training", icon: ClipboardList },
    { key: "sms_support", label: "SMS Support", icon: KeyRound },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "documents", label: "Documents", icon: FolderOpen },
    { key: "news", label: "News", icon: Newspaper },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "inbox", label: "Inbox", icon: Mail },
    { key: "account", label: "Account", icon: Settings },
  ],
};

const APPOINTMENT_TAB_ACCESS = {
  training_officer: ["training", "calendar", "documents", "messages", "inbox", "account"],
  adjutant: ["comms", "documents", "enquiries", "sms_support", "calendar", "messages", "inbox", "account"],
  stores_officer: ["documents", "calendar", "messages", "inbox", "account"],
  oc: ["members", "training", "recruitment", "sms_support", "notices", "documents", "news", "comms", "enquiries", "messages", "inbox", "account"],
  deputy_oc: ["members", "training", "recruitment", "sms_support", "notices", "documents", "news", "comms", "enquiries", "messages", "inbox", "account"],
  health_safety_officer: ["calendar", "notices", "documents", "messages", "inbox", "account"],
};

const mergeTabs = (baseTabs, extraKeys) => {
  const byKey = new Map(baseTabs.map((tab) => [tab.key, tab]));
  extraKeys.forEach((key) => {
    if (byKey.has(key)) return;
    const found = Object.values(TABS).flat().find((tab) => tab.key === key);
    if (found) byKey.set(found.key, found);
  });
  return Array.from(byKey.values());
};

const CadetOnboardingCard = ({ user, onNavigateTab }) => {
  if (user?.role !== "cadet") return null;
  const step1Done = !!user?.login_username;
  const step2Done = !user?.must_change_password;
  return (
    <div className="mb-5 bg-white border border-white p-4 md:p-5" data-testid="cadet-onboarding-card">
      <h2 className="font-display font-bold text-raf-navy text-lg">Cadet quick start</h2>
      <p className="text-sm text-raf-slate mt-1">Complete these steps to get fully set up.</p>
      <div className="mt-3 grid md:grid-cols-3 gap-2 text-sm">
        <div className="border border-raf-sky p-3">
          <div className="font-semibold text-raf-navy">1. Check your username</div>
          <div className="text-xs text-raf-slate mt-1">
            {step1Done ? `Username: ${user.login_username}` : "Open your account details."}
          </div>
          <button onClick={() => onNavigateTab("account")} className="mt-2 text-xs text-raf-blue hover:underline">Open account</button>
        </div>
        <div className="border border-raf-sky p-3">
          <div className="font-semibold text-raf-navy">2. Change password</div>
          <div className={`text-xs mt-1 ${step2Done ? "text-emerald-700" : "text-amber-700"}`}>
            {step2Done ? "Password changed" : "Use default once, then change it"}
          </div>
          <button onClick={() => onNavigateTab("account")} className="mt-2 text-xs text-raf-blue hover:underline">Change password</button>
        </div>
        <div className="border border-raf-sky p-3">
          <div className="font-semibold text-raf-navy">3. Open Cadet Portal</div>
          <div className="text-xs text-raf-slate mt-1">Use it for event and cadet system access.</div>
          <button
            onClick={() => window.open("https://cadets.bader.mod.uk/", "_blank", "noopener,noreferrer")}
            className="mt-2 inline-flex items-center gap-1 text-xs text-raf-blue hover:underline"
          >
            <ExternalLink size={12} /> Open Cadet Portal
          </button>
        </div>
      </div>
      {!step2Done && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1.5">
          <CheckCircle2 size={13} />
          If you do not know your login details, use Messages to ask squadron staff.
        </div>
      )}
    </div>
  );
};

const StaffAccessCard = ({ user, onNavigateTab }) => {
  if (!user || (user.role !== "admin" && user.role !== "cfav")) return null;
  return (
    <div className="mb-5 bg-white border border-white p-4 md:p-5" data-testid="staff-sms-access-card">
      <h2 className="font-display font-bold text-raf-navy text-lg">SMS access</h2>
      <p className="text-sm text-raf-slate mt-1">Open the squadron SMS portal from here and use the login details below.</p>
      <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
        <div className="border border-raf-sky p-3">
          <div className="font-semibold text-raf-navy">Role login</div>
          <div className="text-xs text-raf-slate mt-1">Username: 1471</div>
          <div className="text-xs text-raf-slate">Password: usual password 2023</div>
        </div>
        <div className="border border-raf-sky p-3">
          <div className="font-semibold text-raf-navy">Personal login</div>
          <div className="text-xs text-raf-slate mt-1">Username: surname initial, e.g. baderd</div>
          <div className="text-xs text-raf-slate">Password: you should know this. If not, contact OC for a reset.</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href="https://sms.bader.mod.uk/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-raf-red text-white hover:bg-[#A00926] transition-colors">
          Open SMS
        </a>
        <button onClick={() => onNavigateTab("sms_support")} className="inline-flex items-center gap-2 px-4 py-2.5 border border-raf-blue text-raf-blue hover:bg-raf-blue hover:text-white transition-colors">
          SMS support in dashboard
        </button>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isStaff = role === "admin" || role === "cfav";
  const isAdmin = role === "admin";
  const isUniformedCfav = role === "cfav" && !!user?.is_uniformed;
  const appointmentTabs = Array.from(new Set(
    (user?.appointments || []).flatMap((key) => APPOINTMENT_TAB_ACCESS[key] || []),
  ));
  const tabs = isStaff
    ? mergeTabs(
      isAdmin
        ? [...TABS.staff, { key: "website", label: "Website", icon: FilePenLine }, { key: "activities", label: "Activities", icon: LayoutGrid }]
        : (isUniformedCfav ? TABS.staff : TABS.cfav_non_uniformed),
      appointmentTabs,
    )
    : (role === "cadet" && user?.dofe_level ? TABS.cadet_dofe : TABS[role]);
  const [active, setActive] = useState(tabs[0].key);
  const [unread, setUnread] = useState(0);

  const loadUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnread(data.count);
      if ("setAppBadge" in navigator) {
        if (data.count > 0) navigator.setAppBadge(data.count);
        else if (navigator.clearAppBadge) navigator.clearAppBadge();
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadUnread();
    const t = setInterval(loadUnread, 30000);
    return () => clearInterval(t);
  }, [loadUnread]);

  useEffect(() => {
    if (tabs.length === 0) return;
    if (!tabs.some((t) => t.key === active)) {
      setActive(tabs[0].key);
    }
  }, [tabs, active]);

  const tabsWithBadge = tabs.map((t) =>
    t.key === "inbox" && unread > 0 ? { ...t, badge: unread } : t);

  const render = () => {
    switch (active) {
      case "calendar": return <CalendarPanel canManage={isStaff} onNavigateTab={setActive} />;
      case "points": return <PointsPanel />;
      case "notices": return <NoticesPanel canManage={isStaff} />;
      case "messages": return isStaff ? <StaffMessagesPanel /> : <MessagesPanel />;
      case "members": return <ManageUsersPanel />;
      case "training": return <TrainingPlanningPanel />;
      case "dofe": return <DofEDiaryPanel />;
      case "recruitment": return <RecruitmentPanel />;
      case "sms_support": return <SmsSupportPanel />;
      case "comms": return <CommsPanel />;
      case "documents": return isStaff ? <DocumentsPanel /> : <MemberDocumentsPanel />;
      case "news": return isStaff ? <BlogAdminPanel /> : <MemberNewsPanel />;
      case "enquiries": return <EnquiriesPanel />;
      case "inbox": return <NotificationsPanel onRead={() => { setUnread(0); if (navigator.clearAppBadge) navigator.clearAppBadge(); }} />;
      case "account": return <AccountPanel />;
      case "website": return <SiteContentPanel />;
      case "activities": return <CustomActivitiesPanel />;
      default: return null;
    }
  };

  return (
    <PortalShell tabs={tabsWithBadge} active={active} onTab={setActive}>
      <PwaManager />
      <StaffAccessCard user={user} onNavigateTab={setActive} />
      <CadetOnboardingCard user={user} onNavigateTab={setActive} />
      {render()}
    </PortalShell>
  );
};
