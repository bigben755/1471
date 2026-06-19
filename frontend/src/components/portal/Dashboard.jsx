import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PortalShell } from "./PortalShell";
import { CalendarPanel } from "./CalendarPanel";
import { PointsPanel } from "./PointsPanel";
import { NoticesPanel } from "./NoticesPanel";
import { MessagesPanel } from "./MessagesPanel";
import { StaffMessagesPanel } from "./StaffMessagesPanel";
import { AccountPanel } from "./AccountPanel";
import { ManageUsersPanel } from "./ManageUsersPanel";
import { EnquiriesPanel } from "./EnquiriesPanel";
import {
  CalendarDays, Award, Bell, MessageSquare, UserCog, Users, Inbox, Settings,
} from "lucide-react";

const TABS = {
  cadet: [
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "points", label: "Points", icon: Award },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "account", label: "Account", icon: Settings },
  ],
  parent: [
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "account", label: "Account", icon: Settings },
  ],
  staff: [
    { key: "calendar", label: "Events", icon: CalendarDays },
    { key: "members", label: "Members", icon: Users },
    { key: "notices", label: "Notices", icon: Bell },
    { key: "enquiries", label: "Enquiries", icon: Inbox },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "account", label: "Account", icon: Settings },
  ],
};

export const Dashboard = () => {
  const { user } = useAuth();
  const role = user.role;
  const isStaff = role === "admin" || role === "cfav";
  const tabs = isStaff ? TABS.staff : TABS[role];
  const [active, setActive] = useState(tabs[0].key);

  const render = () => {
    switch (active) {
      case "calendar": return <CalendarPanel canManage={isStaff} />;
      case "points": return <PointsPanel />;
      case "notices": return <NoticesPanel canManage={isStaff} />;
      case "messages": return isStaff ? <StaffMessagesPanel /> : <MessagesPanel />;
      case "members": return <ManageUsersPanel />;
      case "enquiries": return <EnquiriesPanel />;
      case "account": return <AccountPanel />;
      default: return null;
    }
  };

  return (
    <PortalShell tabs={tabs} active={active} onTab={setActive}>
      {render()}
    </PortalShell>
  );
};
