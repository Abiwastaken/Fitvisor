"use client"

import "./App.css"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaExclamationCircle, FaTimes } from "react-icons/fa"

// Component Imports
import UserProfile from "./components/Userprofile"
import LoginSignup from "./components/LoginSignup"
import Dashboard from "./components/Dashboard"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState("login")
  const [loginMessage, setLoginMessage] = useState("")

  // --- NAVIGATION HANDLER ---
  const handleNavigation = (targetPage) => {
    if (targetPage === "dashboard" && !isLoggedIn) {
      setLoginMessage("Please log in to access the dashboard")
      setCurrentPage("login")
      return
    }
    setLoginMessage("")
    setCurrentPage(targetPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true)
    setCurrentUser(userData)
    setCurrentPage("profile")
  }

  const handleUpdateUser = (updatedData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }))
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentPage("login")
  }

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 }

  return (
    <div className="bg-[#F3F4F6] min-h-screen w-full flex flex-col font-sans overflow-x-hidden relative">

      <main className="flex-grow w-full pt-0">
        <AnimatePresence mode="wait">

          {/* --- LOGIN PAGE --- */}
          {currentPage === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />

              <AnimatePresence>
                {loginMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -50, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute top-10 left-1/2 z-50 flex items-center gap-4 px-6 py-4 
                               bg-white/90 backdrop-blur-xl border border-red-100 
                               text-red-600 rounded-2xl shadow-2xl
                               min-w-[350px] max-w-xl w-[90%]"
                  >
                    <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                      <FaExclamationCircle className="text-xl" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800">Access Denied</h4>
                      <p className="text-sm text-gray-600 font-medium">{loginMessage}</p>
                    </div>
                    <button
                      onClick={() => setLoginMessage("")}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <FaTimes />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="z-10 w-full max-w-4xl"
              >
                <LoginSignup onLoginSuccess={handleLoginSuccess} />
              </motion.div>
            </motion.div>
          )}

          {/* --- DASHBOARD --- */}
          {currentPage === "dashboard" && (
            <motion.div
              key="dashboard"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
            >
              <Dashboard
                onSelectExercise={(exerciseName) => console.log(exerciseName)}
                onNavigateProfile={() => handleNavigation('profile')}
                onNavigateHome={() => handleLogout()}
              />
            </motion.div>
          )}

          {/* --- PROFILE --- */}
          {currentPage === "profile" && (
            <motion.div key="profile" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <UserProfile
                userData={currentUser}
                onBack={() => handleNavigation('dashboard')}
                onUpdateUser={handleUpdateUser}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}

export default App