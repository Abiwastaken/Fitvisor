import { motion } from "framer-motion";
import { FaBrain, FaReact, FaDatabase } from "react-icons/fa"; // Make sure you have react-icons installed

const TechCore = () => {
  
  // 1. DEFINE THE DATA HERE (So it is never undefined)
  const techFeatures = [
    {
      title: "AI & Computer Vision",
      techs: "TensorFlow.js + MediaPipe",
      description: "Real-time skeletal tracking directly in the browser. Our AI model analyzes 33 key body points at 30fps to ensure perfect form without sending video to a server.",
      icon: <FaBrain />,
      bg: "bg-white",
    },
    {
      title: "Reactive Frontend",
      techs: "React + Framer Motion",
      description: "A buttery smooth UI that responds instantly. We use framer-motion for physics-based animations that make the interface feel alive and engaging.",
      icon: <FaReact />,
      bg: "bg-blue-50",
    },
    {
      title: "Real-time Database",
      techs: "Supabase + PostgreSQL",
      description: "Instant data synchronization. Your leaderboard stats, workout history, and profile updates are synced across devices in milliseconds.",
      icon: <FaDatabase />,
      bg: "bg-white",
    },
  ];

  // Animation Variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
      
      {/* ==========================================
          BACKGROUND ELEMENTS
         ========================================== */}
      
      {/* Glowing Orb */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3B82F6] rounded-full blur-[120px] opacity-20 pointer-events-none"
      />

      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      {/* ==========================================
          CONTENT
         ========================================== */}
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            Our Technology Core
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg"
          >
            A sophisticated blend of Computer Vision and Web Technologies.
          </motion.p>
        </div>

        {/* 2. USE THE DATA ARRAY HERE */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {techFeatures.map((tech, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`${tech.bg} text-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group`}
            >
              {/* Background Icon Decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150 rotate-12">
                 <div className="text-9xl text-[#1E3A8A]">{tech.icon}</div>
              </div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#3B82F6] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-blue-500/30">
                  {tech.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#1E3A8A] mb-2">{tech.title}</h3>
                <div className="text-xs font-mono font-bold text-[#3B82F6] mb-4 bg-blue-100 inline-block px-3 py-1 rounded-full uppercase tracking-wider">
                  {tech.techs}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {tech.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechCore;