"use client"

import "./App.css"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Dashboard from "./components/Dashboard"
import Hero from "./components/Hero"


import Header from "./components/Header"
import LoginSignup from "./components/LoginSignup" // Ensure this is imported

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // State to track which page is currently active
  const [currentPage, setCurrentPage] = useState("home")

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage("home") // Reset to home page upon login
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage("home")
  }

  // Animation variants for smooth page switching
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  }

  // --- 1. LOGIN CHECK ---
  // If the user is NOT logged in, show the Login/Signup screen.
  if (!isLoggedIn) {
    return (
      <div className="bg-[#F3F4F6] min-h-screen flex items-center justify-center">
        <LoginSignup onLoginSuccess={handleLogin} />
      </div>
    )
  }

  // --- 2. MAIN APPLICATION ---
  // If logged in, show the Header and the active page.
  return (
    <div className="bg-[#F3F4F6] min-h-screen flex flex-col">
      {/* Pass the current page and the navigation function to Header */}
      <Header
        onLogout={handleLogout}
        activePage={currentPage}
        onNavigate={setCurrentPage}
      />

      <main className="flex-grow pt-24"> {/* Added padding-top so content isn't hidden behind fixed header */}
        <AnimatePresence mode="wait">
          {currentPage === "home" && (
            <motion.div
              key="home"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Hero onLogout={handleLogout} onStart={() => setCurrentPage('dashboard')} />
            </motion.div>
          )}

          {currentPage === "dashboard" && (
            <motion.div
              key="dashboard"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Dashboard
                onSelectExercise={(exerciseName) => console.log(exerciseName)}
                onNavigateHome={() => setCurrentPage('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main >
    </div >
  )
}

export default App