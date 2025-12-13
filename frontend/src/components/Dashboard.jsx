"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faHome, faTrophy, faFire, faBullseye, faChevronRight } from "@fortawesome/free-solid-svg-icons"

// Palette Reference:
// White: #FFFFFF
// Light Gray: #F3F4F6
// Soft Light Blue: #DBEAFE
// Vibrant Blue: #3B82F6
// Navy: #1E3A8A

const exercises = [
  {
    id: 1,
    name: "Push-ups",
    emoji: "💪",
    description: "Upper body strength",
    // Gradient: Navy to Vibrant Blue
    gradient: "from-[#1E3A8A] to-[#3B82F6]",
    stats: "89 reps",
  },
  {
    id: 2,
    name: "Squats",
    emoji: "🦵",
    description: "Lower body strength",
    // Gradient: Vibrant Blue to Soft Blue
    gradient: "from-[#3B82F6] to-[#60A5FA]",
    stats: "156 reps",
  },

]

// Counter animation
const AnimatedCounter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(end * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return count
}

export default function Dashboard({ onSelectExercise, onNavigateHome }) {
  const [activeExercise, setActiveExercise] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    // Base Background: Light Gray (#F3F4F6)
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E3A8A] overflow-hidden font-sans">



      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <motion.h1
              className="text-6xl font-black bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent mb-2 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              FitVisor
            </motion.h1>
            <motion.p
              className="text-lg text-slate-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your AI-Powered Fitness Form Analyzer
            </motion.p>
          </div>

          {/* Header Buttons */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Home Button (New) */}
            <motion.button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1E3A8A] shadow-md border border-[#DBEAFE] font-bold hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05, borderColor: "#3B82F6" }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
              Home
            </motion.button>


          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: "Current Streak", value: 7, icon: faFire, color: "text-orange-500", suffix: " Days" },
            { label: "Total Exercises", value: 24, icon: faTrophy, color: "text-[#3B82F6]", suffix: "" },
            { label: "Accuracy Rate", value: 94, icon: faBullseye, color: "text-[#1E3A8A]", suffix: "%" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 p-6 border border-[#DBEAFE]"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.1)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider">{stat.label}</p>
                <div className={`p-3 rounded-full bg-[#F3F4F6] ${stat.color}`}>
                  <FontAwesomeIcon icon={stat.icon} className="w-5 h-5" />
                </div>
              </div>
              <motion.div
                className="flex items-baseline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-5xl font-black text-[#1E3A8A] tracking-tighter">
                  <AnimatedCounter end={stat.value} />
                </span>
                <span className="text-xl font-bold text-[#3B82F6] ml-1">{stat.suffix}</span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Category Filter */}
        {/* <motion.div
          className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {["all", "strength", "cardio", "core"].map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all capitalize shadow-sm ${selectedCategory === category
                ? "bg-[#1E3A8A] text-white shadow-blue-900/20 scale-105"
                : "bg-white text-slate-400 hover:text-[#3B82F6] hover:bg-[#DBEAFE]"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div> */}

        {/* Exercise Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              onHoverStart={() => setActiveExercise(exercise.id)}
              onHoverEnd={() => setActiveExercise(null)}
            >
              <motion.button
                onClick={() => onSelectExercise(exercise.name)}
                className="relative w-full h-full text-left group"
                whileTap={{ scale: 0.98 }}
              >
                {/* Card Container */}
                <div className="h-full bg-white rounded-3xl p-1 shadow-lg shadow-blue-900/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/10">
                  <div className="relative h-full bg-white rounded-[20px] p-6 overflow-hidden border border-[#F3F4F6] group-hover:border-[#DBEAFE]">

                    {/* Background Gradient on Hover */}
                    <motion.div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${exercise.gradient}`}
                    />

                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                        {exercise.emoji}
                      </div>
                      <div className="w-10 h-10 rounded-full border border-[#F3F4F6] flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:border-[#1E3A8A] transition-colors duration-300">
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="w-3 h-3 text-slate-400 group-hover:text-white"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-black text-[#1E3A8A] mb-1 group-hover:text-[#3B82F6] transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-slate-400 font-medium text-sm mb-6">{exercise.description}</p>

                    {/* Stats & Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reps</span>
                        <span className={`text-lg font-bold bg-gradient-to-r ${exercise.gradient} bg-clip-text text-transparent`}>
                          {exercise.stats}
                        </span>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${exercise.gradient}`}
                          initial={{ width: "40%" }}
                          animate={activeExercise === exercise.id ? { width: "100%" } : { width: "60%" }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          className="relative overflow-hidden rounded-3xl p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] opacity-10 blur-xl" />
          <div className="relative bg-white/60 backdrop-blur-xl border border-white rounded-[20px] p-10 text-center shadow-xl">


            <h2 className="text-3xl font-black text-[#1E3A8A] mb-3">Ready to Perfect Your Form?</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              Select an exercise above to launch the AI analyzer. Real-time feedback awaits.
            </p>

            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#1E3A8A] text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 hover:bg-[#3B82F6] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Get Started</span>
              <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}