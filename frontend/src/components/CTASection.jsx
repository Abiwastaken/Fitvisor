import { motion } from "framer-motion";
import { FaRobot, FaTrophy, FaChartLine, FaArrowRight } from "react-icons/fa";

const CTASection = ({ onStart }) => {
  // Floating animation for the cards
  const floatVariant = {
    initial: { y: 0 },
    animate: (i) => ({
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: i * 0.4, // Stagger the floating
      },
    }),
  };

  return (
    <section className="relative w-full py-24 overflow-hidden bg-[#0B1120]">
      
      {/* 1. ANIMATED BACKGROUND ELEMENTS */}
      {/* Big glowing orb in the center */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6] rounded-full blur-[120px] opacity-20 pointer-events-none"
      />
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* 2. LEFT SIDE: COPY & CTA */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
            >
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]">Unlock</span> Your Peak Performance?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-blue-100/80 text-lg mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Join the elite community using AI-driven analytics to crush goals. Track progress, compete globally, and transform today.
            </motion.p>

            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden bg-white text-[#0B1120] font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Now <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent skew-x-12" />
            </motion.button>
          </div>

          {/* 3. RIGHT SIDE: INFO SHOWCASE (Floating Cards) */}
          <div className="w-full lg:w-1/2 relative h-[300px] md:h-[400px] flex items-center justify-center">
            
            {/* Card 1: AI Analytics */}
            <motion.div
              custom={0}
              variants={floatVariant}
              initial="initial"
              animate="animate"
              className="absolute top-0 left-4 md:left-10 z-20 bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-2xl shadow-xl w-48 flex items-center gap-3"
            >
              <div className="bg-blue-500/20 p-3 rounded-lg text-blue-300">
                <FaRobot size={24} />
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase font-semibold">AI Powered</p>
                <p className="text-white font-bold">Smart Tips</p>
              </div>
            </motion.div>

            {/* Card 2: Leaderboard (Center Prominent) */}
            <motion.div
              custom={1}
              variants={floatVariant}
              initial="initial"
              animate="animate"
              className="relative z-30 bg-gradient-to-br from-[#1E3A8A] to-[#172554] border border-blue-500/30 p-6 rounded-3xl shadow-2xl w-64 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-3 text-yellow-400">
                <FaTrophy size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-1">Top 1%</h4>
              <p className="text-blue-200 text-sm">Global Ranking</p>
              <div className="mt-4 w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  whileInView={{ width: "92%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-yellow-400 rounded-full" 
                />
              </div>
            </motion.div>

            {/* Card 3: Real Time Stats */}
            <motion.div
              custom={2}
              variants={floatVariant}
              initial="initial"
              animate="animate"
              className="absolute bottom-0 right-4 md:right-10 z-20 bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-2xl shadow-xl w-52 flex items-center gap-3"
            >
              <div className="bg-green-500/20 p-3 rounded-lg text-green-300">
                <FaChartLine size={24} />
              </div>
              <div>
                <p className="text-xs text-green-200 uppercase font-semibold">Real-Time</p>
                <p className="text-white font-bold">+14% Growth</p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;