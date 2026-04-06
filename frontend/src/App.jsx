import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SessionBooking from "./pages/SessionBooking";
import TutorCertification from "./pages/TutorCertification";
import StudentSearch from "./pages/StudentSearch";
import EnhancedSearchPage from "./pages/EnhancedSearchPage";
import TutorSearchPage from "./pages/TutorSearchPage";
import StudentEnhancedSearch from "./pages/StudentEnhancedSearch";
import StudentGames from "./pages/StudentGames";
import StudentProfilePage from "./pages/StudentProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<SessionBooking />} />
        <Route path="/tutor/certification" element={<TutorCertification />} />
        <Route path="/search" element={<StudentSearch />} />
        <Route path="/enhanced-search" element={<EnhancedSearchPage />} />
        <Route path="/tutor-search" element={<TutorSearchPage />} />
        <Route path="/student-search" element={<StudentEnhancedSearch />} />
        <Route path="/games" element={<StudentGames />} />
        <Route path="/student-profile" element={<StudentProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;