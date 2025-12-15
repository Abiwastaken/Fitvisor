"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Flame,
  ChevronDown,
  Dumbbell,
  Search,
  Crosshair // Icon for "Locate Me"
} from "lucide-react"

// --- PALETTE ---
const COLORS = {
  white: "#FFFFFF",
  lightGray: "#F3F4F6",
  softBlue: "#DBEAFE",
  vibrantBlue: "#3B82F6",
  navy: "#1E3A8A",
}

// --- MOCK DATA GENERATOR ---
const generateUsers = (count, basePoints) => {
  const names = [
    "Alex Johnson", "Sarah Connor", "Mike Ross", "Jessica Pearson", "Harvey Specter",
    "Louis Litt", "Donna Paulsen", "Rachel Zane", "Katrina Bennett", "Robert Zane",
    "Samantha Wheeler", "Harold Gunderson", "John Wick", "Tony Stark", "Bruce Wayne"
  ]

  return Array.from({ length: count }, (_, i) => {
    const rank = i + 1
    const points = basePoints - i * Math.floor(Math.random() * 50 + 20)

    // Let's make the user at Rank 15 the "Current User" for demo purposes
    const isCurrentUser = rank === 15

    return {
      id: `user-${i}`,
      rank,
      name: isCurrentUser ? "You (Current User)" : names[i % names.length],
      avatar: `https://i.pravatar.cc/150?u=${i + 33}`,
      points: Math.max(0, points),
      change: Math.random() > 0.7 ? "up" : Math.random() > 0.5 ? "down" : "same",
      changeAmount: Math.floor(Math.random() * 3) + 1,
      streak: Math.floor(Math.random() * 30),
      isCurrentUser: isCurrentUser,
    }
  })
}

const MOCK_DATA = {
  daily: generateUsers(50, 1500),
  weekly: generateUsers(50, 5000),
  monthly: generateUsers(50, 12000),
}

// --- SUB-COMPONENTS ---

// 1. Single Leaderboard Row
const LeaderboardItem = ({ user, index }) => {
  const level = Math.floor(user.points / 1000) + 1

  const getChangeIcon = () => {
    if (user.change === "up") return <TrendingUp size={14} className="text-green-500" />
    if (user.change === "down") return <TrendingDown size={14} className="text-red-400" />
    return <Minus size={14} className="text-slate-300" />
  }

  const changeTextClass =
    user.change === "up" ? "text-green-500" :
      user.change === "down" ? "text-red-400" :
        "text-slate-300"

  // Special styling for "Me"
  const currentUserStyle = user.isCurrentUser
    ? "border-[#3B82F6] bg-blue-50 shadow-md ring-1 ring-blue-100"
    : "border-transparent bg-white hover:border-[#DBEAFE] hover:shadow-lg hover:shadow-blue-900/5"

  return (
    <motion.div
      layout
      id={`row-${user.id}`} // ID used for scrolling
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      className={`group flex items-center p-4 mb-3 rounded-2xl shadow-sm border transition-all duration-300 ${currentUserStyle}`}
    >
      {/* Rank */}
      <div className={`w-10 text-center font-bold text-lg mr-3 transition-colors ${user.isCurrentUser ? 'text-[#3B82F6]' : 'text-slate-400 group-hover:text-[#3B82F6]'}`}>
        {user.rank}
      </div>

      {/* Avatar */}
      <div className="relative mr-4">
        <div className={`w-12 h-12 rounded-full p-0.5 bg-gradient-to-br ${user.isCurrentUser ? 'from-[#3B82F6] to-[#1E3A8A]' : 'from-[#DBEAFE] to-white'}`}>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover border-2 border-white"
          />
        </div>
        {user.streak > 5 && (
          <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center shadow-sm border border-white">
            <Flame size={8} fill="currentColor" className="mr-0.5" />
            {user.streak}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold truncate text-base ${user.isCurrentUser ? 'text-[#1E3A8A]' : 'text-[#1E3A8A]'}`}>
          {user.name} {user.isCurrentUser && <span className="text-xs text-[#3B82F6] font-normal ml-2">(You)</span>}
        </h4>
        <div className="flex items-center text-xs text-slate-400 mt-0.5 gap-2">
          <span className="font-medium">Lvl {level}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="flex items-center gap-1">
            <Dumbbell size={10} /> Athlete
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right">
        <div className="font-black text-[#3B82F6] text-lg tracking-tight">
          {user.points.toLocaleString()}
        </div>
        <div className={`text-xs flex items-center justify-end gap-1 font-semibold ${changeTextClass}`}>
          {getChangeIcon()}
          {user.change !== "same" && <span>{user.changeAmount}</span>}
        </div>
      </div>
    </motion.div>
  )
}

// 2. Podium (Top 3)
const Podium = ({ topThree }) => {
  const first = topThree.find((u) => u.rank === 1)
  const second = topThree.find((u) => u.rank === 2)
  const third = topThree.find((u) => u.rank === 3)

  if (!first) return null

  const PodiumItem = ({ user, place, delay }) => {
    if (!user) return <div className="w-1/3 "></div>

    const isFirst = place === 1

    let heightClass, bgGradient, ringColor, trophyColor, labelColor

    if (isFirst) {
      heightClass = "h-40"
      bgGradient = "from-yellow-300/40 to-yellow-500/10"
      ringColor = "border-yellow-400"
      trophyColor = "text-yellow-400"
      labelColor = "bg-yellow-400"
    } else if (place === 2) {
      heightClass = "h-28"
      bgGradient = "from-slate-300/40 to-slate-400/10"
      ringColor = "border-slate-300"
      trophyColor = "text-slate-300"
      labelColor = "bg-slate-300"
    } else {
      heightClass = "h-20"
      bgGradient = "from-orange-300/40 to-orange-400/10"
      ringColor = "border-orange-300"
      trophyColor = "text-orange-300"
      labelColor = "bg-orange-300"
    }

    const orderClass = isFirst ? "order-2 z-10 -mt-6" : place === 2 ? "order-1" : "order-3"

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6, type: "spring", bounce: 0.4 }}
        className={`flex flex-col items-center justify-end w-1/3 ${orderClass}`}
      >
        <div className="relative mb-3  group cursor-pointer" onClick={() => {
          const element = document.getElementById(`row-${user.id}`);
          if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
        }}>
          <div className={`relative rounded-full border-[3px] ${ringColor} p-1 bg-white shadow-lg`}>
            <img
              src={user.avatar}
              alt={user.name}
              className={`rounded-full object-cover transition-transform duration-300 group-hover:scale-105 ${isFirst ? "w-24 h-24" : "w-16 h-16"
                }`}
            />
            <div
              className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md border-2 border-white ${labelColor}`}
            >
              {place}
            </div>
          </div>
          {isFirst && (
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-400 drop-shadow-md"
            >
              <Crown size={32} fill="currentColor" />
            </motion.div>
          )}
        </div>

        <div className="text-center mb-3">
          <h3 className={`font-bold text-[#1E3A8A] truncate max-w-[100px] md:max-w-full ${isFirst ? "text-lg" : "text-sm"}`}>
            {user.name}
          </h3>
          <p className="text-[#3B82F6] font-extrabold text-sm">
            {user.points.toLocaleString()} pts
          </p>
        </div>

        <div
          className={`w-full ${heightClass} bg-gradient-to-t ${bgGradient} rounded-t-2xl flex items-end justify-center pb-4 backdrop-blur-sm border-t border-white/40 shadow-sm`}
        >
          <Trophy className={`${trophyColor} opacity-50`} size={isFirst ? 32 : 24} />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex items-end justify-center w-full max-w-lg mx-auto mb-10 gap-3 px-2 h-72">
      <PodiumItem user={second} place={2} delay={0.2} />
      <PodiumItem user={first} place={1} delay={0.1} />
      <PodiumItem user={third} place={3} delay={0.3} />
    </div>
  )
}

// --- MAIN LEADERBOARD PAGE ---
const Leaderboard = ({ currentUser }) => {
  const [timeframe, setTimeframe] = useState("weekly")
  const [searchQuery, setSearchQuery] = useState("")
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/leaderboard')
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }
        const data = await response.json()

        // Process data to match component expectations
        const formattedData = data.map((user, index) => ({
          ...user,
          rank: index + 1,
          isCurrentUser: currentUser && (currentUser.email === user.email),
          // Default values if missing from backend
          points: user.points || 0,
          streak: user.streak || 0,
          change: user.change || "same",
          changeAmount: user.changeAmount || 0,
          avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`
        }))

        setLeaderboardData(formattedData)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching leaderboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [currentUser]) // Re-run if currentUser changes (e.g. login/logout)


  // Filter logic
  const filteredData = leaderboardData.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Only show Podium if NOT searching
  const showPodium = searchQuery === ""

  // If showing podium, top 3 are in podium, rest in list. 
  // If searching, everyone is in list.
  const topThree = showPodium ? leaderboardData.slice(0, 3) : []
  const listData = showPodium ? leaderboardData.slice(3) : filteredData

  // Rank of current user for summary card
  const currentUserRankSpec = leaderboardData.find(u => u.isCurrentUser)

  const tabs = [
    { id: "daily", label: "Today" },
    { id: "weekly", label: "This Week" },
    { id: "monthly", label: "All Time" },
  ]

  // --- ACTIONS ---

  const handleLocateMe = () => {
    // 1. Clear search to ensure "Me" is visible in the full list
    setSearchQuery("")

    // 2. Wait a tick for the state to update and list to re-render
    setTimeout(() => {
      // Find the user ID from data where isCurrentUser is true
      const myUser = leaderboardData.find(u => u.isCurrentUser)

      if (myUser) {
        const element = document.getElementById(`row-${myUser.id}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          // Optional: Flash animation could be triggered here via class manipulation
        }
      }
    }, 100)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading leaderboard...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">Error: {error}</div>

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E3A8A] pb-12">

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DBEAFE] rounded-full mix-blend-multiply filter blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3B82F6] rounded-full mix-blend-multiply filter blur-[100px] opacity-10" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1E3A8A] flex items-center gap-3 tracking-tight">
              <Trophy className="text-[#3B82F6]" size={36} />
              Leaderboard
            </h1>
            <p className="text-slate-500 font-medium mt-1 ml-1">
              Compete, earn points, and climb the ranks.
            </p>
          </div>

          {/* Personal Rank Summary Card */}
          {currentUserRankSpec && (
            <div className="bg-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-900/5 flex items-center gap-4 border border-[#DBEAFE]">
              <div className="w-10 h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#1E3A8A]">
                <Medal size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Rank</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-[#1E3A8A]">#{currentUserRankSpec.rank}</span>
                  <span className="text-xs font-bold text-green-500 flex items-center">
                    <TrendingUp size={10} className="mr-0.5" /> +0
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-full shadow-md shadow-blue-900/5 border border-[#F3F4F6] flex relative">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeframe(tab.id)}
                className={`relative px-6 md:px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 z-10 ${timeframe === tab.id ? "text-white" : "text-slate-400 hover:text-[#3B82F6]"
                  }`}
              >
                {timeframe === tab.id && (
                  <motion.div
                    layoutId="activeLeaderboardTab"
                    className="absolute inset-0 rounded-full shadow-lg shadow-blue-500/30"
                    style={{ backgroundColor: COLORS.vibrantBlue }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- SEARCH & LOCATE BAR --- */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur-md border border-white shadow-sm focus:ring-2 focus:ring-[#3B82F6] focus:bg-white outline-none transition-all text-[#1E3A8A] placeholder:text-slate-400"
            />
          </div>

          <motion.button
            onClick={handleLocateMe}
            className="px-4 py-3 rounded-xl bg-white/60 backdrop-blur-md border border-white shadow-sm text-[#3B82F6] font-bold flex items-center gap-2 hover:bg-[#3B82F6] hover:text-white transition-all group"
            whileTap={{ scale: 0.95 }}
            title="Locate Me"
          >
            <Crosshair size={20} className="group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Me</span>
          </motion.button>
        </div>

        {/* Podium Display (Hidden when searching) */}
        <AnimatePresence>
          {showPodium && (
            <motion.div
              className="mt-29"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Podium topThree={topThree} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The List */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white min-h-[400px]">
          <div className="flex justify-between items-center px-4 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Rank & User</span>
            <span>Score</span>
          </div>

          <AnimatePresence mode="popLayout">
            {listData.length > 0 ? (
              <motion.div layout className="space-y-2">
                {listData.map((user, index) => (
                  <LeaderboardItem key={user.id} user={user} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 text-slate-400"
              >
                <Search size={48} className="mx-auto mb-2 opacity-20" />
                <p>No users found matching "{searchQuery}"</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show More Button (Only if not searching) */}
          {showPodium && (
            <div className="mt-6 text-center">
              <button className="text-sm font-bold text-slate-400 hover:text-[#3B82F6] transition-colors flex items-center justify-center mx-auto gap-2 group px-4 py-2 rounded-full hover:bg-[#DBEAFE]/50">
                View All Rankings
                <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard