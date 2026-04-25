import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuizCreation from "./pages/AdminQuizCreation";
import TutorCertification from "./pages/TutorCertification";
import QuizPage from "./pages/QuizPage";
import TutorSearchPage from "./pages/TutorSearchPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentSearch from "./pages/StudentSearch";
import SessionBookingPage from "./pages/SessionBookingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/quiz/create" element={<AdminQuizCreation />} />
        <Route path="/tutor/certification" element={<TutorCertification />} />
        <Route path="/quiz/:subject" element={<QuizPage />} />
        <Route path="/tutor-search" element={<TutorSearchPage />} />
        <Route path="/booking" element={<SessionBookingPage />} />
        <Route path="/student-search" element={<StudentSearch />} />
        <Route path="/student-profile" element={<StudentProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
//test
export default App;
