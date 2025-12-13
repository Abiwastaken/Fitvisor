"use client"

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faDumbbell, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"

// Now accepts onStart (for Get Started button) and onLogin (for Login button)
const Hero = ({ onLogin, onStart }) => {
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

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  // Mouse move animation logic
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Map mouse position to rotation degrees
  // Assumes mostly centered interaction, but works full screen
  const rotateX = useTransform(y, [0, 1000], [10, -10]) // Tilt vertically
  const rotateY = useTransform(x, [0, 1500], [-10, 10]) // Tilt horizontally

  const springConfig = { damping: 25, stiffness: 100 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)

  function handleMouseMove(event) {
    // Determine the center of the screen/element for better pivot if needed,
    // but simple clientX/Y mapping often feels sufficient for global tilt.
    const { clientX, clientY } = event
    x.set(clientX)
    y.set(clientY)
  }

  return (
    <section className="relative min-h-screen bg-[#FFFFFF] overflow-hidden flex items-center justify-center">

      {/* 1. Login button in top right */}
      <motion.button
        onClick={onLogin} // Triggers the navigation to Login Page
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#3B82F6] transition-colors cursor-pointer shadow-md"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="text-sm" />
        Login
      </motion.button>

      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-full blur-3xl"
        variants={pulseVariants}
        animate="animate"
      />

      <motion.div
        className="absolute bottom-0 left-20 w-96 h-96 bg-gradient-to-tr from-[#3B82F6] to-[#DBEAFE] rounded-full blur-3xl"
        variants={pulseVariants}
        animate="animate"
        transition={{ delay: 0.5 }}
      />

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
            className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-[#DBEAFE] rounded-full w-fit"
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: "#3B82F6", color: "#FFFFFF" }}
            transition={{ duration: 0.3 }}
          >
            <FontAwesomeIcon icon={faDumbbell} className="text-lg" />
            <span className="text-sm  font-semibold">Perfect Your Form</span>
          </motion.div>

          <motion.h1 className="text-5xl md:text-6xl font-bold text-[#1E3A8A] leading-tight" variants={itemVariants}>
            Fitness Guided by Vision. <span className="text-[#3B82F6]">Form Analysis</span>
          </motion.h1>

          <motion.p className="text-lg text-[#6B7280] leading-relaxed" variants={itemVariants}>
            Get real-time feedback on your exercise form using advanced AI. Every rep counted, every movement analyzed.
            Transform your fitness journey with precision coaching.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={itemVariants}>

            {/* 2. Get Started Button */}
            <motion.button
              onClick={onStart} // Triggers navigation (can be set to Login in App.jsx)
              className="px-8 py-4 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-[#3B82F6] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(30, 58, 138, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </motion.button>

            <motion.button
              className="px-8 py-4 border-2 border-[#1E3A8A] text-[#1E3A8A] font-semibold rounded-lg hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors cursor-pointer"
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
        <motion.div
          className="relative h-96 md:h-full flex items-center justify-center perspective-1000"
          variants={itemVariants}
          style={{ perspective: 1000 }} // Ensure perspective is applied for 3D effect
        >
          <motion.div
            className="relative w-64 h-64 md:w-80 md:h-80"
            variants={floatingVariants}
            animate="animate"
            style={{
              rotateX: rotateXSpring,
              rotateY: rotateYSpring,
              transformStyle: "preserve-3d"
            }}
          >
            {/* Outer rotating ring */}
            <motion.div
              className="absolute inset-0 border-2 border-[#DBEAFE] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />

            {/* Middle rotating ring with pulse */}
            <motion.div
              className="absolute inset-8 border-2 border-[#3B82F6] rounded-full"
              animate={{ rotate: -360, scale: [1, 1.05, 1] }}
              transition={{
                rotate: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
            />

            {/* Center circle */}
            <motion.div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.15, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                animate={{
                  boxShadow: [
                    "0 10px 25px rgba(59, 130, 246, 0.2)",
                    "0 20px 40px rgba(59, 130, 246, 0.4)",
                    "0 10px 25px rgba(59, 130, 246, 0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <FontAwesomeIcon icon={faDumbbell} className="text-white text-6xl md:text-7xl" />
              </motion.div>
            </motion.div>

            {/* Orbiting dots with enhanced animation */}
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="absolute w-4 h-4 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] rounded-full shadow-md"
                style={{
                  top: `${25 + Math.cos((index * Math.PI) / 2) * 40}%`,
                  left: `${50 + Math.sin((index * Math.PI) / 2) * 40}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.4, 1, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.25,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
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