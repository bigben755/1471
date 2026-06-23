import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/site/Layout";
import Home from "@/pages/site/Home";
import AboutPage from "@/pages/site/AboutPage";
import ActivitiesPage from "@/pages/site/ActivitiesPage";
import ActivityDetailPage from "@/pages/site/ActivityDetailPage";
import CadetsPage from "@/pages/site/CadetsPage";
import ParentsPage from "@/pages/site/ParentsPage";
import VolunteerPage from "@/pages/site/VolunteerPage";
import FaqPage from "@/pages/site/FaqPage";
import JoinPage from "@/pages/site/JoinPage";
import Portal from "@/pages/Portal";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:slug" element={<ActivityDetailPage />} />
            <Route path="/cadets" element={<CadetsPage />} />
            <Route path="/parents" element={<ParentsPage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/join" element={<JoinPage />} />
          </Route>
          <Route path="/portal" element={<Portal />} />
          <Route path="/admin" element={<Navigate to="/portal" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
