import React from 'react';
import { motion } from 'framer-motion';
import {
  FaHeartbeat,
  FaLightbulb,
  FaRocket,
  FaReact,
  FaPython,
  FaCode,
  FaDatabase,
  FaBrain,
  FaLayerGroup,
  FaGithub,
  FaLinkedin,
  FaUserCircle
} from 'react-icons/fa';
import CTASection from "./CTASection"
import TechCore from './TechCore';
// --- Data Configuration ---

const teamMembers = [
  {
    name: "Hridaya Manandhar",
    role: "Founder | Frontend, Backend & AI/ML",
    desc: "Architecting the full vision of FitVisor from pixel to algorithm.",
    color: "border-blue-500",
    image: "/hridaya.jpg"
  },
  {
    name: "Abikal Mukhiya",
    role: "AI / ML Developer",
    desc: "Optimizing computer vision models for precise exercise tracking.",
    color: "border-purple-500",
    image: "/abikal2.png"
  },
  {
    name: "Sajal Nepal",
    role: "Backend & Database Dev",
    desc: "Ensuring secure data handling and robust API architecture.",
    color: "border-green-500",
    image: "/sajal.png"
  },
  {
    name: "Ashish Chimoriya",
    role: "Database & Backend Dev",
    desc: "Managing scalable database solutions and server performance.",
    color: "border-indigo-500",
    image: "/ashish.png"
  },
];

const techFeatures = [
  {
    title: "The AI Brain",
    icon: <FaBrain />,
    techs: "Python, OpenCV, Mediapipe",
    description: "The core of FitVisor. We utilize Mediapipe's 33-point skeletal tracking combined with OpenCV to analyze human movement in real-time, calculating angles and velocity without sending video data to the cloud.",
    bg: "bg-blue-50"
  },
  {
    title: "The Interface",
    icon: <FaReact />,
    techs: "React, Framer Motion",
    description: "Built for speed and interactivity. React handles the complex state management of live workouts, while Framer Motion provides the fluid feedback loops necessary for a gamified fitness experience.",
    bg: "bg-white"
  },
  {
    title: "The Backbone",
    icon: <FaDatabase />,
    techs: "Scalable Backend & DB",
    description: "A robust backend infrastructure designed to store workout history, user metrics, and progress analytics securely, ensuring data is always available when you need it.",
    bg: "bg-gray-50"
  }
];

const timelineData = [
  { year: '2024', title: 'Idea Born', desc: 'Conceptualizing the fusion of fitness and AI for home workouts.' },
  { year: '2025', title: 'AI Prototype', desc: 'Developed real-time exercise tracking using OpenCV & Mediapipe.' },
  { year: 'Future', title: 'Expansion', desc: 'Diet systems, wearable integration, and Smart Gym Mode.' },
];

// --- Animation Variants ---

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden text-gray-800">

      {/* 1. Page Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto z-10 relative"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#1E3A8A] mb-6 tracking-tight">
            About <span className="text-[#3B82F6]">FitVisor</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto">
            Empowering smarter workouts through AI-driven technology.
          </p>
        </motion.div>

        {/* Animated Background Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute top-10 left-10 w-32 h-32 bg-[#DBEAFE] rounded-full mix-blend-multiply filter blur-2xl opacity-70"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute bottom-10 right-10 w-48 h-48 bg-[#F3F4F6] rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        />
      </section>

      {/* 2. & 3. Mission & Vision */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Mission */}
          <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-[#DBEAFE]/50 border border-[#DBEAFE] hover:bg-[#DBEAFE] transition-colors duration-300">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-[#3B82F6] text-2xl shadow-sm group-hover:scale-110 transition-transform">
              <FaHeartbeat />
            </div>
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Help everyone exercise smarter with AI. Bridging the gap between professional coaching and home workouts.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="bg-[#1E3A8A] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white text-2xl shadow-sm group-hover:scale-110 transition-transform">
              <FaLightbulb />
            </div>
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">Our Vision</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Build Nepal’s most advanced fitness tech platform. Democratizing personal training for a healthier nation.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. Team Section (Expanded) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1E3A8A] mb-4">Meet the Builders</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">The dedicated team of developers behind FitVisor's architecture.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300"
              >
                {/* Photo Placeholder */}
                <div className={`w-32 h-32 rounded-full border-4 ${member.color} p-1 mb-6 bg-white`}>
                  <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle className="text-7xl" />
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1E3A8A] mb-1">{member.name}</h3>
                <p className="text-[#3B82F6] font-semibold text-sm mb-4 h-10 flex items-center justify-center">
                  {member.role}
                </p>
                <p className="text-gray-500 text-sm mb-6 leading-snug">
                  {member.desc}
                </p>

                <div className="flex space-x-3 mt-auto">
                  <FaGithub className="text-gray-400 hover:text-[#1E3A8A] cursor-pointer text-xl transition-colors" />
                  <FaLinkedin className="text-gray-400 hover:text-[#3B82F6] cursor-pointer text-xl transition-colors" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Tech Stack (Revamped & Engaging) */}


      <TechCore />

      {/* 6. Timeline / Roadmap Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1E3A8A] mb-12 text-center">Our Journey</h2>

          <div className="relative border-l-4 border-[#3B82F6]/30 ml-4 md:ml-10 pl-8 md:pl-12 space-y-12">
            {timelineData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
                className="relative"
              >
                {/* Timeline Dot */}
                <span className="absolute -left-[46px] md:-left-[62px] top-1 bg-white border-4 border-[#3B82F6] w-6 h-6 rounded-full z-10"></span>

                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2">
                  <span className="bg-[#DBEAFE] text-[#1E3A8A] px-4 py-1 rounded-full text-sm font-bold mr-4 mb-2 sm:mb-0 shadow-sm">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                </div>
                <p className="text-gray-600 max-w-md">
                  {item.desc}
                </p>
              </motion.div>
            ))}

            {/* Future Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="absolute -left-[23px] md:-left-[23px] -bottom-10"
            >
              <FaRocket className="text-[#3B82F6] text-2xl animate-bounce" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] py-16 text-center text-white">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold mb-6">Ready to transform your fitness?</h3>
          <button className="bg-white text-[#1E3A8A] hover:bg-gray-100 px-10 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
            Explore Features
          </button>
        </motion.div>
      </div> */}
      <CTASection onStart={() => handleNavigation('dashboard')} />
    </div>
  );
};

export default AboutUs;