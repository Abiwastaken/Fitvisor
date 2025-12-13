"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faUsers, faSearch, faEnvelope, faPhone, faUser, faDumbbell, faVideo, faTrash, faPlay } from "@fortawesome/free-solid-svg-icons"

export default function AdminUsers({ onBack }) {
    const [users, setUsers] = useState([])
    const [exercises, setExercises] = useState([])
    const [activeTab, setActiveTab] = useState('users') // 'users' | 'exercises'
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (activeTab === 'users') fetchUsers()
        else fetchExercises()
    }, [activeTab])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await fetch("http://localhost:5000/api/users")
            if (!response.ok) throw new Error("Failed to fetch users")
            const data = await response.json()
            setUsers(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchExercises = async () => {
        setLoading(true)
        try {
            const response = await fetch("http://localhost:5000/api/exercises")
            if (!response.ok) throw new Error("Failed to fetch exercises")
            const data = await response.json()
            setExercises(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const deleteExercise = async (id) => {
        if (!confirm("Are you sure you want to delete this session?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/exercises/${id}`, { method: 'DELETE' })
            if (response.ok) {
                setExercises(exercises.filter(ex => ex.id !== id))
            }
        } catch (err) {
            alert("Failed to delete")
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredExercises = exercises.filter(ex =>
        ex.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.exercise_type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] p-6 lg:p-12 font-sans text-[#1E3A8A]">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={onBack}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1E3A8A] shadow-md hover:bg-[#3B82F6] hover:text-white transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </motion.button>
                        <div>
                            <h1 className="text-3xl font-black text-[#1E3A8A] flex items-center gap-3">
                                <FontAwesomeIcon icon={faUsers} className="text-[#3B82F6]" />
                                User Registry
                            </h1>
                            <p className="text-slate-400 font-medium">View all registered members</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-[#3B82F6] outline-none text-[#1E3A8A] font-semibold"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                    >
                        <FontAwesomeIcon icon={faUsers} className="mr-2" />
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('exercises')}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'exercises' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                    >
                        <FontAwesomeIcon icon={faDumbbell} className="mr-2" />
                        Exercises
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-6 rounded-2xl shadow-lg border border-red-100 text-center font-bold">
                        {error}
                    </div>
                ) : (
                    <motion.div
                        className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-[#DBEAFE]"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {activeTab === 'users' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F8FAFC] border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Stats (Age/H/W)</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <motion.tr
                                                    key={user.id}
                                                    variants={itemVariants}
                                                    className="hover:bg-blue-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 overflow-hidden">
                                                                {user.avatar_url ? (
                                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <FontAwesomeIcon icon={faUser} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-[#1E3A8A]">{user.name}</div>
                                                                <div className="text-xs text-slate-400">ID: #{user.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                                                <FontAwesomeIcon icon={faEnvelope} className="text-[#3B82F6] w-4" />
                                                                {user.email}
                                                            </div>
                                                            {user.phone && (
                                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                    <FontAwesomeIcon icon={faPhone} className="w-4" />
                                                                    {user.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="inline-flex gap-2">
                                                            <span className="px-2 py-1 rounded-md bg-[#F3F4F6] text-xs font-bold text-slate-600" title="Age">{user.age || "-"}y</span>
                                                            <span className="px-2 py-1 rounded-md bg-[#F3F4F6] text-xs font-bold text-slate-600" title="Height">{user.height || "-"}cm</span>
                                                            <span className="px-2 py-1 rounded-md bg-[#F3F4F6] text-xs font-bold text-slate-600" title="Weight">{user.weight || "-"}kg</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                                                            Active
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                                    No users found matching "{searchTerm}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F8FAFC] border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Exercise</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Reps</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Video</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredExercises.length > 0 ? (
                                            filteredExercises.map((ex) => (
                                                <motion.tr
                                                    key={ex.id}
                                                    variants={itemVariants}
                                                    className="hover:bg-blue-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                                                {ex.avatar_url ? <img src={ex.avatar_url} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faUser} className="text-xs" />}
                                                            </div>
                                                            <div className="text-sm font-bold text-[#1E3A8A]">{ex.user_name || "Unknown"}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600">
                                                        {ex.exercise_type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="bg-blue-100 text-[#3B82F6] px-3 py-1 rounded-full font-black text-sm">{ex.reps}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {ex.video_path ? (
                                                            <button
                                                                onClick={() => setSelectedVideo(`http://localhost:5000/uploads/${ex.video_path}`)}
                                                                className="text-[#3B82F6] hover:text-[#2563EB] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={faPlay} />
                                                                Watch
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">No Video</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-slate-400 font-semibold">
                                                        {new Date(ex.created_at).toLocaleDateString()} <br />
                                                        {new Date(ex.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => deleteExercise(ex.id)}
                                                            className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center mx-auto"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                                                    No exercises found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="bg-[#F8FAFC] px-6 py-4 border-t border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider text-right">
                            Total {activeTab === 'users' ? 'Users' : 'Sessions'}: {activeTab === 'users' ? users.length : exercises.length}
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedVideo(null)}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10"
                        >
                            <video
                                src={selectedVideo}
                                controls
                                autoPlay
                                className="w-full h-auto max-h-[80vh]"
                            />
                            <div className="p-4 bg-[#1E293B] flex justify-end">
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
