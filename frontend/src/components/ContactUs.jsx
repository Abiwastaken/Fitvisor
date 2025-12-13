import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaInstagram, 
  FaFacebook, 
  FaLinkedin, 
  FaWhatsapp, 
  FaEnvelope, 
  FaPaperPlane,
  FaChevronDown,
  FaChevronUp, 
  FaUser,  
  FaCheckCircle 
} from 'react-icons/fa';

const ContactUs = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success

  // --- Toggle FAQ ---
  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // --- Handle Form Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    // Simulate network request
    setTimeout(() => setFormStatus('success'), 1500);
  };

  // --- Data ---
  const faqData = [
    {
      question: "How does the AI exercise tracker work?",
      answer: "Our tracker uses your device's camera and advanced computer vision (OpenCV + Mediapipe) to analyze your movements in real-time. It compares your posture against ideal forms to provide instant feedback—no wearables required."
    },
    {
      question: "Is FitVisor free to use?",
      answer: "We offer a generous free tier that includes basic workout tracking and community features. Advanced AI analysis and personalized diet plans are available in our Premium subscription."
    },
    {
      question: "Does it work on mobile phones?",
      answer: "Yes! FitVisor is fully optimized for mobile web browsers. For the best experience with the AI camera, ensure you have good lighting and place your phone steadily."
    },
    {
      question: "How do I report an issue?",
      answer: "You can report bugs directly through this contact form, or email our support team at support@fitvisor.com. We aim to resolve technical issues within 24 hours."
    }
  ];

  // --- Animation Variants ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden text-gray-800">
      
      {/* ================= HEADER SECTION ================= */}
      <section className="relative py-20 px-6 text-center bg-[#F3F4F6]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto z-10 relative"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1E3A8A] mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 font-light">
            We’re here to help you on your fitness journey.
          </p>
          <div className="w-20 h-1 bg-[#3B82F6] mx-auto mt-6 rounded-full"></div>
        </motion.div>
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DBEAFE] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </section>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          
          {/* --- LEFT COLUMN: DARK GLASS FORM --- */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="bg-[#0B1120] p-1 rounded-3xl shadow-2xl relative overflow-hidden group h-fit"
          >
            {/* 1. Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-transparent to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* 2. Inner Card Content */}
            <div className="bg-[#0F172A] relative rounded-[22px] p-8 h-full overflow-hidden">
              
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Form Header */}
              <div className="relative z-10 mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                    <FaPaperPlane className="text-sm" />
                  </span>
                  Get in Touch
                </h2>
                <p className="text-blue-200/50 text-sm mt-2 ml-14">
                  Have a question? Our AI team is ready to help.
                </p>
              </div>

              {/* SUCCESS STATE */}
              {formStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-[300px] text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                  >
                    <FaCheckCircle />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Received!</h3>
                  <p className="text-blue-200/60 max-w-xs mx-auto">
                    Our support team will review your inquiry and respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setFormStatus('idle')}
                    className="mt-8 text-sm font-semibold text-blue-400 hover:text-white transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                /* FORM INPUTS */
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Name Input */}
                    <div className="relative group/input">
                      <label className="text-blue-200/60 text-xs uppercase font-bold tracking-wider mb-2 block">Name</label>
                      <div className="relative flex items-center">
                        <FaUser className="absolute left-4 text-blue-500/50 group-focus-within/input:text-blue-400 transition-colors" />
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1E293B] border border-blue-900/30 text-white placeholder-blue-200/20 focus:outline-none focus:bg-[#1E293B] transition-all"
                        />
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-xl ring-1 ring-blue-500/0 group-focus-within/input:ring-blue-500/50 transition-all duration-300 pointer-events-none shadow-[0_0_0_0_rgba(59,130,246,0)] group-focus-within/input:shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="relative group/input">
                      <label className="text-blue-200/60 text-xs uppercase font-bold tracking-wider mb-2 block">Email</label>
                      <div className="relative flex items-center">
                        <FaEnvelope className="absolute left-4 text-blue-500/50 group-focus-within/input:text-blue-400 transition-colors" />
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1E293B] border border-blue-900/30 text-white placeholder-blue-200/20 focus:outline-none focus:bg-[#1E293B] transition-all"
                        />
                         <div className="absolute inset-0 rounded-xl ring-1 ring-blue-500/0 group-focus-within/input:ring-blue-500/50 transition-all duration-300 pointer-events-none shadow-[0_0_0_0_rgba(59,130,246,0)] group-focus-within/input:shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="relative group/input">
                    <label className="text-blue-200/60 text-xs uppercase font-bold tracking-wider mb-2 block">Message</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="How can we help you achieve your fitness goals?"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#1E293B] border border-blue-900/30 text-white placeholder-blue-200/20 focus:outline-none focus:bg-[#1E293B] transition-all resize-none"
                    ></textarea>
                    <div className="absolute inset-0 rounded-xl ring-1 ring-blue-500/0 group-focus-within/input:ring-blue-500/50 transition-all duration-300 pointer-events-none shadow-[0_0_0_0_rgba(59,130,246,0)] group-focus-within/input:shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out skew-y-12"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                      {!formStatus && <FaPaperPlane className="text-sm opacity-70" />}
                    </span>
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: INFO, MAP, SOCIALS --- */}
          <div className="flex flex-col gap-8">
            
            {/* Info Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#DBEAFE] p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                <FaEnvelope className="text-3xl text-[#1E3A8A] mb-3" />
                <h3 className="font-bold text-[#1E3A8A]">Email Support</h3>
                <p className="text-[#3B82F6] font-medium break-all">support@fitvisor.com</p>
              </div>
              <div className="bg-[#DBEAFE] p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                <FaWhatsapp className="text-3xl text-[#1E3A8A] mb-3" />
                <h3 className="font-bold text-[#1E3A8A]">WhatsApp</h3>
                <p className="text-[#3B82F6] font-medium">+977-98XXXXXXXX</p>
              </div>
            </motion.div>

            {/* Embedded Google Map */}
            <motion.div 
              variants={fadeInUp}
              className="bg-gray-200 h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg border-4 border-white"
            >
              <iframe 
                title="FitVisor Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56516.31625951268!2d85.2911132!3d27.7089603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1680000000000!5m2!1sen!2snp" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </motion.div>

            {/* Social Media Icons */}
            <motion.div variants={fadeInUp} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-center font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Connect with us</h3>
              <div className="flex justify-center gap-6">
                {[
                  { icon: <FaInstagram />, link: "#" },
                  { icon: <FaFacebook />, link: "#" },
                  { icon: <FaLinkedin />, link: "#" },
                  { icon: <FaWhatsapp />, link: "#" }
                ].map((social, idx) => (
                  <motion.a 
                    key={idx}
                    href={social.link}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#3B82F6] text-xl hover:bg-[#3B82F6] hover:text-white transition-colors duration-300"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* ================= FAQ SECTION ================= */}
      <section className="bg-[#F3F4F6] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#1E3A8A]">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-2">Common questions about FitVisor technology.</p>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-transparent hover:border-blue-200 transition-colors"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className={`w-full px-6 py-5 flex justify-between items-center text-left transition-colors duration-300 ${
                    activeAccordion === index ? 'bg-[#DBEAFE]' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-semibold text-lg ${
                    activeAccordion === index ? 'text-[#1E3A8A]' : 'text-gray-700'
                  }`}>
                    {faq.question}
                  </span>
                  <span className={`text-[#3B82F6] transform transition-transform duration-300 ${
                    activeAccordion === index ? 'rotate-180' : 'rotate-0'
                  }`}>
                    {activeAccordion === index ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                
                <AnimatePresence>
                  {activeAccordion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 py-5 text-gray-600 border-t border-gray-100 bg-white">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactUs;