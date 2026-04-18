import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentSearch() {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    const u = JSON.parse(raw);
    if (!["student", "tutor"].includes(u.role)) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <div className="min-h-screen bg-[#081121]" />;
}
