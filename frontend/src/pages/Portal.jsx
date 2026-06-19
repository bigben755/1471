import { useState, useCallback } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SignIn } from "../components/portal/SignIn";
import { NoticesGate } from "../components/portal/NoticesGate";
import { Dashboard } from "../components/portal/Dashboard";
import { Loader2 } from "lucide-react";

function PortalInner() {
  const { user, loading } = useAuth();
  const [gateCleared, setGateCleared] = useState(false);
  const onCleared = useCallback(() => setGateCleared(true), []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-raf-navy text-white"><Loader2 className="animate-spin" /></div>;
  }
  if (!user) return <SignIn />;
  if (!gateCleared) return <NoticesGate onCleared={onCleared} />;
  return <Dashboard />;
}

export default function Portal() {
  return (
    <AuthProvider>
      <PortalInner />
    </AuthProvider>
  );
}
