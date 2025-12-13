import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaPaperPlane, 
  FaHeart 
} from 'react-icons/fa';

// --- Data Configuration ---

const footerLinks = {
  product: [
    { name: 'AI Tracker', link: '#' },
    { name: 'Workout Library', link: '#' },
    { name: 'Diet Plans', link: '#' },
    { name: 'Premium', link: '#' },
  ],
  company: [
    { name: 'About Us', link: '#' },
    { name: 'Careers', link: '#' },
    { name: 'Blog', link: '#' },
    { name: 'Contact', link: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', link: '#' },
    { name: 'Terms of Service', link: '#' },
    { name: 'Cookie Policy', link: '#' },
  ]
};

const socialLinks = [
  { icon: <FaFacebookF />, link: '#' },
  { icon: <FaTwitter />, link: '#' },
  { icon: <FaInstagram />, link: '#' },
  { icon: <FaLinkedinIn />, link: '#' },
];

// --- Animation Variants ---

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Footer = () => {
  return (
    <footer className="bg-[#0B1120] text-white pt-20 pb-10 relative overflow-hidden font-sans border-t border-white/5">
      
      {/* ==========================================
          BACKGROUND ELEMENTS (Matches CTA & TechCore)
         ========================================== */}
      
      {/* 1. Breathing Glowing Orb (Positioned at bottom-left for variety, or center) */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#3B82F6] rounded-full blur-[120px] opacity-20 pointer-events-none"
      />
      
      {/* 2. Secondary Glow (Top Right) */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#1E3A8A] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      {/* 3. Noise Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Brand Section */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">
              Fit<span className="text-[#3B82F6]">Visor</span>
            </h2>
            <p className="text-blue-200/60 mb-6 leading-relaxed text-sm">
              Revolutionizing home fitness with real-time AI computer vision. Your personal trainer, available 24/7.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a 
                  key={index}
                  href={social.link}
                  whileHover={{ y: -5, backgroundColor: '#3B82F6' }}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#3B82F6] flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm border border-white/10"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* 2. Product Links */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <h3 className="text-lg font-bold mb-6 text-white">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className="text-blue-200/60 hover:text-[#3B82F6] hover:pl-2 transition-all duration-300 text-sm inline-block">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 3. Company Links */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className="text-blue-200/60 hover:text-[#3B82F6] hover:pl-2 transition-all duration-300 text-sm inline-block">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 4. Newsletter Subscription */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <h3 className="text-lg font-bold mb-6 text-white">Stay Updated</h3>
            <p className="text-blue-200/60 text-sm mb-4">
              Get the latest AI fitness tips and feature updates directly to your inbox.
            </p>
            <form className="flex flex-col gap-3">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-blue-200/30 focus:outline-none focus:border-[#3B82F6] focus:bg-white/10 transition-all backdrop-blur-sm"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#3B82F6] hover:bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Subscribe <FaPaperPlane className="text-xs" />
              </motion.button>
            </form>
          </motion.div>

        </div>

        {/* Separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-900/50 to-transparent mb-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-blue-200/40">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} FitVisor Technology. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.legal.map((item, index) => (
              <a key={index} href={item.link} className="hover:text-white transition-colors">
                {item.name}
              </a>
            ))}
          </div>
        </div>

        {/* Made with Love */}
        <div className="mt-8 text-center">
            <p className="text-xs text-blue-200/20 flex items-center justify-center gap-1">
                Built with <FaHeart className="text-red-500/80 animate-pulse" /> in Nepal
            </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;