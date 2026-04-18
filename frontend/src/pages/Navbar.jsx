import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.jpeg" 
              alt="SkillSwap Logo" 
              className="h-12 w-12 rounded-lg object-cover"
            />
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              SkillSwap
            </h1>
          </div>

          {/* Quote */}
          <div className="hidden md:block text-center text-sm text-slate-600 italic font-light px-4">
            "Once you stop learning, you start dying." — Albert Einstein
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            <NavLink 
              to="/login" 
              className="px-4 py-2 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors duration-300"
            >
              Login
            </NavLink>
            <NavLink 
              to="/register" 
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Register
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
