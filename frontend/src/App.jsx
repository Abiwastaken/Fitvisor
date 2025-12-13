"use client"

import "./App.css"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaExclamationCircle, FaTimes } from "react-icons/fa"

// Component Imports
import Dashboard from "./components/Dashboard"
import Hero from "./components/Hero"
import Leaderboard from "./components/Leaderboard"
import UserProfile from "./components/Userprofile"
import AdminUsers from "./components/AdminUsers"
import Header from "./components/Header"
import LoginSignup from "./components/LoginSignup"
import WhyUs from "./components/WhyUs"
import AboutUs from "./components/AboutUs"
import ContactUs from "./components/ContactUs"
import Footer from "./components/Footer"
import TermsAndConditions from "./components/TermsAndConditions"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState("home")

  const [loginMessage, setLoginMessage] = useState("")
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null)

  // Track scroll for header styling
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isLoginPage = currentPage === "login"
  const isHomePage = currentPage === "home"

  // --- NAVIGATION HANDLER ---
  const handleNavigation = (targetPage) => {
    const protectedPages = ["dashboard", "profile", "leaderboard", "admin"]

    if (protectedPages.includes(targetPage) && !isLoggedIn) {
      setLoginMessage(`Please log in to access the ${targetPage}`)
      setRedirectAfterLogin(targetPage)
      setCurrentPage("login")
    } else {
      setLoginMessage("")
      setRedirectAfterLogin(null)
      setCurrentPage(targetPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleLoginSuccess = (userData) => {
    // Check if user is NOT admin and has NOT accepted terms
    if (userData.email !== "admin@gmail.com" && userData.email !== "hridayamdr2007@gmail.com" && !userData.acceptedTerms) {
      setIsLoggedIn(true)
      setCurrentUser(userData)
      setLoginMessage("Please accept the terms to proceed.")
      setCurrentPage("terms")
      setRedirectAfterLogin(null) // We force them to terms, navigation logic will handle next step after accept
    } else {
      setIsLoggedIn(true)
      setCurrentUser(userData)
      setLoginMessage("")
      setCurrentPage(redirectAfterLogin || "dashboard")
      setRedirectAfterLogin(null)
    }
  }

  const handleAcceptTerms = async () => {
    if (!currentUser || !currentUser.email) return

    try {
      const response = await fetch('http://127.0.0.1:5000/api/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      })

      if (response.ok) {
        // Update local state
        const updatedUser = { ...currentUser, acceptedTerms: true }
        setCurrentUser(updatedUser)
        // Navigate to where they wanted to go, or dashboard
        setCurrentPage("dashboard")
      } else {
        console.error("Failed to accept terms")
      }
    } catch (error) {
      console.error("Error accepting terms:", error)
    }
  }

  const handleUpdateUser = (updatedData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }))
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage("home")
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

      {/* 1. HEADER */}
      {!isLoginPage && (
        <Header
          isLoggedIn={isLoggedIn}
          activePage={currentPage}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
          isScrolled={isScrolled}
          isHomePage={isHomePage}
          currentUser={currentUser}
        />
      )}

      {/* 2. MAIN CONTENT */}
      <main className={`flex-grow w-full ${isHomePage || isLoginPage ? "pt-0" : "pt-24"}`}>
        <AnimatePresence mode="wait">

          {/* --- HOME PAGE --- */}
          {currentPage === "home" && (
            <motion.div
              key="home"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
            >
              <Hero onStart={() => handleNavigation('dashboard')} />
              <WhyUs />
              <AboutUs />
              <ContactUs />
            </motion.div>
          )}

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

              {/* --- FLOATING ERROR TOAST (CENTER TOP) --- */}
              <AnimatePresence>
                {loginMessage && (
                  <motion.div
                    // 1. Position Initial state off-screen (up) and centered (x: -50%)
                    initial={{ opacity: 0, y: -50, x: "-50%" }}
                    // 2. Animate to visible (y: 0) while maintaining center (x: -50%)
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    // 3. Exit animation
                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}

                    // 4. CSS Positioning: Absolute, Top spacing, Left 50%
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

              {/* --- LOGIN FORM --- */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                // Kept this wide as per your previous request
                className="z-10 w-full max-w-4xl"
              >
                <LoginSignup onLoginSuccess={handleLoginSuccess} />
              </motion.div>

              {/* --- HOME BUTTON --- */}
              <motion.button
                onClick={() => handleNavigation('home')}
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  boxShadow: "0px 10px 20px rgba(59, 130, 246, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-5 right-5 z-50 flex items-center gap-2 px-4 py-2 
                          bg-white/60 backdrop-blur-md border border-white/50 
                          text-gray-600 font-medium rounded-full shadow-sm 
                          hover:text-[#3B82F6] hover:border-[#3B82F6]/30 
                          transition-colors duration-300 group cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-10deg]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="text-xs uppercase tracking-wider">Home</span>
              </motion.button>
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
                currentUser={currentUser}
                onSelectExercise={(exerciseName) => console.log(exerciseName)}
                onNavigateProfile={() => handleNavigation('profile')}
                onNavigateHome={() => handleNavigation('home')}
              />
            </motion.div>
          )}

          {/* --- OTHER PAGES --- */}
          {currentPage === "leaderboard" && (
            <motion.div key="leaderboard" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Leaderboard currentUser={currentUser} />
            </motion.div>
          )}
          {currentPage === "profile" && (
            <motion.div key="profile" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <UserProfile userData={currentUser} onBack={() => handleNavigation('dashboard')} onUpdateUser={handleUpdateUser} />
            </motion.div>
          )}

          {/* --- ADMIN PAGE --- */}
          {currentPage === "admin" && (currentUser?.email === "admin@gmail.com" || currentUser?.email === "hridayamdr2007@gmail.com") && (
            <motion.div key="admin" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <AdminUsers onBack={() => handleNavigation('dashboard')} />
            </motion.div>
          )}

          {/* --- TERMS PAGE --- */}
          {currentPage === "terms" && isLoggedIn && (
            <motion.div key="terms" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <TermsAndConditions
                onAccept={handleAcceptTerms}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {!isLoginPage && <Footer />}
    </div>
  )
}

export default App