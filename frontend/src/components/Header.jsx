"use client"

import { useState } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X, Dumbbell, TrendingUp, Award, Users, LogOut, Home, LogIn, Database } from "lucide-react"

// Palette:
// White: #FFFFFF
// Light Gray: #F3F4F6
// Soft Light Blue: #DBEAFE
// Vibrant Blue: #3B82F6
// Navy: #1E3A8A

const Header = ({ isLoggedIn, onLogout, activePage, onNavigate, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const { scrollY } = useScroll()

  // Intelligent Hiding
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > previous && latest > 150) {
      setIsVisible(false)
      setIsOpen(false)
    } else {
      setIsVisible(true)
    }
  })

  // Navigation Items
  const navItems = [
    { name: "Home", id: "home", icon: Home },
    { name: "Dashboard", id: "dashboard", icon: TrendingUp },
    { name: "Leaderboard", id: "leaderboard", icon: Award },
    { name: "Profile", id: "profile", icon: Users },
  ]

  if (currentUser?.email === "hridayamdr2007@gmail.com") {
    navItems.push({ name: "Data View", id: "admin", icon: Database })
  }

  const handleNavigation = (pageId) => {
    onNavigate(pageId)
    setIsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-6 inset-x-0 mx-auto z-50 max-w-fit"
      >
        <div className="relative">
          {/* Main Floating Island */}
          <motion.div
            className="flex items-center gap-1 p-2 rounded-full border border-[#DBEAFE] bg-white/80 backdrop-blur-xl shadow-xl shadow-[#1E3A8A]/5"
            layout
          >
            {/* Logo Section */}
            <div
              className="flex items-center gap-2 pl-4 pr-6 cursor-pointer group"
              onClick={() => handleNavigation("home")}
            >
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-1.5 rounded-lg text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Dumbbell size={18} fill="currentColor" />
              </div>
              <span className="font-bold text-[#1E3A8A] hidden sm:block tracking-tight">FitVisor</span>
            </div>

            {/* Desktop Links */}
            <ul className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activePage === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${isActive ? "text-[#1E3A8A]" : "text-slate-500 hover:text-[#3B82F6]"
                        }`}
                    >
                      {/* The "Sliding Pill" Background Animation */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-[#DBEAFE] rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      {/* Content sits on top of the layoutId background */}
                      <span className="relative z-10 flex items-center gap-2">
                        <item.icon size={16} />
                        {item.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-[#DBEAFE] mx-2" />

            {/* Login / Logout Button (Desktop) */}
            {isLoggedIn ? (
              <motion.button
                onClick={onLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#F3F4F6] text-[#1E3A8A] hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </motion.button>
            ) : (
              <motion.button
                onClick={() => handleNavigation("login")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#3B82F6] text-white hover:bg-[#1E3A8A] transition-colors shadow-sm"
                title="Login"
              >
                <LogIn size={18} />
              </motion.button>
            )}

            {/* Mobile Hamburger */}
            <motion.button
              className="md:hidden p-3 rounded-full bg-[#F3F4F6] text-[#1E3A8A] hover:bg-[#DBEAFE]"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </motion.div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 12, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 p-2 mt-2 bg-white/90 backdrop-blur-xl border border-[#DBEAFE] rounded-2xl shadow-2xl shadow-[#1E3A8A]/10 overflow-hidden md:hidden"
              >
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = activePage === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${isActive
                          ? "bg-[#DBEAFE] text-[#1E3A8A] font-semibold"
                          : "text-slate-500 hover:bg-[#F3F4F6] hover:text-[#3B82F6]"
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? "bg-white/50" : "bg-[#F3F4F6]"}`}>
                          <item.icon size={18} />
                        </div>
                        {item.name}
                      </button>
                    )
                  })}

                  <div className="h-px bg-[#F3F4F6] my-1" />

                  {/* Login / Logout Button (Mobile) */}
                  {isLoggedIn ? (
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-red-500 hover:bg-red-50 font-medium"
                    >
                      <div className="p-2 rounded-lg bg-red-50">
                        <LogOut size={18} />
                      </div>
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigation("login")}
                      className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-[#3B82F6] hover:bg-blue-50 font-medium"
                    >
                      <div className="p-2 rounded-lg bg-blue-50">
                        <LogIn size={18} />
                      </div>
                      Login
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  )
}

export default Header