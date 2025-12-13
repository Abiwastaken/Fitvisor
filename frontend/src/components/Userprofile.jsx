"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faFire,
  faTrophy,
  faUser,
  faCalendarAlt,
  faDumbbell,
  faChartLine,
  faMedal,
  faPhone,
  faRulerVertical,
  faBirthdayCake,
  faPen,
  faSave,
  faTimes,
  faCamera,
  faEnvelope,
  faGlobe
} from "@fortawesome/free-solid-svg-icons"
import { faLinkedin, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons"

// Utility for counting up numbers
const AnimatedCounter = ({ end, duration = 1.5 }) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTime
    let animationFrame
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(end * progress))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  return count
}

export default function UserProfile({ userData, onBack, onUpdateUser }) {
  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false)

  // Initialize form data with defaults or passed props
  const [profileData, setProfileData] = useState({
    name: userData?.name || "Alex Johnson",
    email: userData?.email || "alex.j@example.com",
    age: userData?.age || "25",
    height: userData?.height || "180",
    weight: userData?.weight || "75",
    phone: userData?.phone || "+1 (555) 000-0000",
    bio: userData?.bio || "Fitness enthusiast chasing PRs and good vibes. 🌱",
    avatarUrl: userData?.avatarUrl || "", // Empty string implies default icon
    linkedin: userData?.linkedin || "",
    instagram: userData?.instagram || "",
    website: userData?.website || ""
  })

  // Mock Stats Data
  const streakDays = 7
  const totalExercises = 24
  const accuracyRate = 94
  const exerciseHistory = [
    { name: "Push-ups", date: "Dec 2, 2024", reps: 25, accuracy: 96 },
    { name: "Squats", date: "Dec 1, 2024", reps: 30, accuracy: 92 },
    { name: "Curls", date: "Nov 30, 2024", reps: 20, accuracy: 95 },
    { name: "Deadlifts", date: "Nov 29, 2024", reps: 15, accuracy: 89 },
  ]

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
        if (onUpdateUser) onUpdateUser(profileData);
        setIsEditing(false);
      } else {
        alert(data.error || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred during update.");
    }
  }

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#1E3A8A] overflow-x-hidden">

      {/* --- Top Banner Section --- */}
      <div className="relative h-64 w-full bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] overflow-hidden rounded-b-[3rem] shadow-2xl">
        <motion.div
          className="absolute -top-10 -right-10 w-64 h-64 bg-[#FFFFFF] opacity-10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-20 w-40 h-40 bg-[#DBEAFE] opacity-20 rounded-full blur-2xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 transition-all font-semibold shadow-lg"
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Dashboard</span>
          </motion.button>
        </div>
      </div>

      {/* --- Main Content Container --- */}
      <div className="max-w-5xl mx-auto px-6 -mt-32 pb-12 relative z-10">

        <AnimatePresence mode="wait">
          {!isEditing ? (
            // ================= VIEW MODE =================
            <motion.div
              key="view-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Profile Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 border border-[#DBEAFE] mb-8 relative">
                {/* Edit Button */}
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-6 right-6 p-3 rounded-full bg-[#F3F4F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-colors shadow-sm"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faPen} />
                </motion.button>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Avatar Area */}
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-[#3B82F6] border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-linear-to-br from-[#DBEAFE] to-white relative z-10">
                      {profileData.avatarUrl ? (
                        <img src={profileData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl text-[#3B82F6]">
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#1E3A8A] text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-md z-20">
                      Lvl 12
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-4xl font-black text-[#1E3A8A] mb-1 tracking-tight">
                      {profileData.name}
                    </h1>
                    <p className="text-slate-400 font-medium mb-3">{profileData.bio}</p>

                    {/* Social Links */}
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                      {profileData.linkedin && (
                        <a href={profileData.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0077B5] transition-colors"><FontAwesomeIcon icon={faLinkedin} size="lg" /></a>
                      )}
                      {profileData.instagram && (
                        <a href={profileData.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors"><FontAwesomeIcon icon={faInstagram} size="lg" /></a>
                      )}
                      {profileData.website && (
                        <a href={profileData.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#3B82F6] transition-colors"><FontAwesomeIcon icon={faGlobe} size="lg" /></a>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-[#DBEAFE] text-[#1E3A8A] text-sm font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon={faMedal} /> Pro Member
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-[#F3F4F6] text-slate-500 text-sm font-semibold">
                        Joined Dec 2024
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    {[
                      { label: "Age", value: profileData.age, icon: faBirthdayCake },
                      { label: "Height", value: `${profileData.height} cm`, icon: faRulerVertical },
                      { label: "Weight", value: `${profileData.weight} kg`, icon: faDumbbell },
                      { label: "Phone", value: "Linked", icon: faPhone },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        className="p-3 rounded-xl bg-[#F3F4F6] flex flex-col items-center justify-center min-w-[90px]"
                        whileHover={{ scale: 1.05, backgroundColor: "#DBEAFE" }}
                      >
                        <FontAwesomeIcon icon={stat.icon} className="text-[#3B82F6] mb-1 text-xs" />
                        <span className="font-bold text-[#1E3A8A]">{stat.value}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats & History (Same as before) */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: faFire, label: "Current Streak", value: streakDays, unit: "Days", color: "text-orange-500", bg: "bg-orange-50" },
                  { icon: faTrophy, label: "Total Exercises", value: totalExercises, unit: "Done", color: "text-[#3B82F6]", bg: "bg-blue-50" },
                  { icon: faChartLine, label: "Avg. Accuracy", value: accuracyRate, unit: "%", color: "text-[#1E3A8A]", bg: "bg-indigo-50" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="rounded-2xl p-6 bg-white border border-[#DBEAFE] shadow-lg shadow-blue-900/5 hover:-translate-y-1 transition-transform"
                    variants={itemVariants}
                  >
                    <div className={`inline-flex p-3 rounded-xl mb-4 ${stat.bg} ${stat.color}`}>
                      <FontAwesomeIcon icon={stat.icon} className="text-xl" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${stat.color}`}>
                        <AnimatedCounter end={stat.value} />
                      </span>
                      <span className="text-slate-400 font-semibold">{stat.unit}</span>
                    </div>
                    <p className="text-slate-400 font-medium text-sm mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* History List */}
              <motion.div
                className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 border border-[#DBEAFE]"
                variants={itemVariants}
              >
                <h2 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#DBEAFE] rounded-lg text-[#3B82F6]">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-lg" />
                  </div>
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {exerciseHistory.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-[#F3F4F6]">
                      <div>
                        <h4 className="font-bold text-[#1E3A8A]">{ex.name}</h4>
                        <p className="text-xs text-slate-400">{ex.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#3B82F6]">{ex.reps} Reps</span>
                        <div className="text-xs text-slate-400">{ex.accuracy}% Acc</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (

            // ================= EDIT MODE =================
            <motion.div
              key="edit-profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#DBEAFE]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F3F4F6]">
                <h2 className="text-2xl font-black text-[#1E3A8A]">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-6 group">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#F3F4F6] shadow-inner bg-slate-100">
                      {profileData.avatarUrl ? (
                        <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FontAwesomeIcon icon={faCamera} className="text-white text-3xl" />
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      name="avatarUrl"
                      value={profileData.avatarUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl bg-[#F3F4F6] border-none focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="col-span-1 lg:col-span-2 space-y-6">

                  {/* Identity Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2 ml-1">Full Name</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400"><FontAwesomeIcon icon={faUser} /></span>
                        <input
                          type="text" name="name" value={profileData.name} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F3F4F6] border-none focus:ring-2 focus:ring-[#3B82F6] outline-none font-semibold text-[#1E3A8A]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2 ml-1">Email</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400"><FontAwesomeIcon icon={faEnvelope} /></span>
                        <input
                          type="email" name="email" value={profileData.email} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F3F4F6] border-none focus:ring-2 focus:ring-[#3B82F6] outline-none font-semibold text-[#1E3A8A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2 ml-1">Short Bio</label>
                    <textarea
                      name="bio" rows="2" value={profileData.bio} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-[#F3F4F6] border-none focus:ring-2 focus:ring-[#3B82F6] outline-none font-medium text-[#1E3A8A] resize-none"
                    ></textarea>
                  </div>

                  {/* Stats Group */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Age</label>
                      <input type="number" name="age" value={profileData.age} onChange={handleInputChange} className="w-full text-center py-3 rounded-xl bg-[#F3F4F6] focus:ring-2 focus:ring-[#3B82F6] outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Height (cm)</label>
                      <input type="number" name="height" value={profileData.height} onChange={handleInputChange} className="w-full text-center py-3 rounded-xl bg-[#F3F4F6] focus:ring-2 focus:ring-[#3B82F6] outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Weight (kg)</label>
                      <input type="number" name="weight" value={profileData.weight} onChange={handleInputChange} className="w-full text-center py-3 rounded-xl bg-[#F3F4F6] focus:ring-2 focus:ring-[#3B82F6] outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Phone</label>
                      <input type="text" name="phone" value={profileData.phone} onChange={handleInputChange} className="w-full text-center py-3 rounded-xl bg-[#F3F4F6] focus:ring-2 focus:ring-[#3B82F6] outline-none font-bold text-xs" />
                    </div>
                  </div>

                  <div className="border-t border-[#F3F4F6] my-4"></div>

                  {/* Social Links Group */}
                  <h3 className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2">
                    <span className="p-1.5 bg-[#DBEAFE] rounded text-[#3B82F6]"><FontAwesomeIcon icon={faGlobe} /></span>
                    Social Profiles
                  </h3>

                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[#0077B5]"><FontAwesomeIcon icon={faLinkedin} size="lg" /></span>
                      <input
                        type="text" name="linkedin" value={profileData.linkedin} onChange={handleInputChange} placeholder="LinkedIn Profile URL"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F3F4F6] border-none focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[#E1306C]"><FontAwesomeIcon icon={faInstagram} size="lg" /></span>
                      <input
                        type="text" name="instagram" value={profileData.instagram} onChange={handleInputChange} placeholder="Instagram Profile URL"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F3F4F6] border-none focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400"><FontAwesomeIcon icon={faGlobe} size="lg" /></span>
                      <input
                        type="text" name="website" value={profileData.website} onChange={handleInputChange} placeholder="Personal Website / Portfolio"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F3F4F6] border-none focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 mt-8">
                    <motion.button
                      className="flex-1 py-3.5 rounded-xl bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                    >
                      <FontAwesomeIcon icon={faSave} /> Save Changes
                    </motion.button>
                    <motion.button
                      className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </motion.button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}