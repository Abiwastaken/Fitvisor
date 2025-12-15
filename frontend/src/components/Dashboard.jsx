"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Flame,
  Trophy,
  Target,
  ChevronRight,
  Dumbbell,
  TrendingUp,
  LayoutGrid,
  User,
  LogOut,
  Home
} from "lucide-react"

import ExerciseMonitor from "./ExerciseMonitor"


const BentoCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
)

const StatValue = ({ value, label, subtext, color = "text-[#1E3A8A]" }) => (
  <div>
    <h3 className={`text-4xl font-black tracking-tight ${color}`}>{value}</h3>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
    {subtext && <p className="text-xs text-blue-500 font-medium mt-1">{subtext}</p>}
  </div>
)

// Custom SVG Wave Chart
const ActivityChart = ({ isZero }) => (
  <div className="relative h-32 w-full mt-4">
    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Background Grid Lines */}
      <line x1="0" y1="10" x2="100" y2="10" stroke="#F1F5F9" strokeWidth="0.5" />
      <line x1="0" y1="20" x2="100" y2="20" stroke="#F1F5F9" strokeWidth="0.5" />
      <line x1="0" y1="30" x2="100" y2="30" stroke="#F1F5F9" strokeWidth="0.5" />

      {/* The Wave Line */}
      <motion.path
        d={isZero ? "M0,35 L100,35" : "M0,35 Q10,25 20,30 T40,20 T60,10 T80,25 T100,15"}
        fill="none"
        stroke={isZero ? "#94A3B8" : "#3B82F6"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Fill Area */}
      {!isZero && (
        <motion.path
          d="M0,35 Q10,25 20,30 T40,20 T60,10 T80,25 T100,15 V40 H0 Z"
          fill="url(#waveGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        />
      )}

      {/* Active Points */}
      {!isZero && [20, 60, 100].map((cx, i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={i === 0 ? 30 : i === 1 ? 10 : 15}
          r="2"
          fill="#1E3A8A"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 + i * 0.2 }}
        />
      ))}
    </svg>
    {/* Labels x-axis */}
    <div className="flex justify-between text-[10px] text-slate-300 font-bold mt-2 uppercase">
      <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
    </div>
  </div>
)

// Circular Progress
const ProgressRing = ({ percentage = 94 }) => {
  const radius = 35
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle cx="50%" cy="50%" r={radius} stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="#1E3A8A"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-[#1E3A8A]">{percentage}%</span>
      </div>
    </div>
  )
}

// Data
const EXERCISES = [
  { id: 1, name: "Push-ups", category: "strength", reps: 89, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 2, name: "Squats", category: "strength", reps: 156, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: 3, name: "Jumping Jacks", category: "cardio", reps: 102, color: "text-cyan-500", bg: "bg-cyan-50" },
  { id: 4, name: "Plank", category: "core", reps: "4m", color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 5, name: "Lunges", category: "strength", reps: 64, color: "text-violet-500", bg: "bg-violet-50" },
]

export default function Dashboard({ currentUser, onSelectExercise, onNavigateProfile, onNavigateHome }) {
  const [filter, setFilter] = useState("all")
  const [activeExercise, setActiveExercise] = useState(null) // Local state for exercise monitor

  const filteredExercises = useMemo(() =>
    filter === "all" ? EXERCISES : EXERCISES.filter(ex => ex.category === filter),
    [filter])

  // Streak Logic
  const streak = currentUser?.streak || 0
  const isZeroStreak = streak === 0

  const getStreakMessage = (days) => {
    if (days === 0) return ["Start your journey!", "Time to begin!"]
    if (days <= 3) return ["Great start!", "Keep it going!"]
    if (days <= 7) return ["You're on fire!", "Unstoppable!"]
    return ["Legendary!", "Top 1% consistency!"]
  }

  const streakMessages = getStreakMessage(streak)
  // Simple random selection based on day to keep it stable-ish during render, or just pick first
  const streakMessage = streakMessages[0]

  // If exercise is active, show the monitor
  if (activeExercise) {
    return <ExerciseMonitor exerciseType={activeExercise} userId={currentUser?.id} onBack={() => setActiveExercise(null)} />
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 selection:bg-blue-100">

      {/* --- Top Navigation --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        {/* ... existing header ... */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <LayoutGrid size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1E3A8A] tracking-tight">FitVisor<span className="text-blue-500">.</span></h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Dashboard</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-2"
        >
          <button
            onClick={onNavigateHome}
            className="p-3 rounded-xl bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-[#1E3A8A] transition-colors"
          >
            <Home size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={onNavigateProfile}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E3A8A] text-white font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-colors"
          >
            <User size={18} strokeWidth={2.5} />
            <span>Profile</span>
          </button>
        </motion.div>
      </header>

      {/* --- Bento Grid Layout --- */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ... existing bento cards ... */}
        {/* 1. Large Activity Chart (Span 8) */}
        <BentoCard className="md:col-span-8 flex flex-col justify-between overflow-hidden relative group">
          {/* ... content ... */}
          <div className="flex justify-between items-start z-10">
            <div>
              <h2 className="text-xl font-bold text-[#1E3A8A] flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                Weekly Activity
              </h2>
              <p className="text-slate-400 text-sm mt-1">Movement analysis over last 7 days</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isZeroStreak ? "bg-slate-100 text-slate-400" : "bg-green-50 text-green-600"}`}>
              {isZeroStreak ? "No activity yet" : "+12% vs last week"}
            </div>
          </div>

          <ActivityChart isZero={isZeroStreak} />

          {/* Hover Glow Effect */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </BentoCard>

        {/* 2. Streak Card (Span 4) */}
        <BentoCard className={`md:col-span-4 relative overflow-hidden text-white transition-colors duration-500 ${isZeroStreak ? "bg-slate-900 border-slate-800" : "bg-gradient-to-br from-[#1E3A8A] to-[#2563EB]"}`} delay={0.1}>
          {/* ... content ... */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg backdrop-blur-sm ${isZeroStreak ? "bg-slate-800 text-slate-500" : "bg-white/10 text-orange-300"}`}>
                <Flame size={24} fill="currentColor" />
              </div>
              <span className={`font-medium text-sm ${isZeroStreak ? "text-slate-400" : "text-blue-200"}`}>
                {isZeroStreak ? "Inactive" : "On Fire!"}
              </span>
            </div>

            <div className="mt-6">
              <span className={`text-6xl font-black tracking-tighter ${isZeroStreak ? "text-slate-700" : "text-white"}`}>{streak}</span>
              <span className={`text-xl font-bold ml-2 ${isZeroStreak ? "text-slate-600" : "text-blue-200"}`}>Day Streak</span>
            </div>

            <div className={`mt-4 text-sm p-3 rounded-xl backdrop-blur-md border ${isZeroStreak ? "text-slate-400 bg-slate-800/50 border-slate-700" : "text-blue-100 bg-white/10 border-white/10"}`}>
              {streakMessage}
            </div>
          </div>

          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </BentoCard>

        {/* 3. Accuracy Ring (Span 4) */}
        <BentoCard className="md:col-span-4 flex items-center justify-between" delay={0.2}>
          <div>
            <h3 className="text-lg font-bold text-[#1E3A8A]">Avg. Accuracy</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-[100px]">Based on your last 20 sessions</p>
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">Excellent</span>
            </div>
          </div>
          <ProgressRing percentage={94} />
        </BentoCard>

        {/* 4. Total Exercises (Span 8) */}
        <BentoCard className="md:col-span-8 flex items-center justify-between bg-slate-900 text-white overflow-hidden relative" delay={0.3}>
          <div className="relative z-10 flex gap-8 items-center">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Trophy size={32} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-4xl font-black">24</h3>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">Exercises Mastered</p>
            </div>
          </div>

          <div className="relative z-10">
            <button className="px-5 py-2 bg-white text-[#1E3A8A] rounded-full font-bold text-sm hover:scale-105 transition-transform">
              View All Badges
            </button>
          </div>

          {/* Decorative Blob */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20" />
        </BentoCard>

        {/* 5. Exercise Selector (Full Width) */}
        <div className="md:col-span-12 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#1E3A8A]">Ready to Train?</h2>
              <p className="text-slate-500">Select a workout to launch the AI Form Analyzer.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
              {["all", "strength", "cardio", "core"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === tab
                    ? "bg-[#1E3A8A] text-white shadow-md"
                    : "text-slate-400 hover:text-blue-500"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filteredExercises.map((ex) => (
                <motion.button
                  layout
                  key={ex.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveExercise(ex.name)}
                  className="group relative bg-white rounded-2xl p-5 text-left border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${ex.bg} ${ex.color} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform`}>
                    <Dumbbell size={20} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#1E3A8A] transition-colors">{ex.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{ex.category}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{ex.reps} <span className="text-slate-400 font-medium text-xs">Total</span></span>
                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:border-[#1E3A8A] transition-colors">
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-white" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

      </main>
    </div>
  )
}