"use client"

import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faDumbbell, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"


const Hero = ({ onLogout }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }



  return (
    <section className="relative min-h-screen bg-[#FFFFFF] overflow-hidden flex items-center justify-center">
      {/* Logout button in top right */}
      <motion.button
        onClick={onLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#3B82F6] transition-colors"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="text-sm" />
        Logout
      </motion.button>

      {/* Animated background elements */}


      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-5xl px-6 md:px-12 py-20 grid md:grid-cols-2 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left side */}
        <motion.div className="space-y-6" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#DBEAFE] rounded-full w-fit"
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: "#3B82F6", color: "#FFFFFF" }}
            transition={{ duration: 0.3 }}
          >
            <FontAwesomeIcon icon={faDumbbell} className="text-lg" />
            <span className="text-sm font-semibold">Perfect Your Form</span>
          </motion.div>

          <motion.h1 className="text-5xl md:text-6xl font-bold text-[#1E3A8A] leading-tight" variants={itemVariants}>
            Fitness Guided by Vision. <span className="text-[#3B82F6]">Form Analysis</span>
          </motion.h1>

          <motion.p className="text-lg text-[#6B7280] leading-relaxed" variants={itemVariants}>
            Get real-time feedback on your exercise form using advanced AI. Every rep counted, every movement analyzed.
            Transform your fitness journey with precision coaching.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={itemVariants}>
            <motion.button
              className="px-8 py-4 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-[#3B82F6] transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(30, 58, 138, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </motion.button>

            <motion.button
              className="px-8 py-4 border-2 border-[#1E3A8A] text-[#1E3A8A] font-semibold rounded-lg hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats with staggered animation */}
          <motion.div className="flex gap-8 pt-8" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.08, translateY: -5 }} transition={{ duration: 0.3 }}>
              <p className="text-2xl font-bold text-[#1E3A8A]">10K+</p>
              <p className="text-sm text-[#6B7280]">Active Users</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08, translateY: -5 }} transition={{ duration: 0.3 }}>
              <p className="text-2xl font-bold text-[#1E3A8A]">500K+</p>
              <p className="text-sm text-[#6B7280]">Forms Analyzed</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08, translateY: -5 }} transition={{ duration: 0.3 }}>
              <p className="text-2xl font-bold text-[#1E3A8A]">98%</p>
              <p className="text-sm text-[#6B7280]">Accuracy Rate</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right side animated visual */}
        {/* Right side visual (simplified) */}
        <motion.div
          className="flex items-center justify-center p-12"
          variants={itemVariants}
        >
          <div className="w-64 h-64 bg-blue-50 rounded-full flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faDumbbell} className="text-[#1E3A8A] text-8xl" />
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="w-6 h-10 border-2 border-[#1E3A8A] rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-2 bg-[#1E3A8A] rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
