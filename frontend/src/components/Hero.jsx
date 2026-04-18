import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  
  const handleSearch = () => {
    navigate('/tutor-search');
  };
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold">OVER 100 ACTIVE TUTORS</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            Find Your <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Perfect Tutor
            </span>
            <br className="hidden sm:block" /> Today
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Match with top-rated tutors for personalized learning and student success — all in one place.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-12">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="What do you want to learn?" 
                className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors duration-300 font-sans text-slate-700"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Find Tutors <ArrowRight size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-blue-600 mb-2">100+</h2>
              <p className="text-slate-600 font-medium">Active Tutors</p>
            </div>
            <div className="hidden sm:block border-r border-slate-200"></div>
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-blue-600 mb-2">1,000+</h2>
              <p className="text-slate-600 font-medium">Students Enrolled</p>
            </div>
            <div className="hidden sm:block sm:col-span-3 sm:col-start-2 border-r border-slate-200"></div>
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-blue-600 mb-2">98%</h2>
              <p className="text-slate-600 font-medium">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
