import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TutorCertification from "./pages/TutorCertification";
import TutorSearchPage from "./pages/TutorSearchPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentSearch from "./pages/StudentSearch";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/tutor/certification" element={<TutorCertification />} />
        <Route path="/tutor-search" element={<TutorSearchPage />} />
        <Route path="/student-search" element={<StudentSearch />} />
        <Route path="/student-profile" element={<StudentProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
