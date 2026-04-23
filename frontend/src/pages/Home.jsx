import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, ShieldCheck, Users } from "lucide-react";
import CategoriesBar from "../components/CategoriesBar";
import TutorFeatures from "../components/TutorFeatures";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";
import "./TutorSearchPage.css";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user?._id || user.role !== "tutor") {
      setPendingRequests(0);
      return;
    }
    let mounted = true;
    const loadPending = () => {
      fetch(`http://localhost:5000/sessions/tutor/user/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((list) => {
          if (!mounted) return;
          const count = (list || []).filter(
            (s) => s.status === "pending",
          ).length;
          setPendingRequests(count);
        })
        .catch(() => {
          if (mounted) setPendingRequests(0);
        });
    };
    loadPending();
    const id = setInterval(loadPending, 20000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [user?._id, user?.role]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <div className="tutor-search-page">
      <header className="bg-[#081121] text-white border-b border-white/10">
        <div className="container flex items-center justify-start py-4">
          <div className="flex items-center gap-2">
            {user ? (
              user.role === "tutor" ? (
                <>
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={() => navigate("/tutor-search")}
                  >
                    Tutor Search
                  </button>
                  <button
                    className="btn-outline relative"
                    type="button"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                    {pendingRequests > 0 && (
                      <span className="ml-2 inline-flex min-w-6 h-6 px-2 rounded-full bg-red-500 text-white text-xs items-center justify-center">
                        {pendingRequests}
                      </span>
                    )}
                  </button>
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={() => navigate("/student-search")}
                  >
                    Games
                  </button>
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={() => navigate("/tutor-search")}
                  >
                    Tutor Search
                  </button>
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={() => navigate("/student-profile")}
                  >
                    Sessions
                  </button>
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )
            ) : (
              <>
                <button
                  className="btn-outline"
                  type="button"
                  onClick={() => navigate("/student-search")}
                >
                  Games
                </button>
                <NavLink className="btn-outline" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn-outline" to="/register">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <section
        className="tutor-hero-section"
        style={{
          background: "linear-gradient(135deg, #0b1f4d 0%, #0f2f6b 100%)",
        }}
      >
        <div className="container">
          <div className="tutor-hero-content">
            <div className="tutor-welcome">
              <h1>Find the right tutor, faster.</h1>
              <p>
                Modern search, trusted experts, and smooth scheduling in one
                place.
              </p>
            </div>
            <div className="tutor-quick-stats">
              <div className="quick-stat">
                <Users size={20} />
                <div>
                  <h3>500+</h3>
                  <p>Tutors</p>
                </div>
              </div>
              <div className="quick-stat">
                <BookOpen size={20} />
                <div>
                  <h3>120+</h3>
                  <p>Subjects</p>
                </div>
              </div>
              <div className="quick-stat">
                <ShieldCheck size={20} />
                <div>
                  <h3>98%</h3>
                  <p>Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoriesBar />

      <section
        className="info-section"
        style={{ backgroundColor: "var(--white)", padding: "60px 0" }}
      >
        <div className="container text-center">
          <span className="section-label">GET STARTED</span>
          <h2 className="info-title">Jump into learning</h2>
          <p className="info-description">
            Search tutors by subject, compare ratings, and book in minutes.
          </p>
          <div className="tutor-tools-grid" style={{ marginTop: 24 }}>
            <div className="tool-card">
              <BookOpen size={30} />
              <h3>Browse Subjects</h3>
              <p>Discover top tutors for math, coding, language and more.</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/tutor-search")}
              >
                Explore
              </button>
            </div>
            <div className="tool-card">
              <Calendar size={30} />
              <h3>Book Sessions</h3>
              <p>Pick a time that works and manage upcoming classes easily.</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/tutor-search")}
              >
                Book Now
              </button>
            </div>
            <div className="tool-card">
              <Users size={30} />
              <h3>Grow with mentors</h3>
              <p>Track progress with tutors who match your learning goals.</p>
              <button
                className="btn-primary"
                onClick={() => navigate(user ? "/tutor-search" : "/register")}
              >
                Start Free
              </button>
            </div>
          </div>
        </div>
      </section>

      <TutorFeatures />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
}
