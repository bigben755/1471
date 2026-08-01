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
  CalendarDays, Award, Bell, MessageSquare, Users, Inbox, Settings, UserSearch, Megaphone, Mail, FolderOpen, Newspaper, FilePenLine, KeyRound, ClipboardList, BookOpen, LayoutGrid,
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

export const Dashboard = () => {
  const { user } = useAuth();
  const role = user.role;
  const isStaff = role === "admin" || role === "cfav";
  const isAdmin = role === "admin";
  const isUniformedCfav = role === "cfav" && !!user?.is_uniformed;
  const tabs = isStaff
    ? (isAdmin
      ? [...TABS.staff, { key: "website", label: "Website", icon: FilePenLine }, { key: "activities", label: "Activities", icon: LayoutGrid }]
      : (isUniformedCfav ? TABS.staff : TABS.cfav_non_uniformed))
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

  const tabsWithBadge = tabs.map((t) =>
    t.key === "inbox" && unread > 0 ? { ...t, badge: unread } : t);

  const render = () => {
    switch (active) {
      case "calendar": return <CalendarPanel canManage={isStaff} />;
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
      {render()}
    </PortalShell>
  );
};
