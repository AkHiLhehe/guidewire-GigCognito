import { Routes, Route } from "react-router-dom";
import Onboarding from "../pages/Onboarding/Onboarding";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
    </Routes>
  );
}
