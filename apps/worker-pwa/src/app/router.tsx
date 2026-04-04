import { Routes, Route, Navigate } from "react-router-dom";
import Onboarding from "../pages/Onboarding/Onboarding";
import Dashboard from "../pages/Dashboard/Dashboard";
import Policy from "../pages/Policy/Policy";
import Claims from "../pages/Claims/Claims";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/claims" element={<Claims />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}