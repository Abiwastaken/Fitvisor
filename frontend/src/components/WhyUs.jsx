import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Activity,
  ClipboardList,
  TrendingUp,
  Smartphone,
  ScanLine,
  Sparkles,
  Dumbbell,
  Utensils
} from 'lucide-react';

// --- Configuration & Data ---

const features = [
  {
    id: 1,
    title: "AI Posture Correction",
    description: "Instant feedback on your form using advanced skeletal tracking to prevent injuries.",
    icon: <Activity className="w-8 h-8" />,
  },
  {
    id: 2,
    title: "Real-time Rep Counting",
    description: "Focus on your effort, not the numbers. Our AI counts every rep with precision.",
    icon: <ScanLine className="w-8 h-8" />,
  },
  {
    id: 3,
    title: "Personalized Workouts",
    description: "Adaptive routines generated specifically for your fitness level and goals.",
    icon: <ClipboardList className="w-8 h-8" />,
  },
  {
    id: 4,
    title: "Progress Dashboard",
    description: "Visualize your gains with detailed charts, streak tracking, and performance metrics.",
    icon: <TrendingUp className="w-8 h-8" />,
  },
  {
    id: 5,
    title: "Clean & Intuitive UI",
    description: "A distraction-free interface designed to get you into your workout faster.",
    icon: <Smartphone className="w-8 h-8" />,
  },
  {
    id: 6,
    title: "Precision Motion Detect",
    description: "Powered by Mediapipe & OpenCV for laboratory-grade movement analysis.",
    icon: <Camera className="w-8 h-8" />,
  },
];

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  },
};

// --- API Helper ---

const generateGeminiContent = async (prompt, systemPrompt) => {
  try {
    const response = await fetch("http://localhost:8000/api/ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system_prompt: systemPrompt }),
    })

    if (!response.ok) {
      const data = await response.json()
      if (response.status === 429) {
        return "⚠️ AI quota temporarily exceeded. This feature will be available again soon. Please try a simpler request or check back later."
      }
      throw new Error(data.error || `Server Error: ${response.status}`)
    }

    const data = await response.json()
    // Backend returns { result: "..." } or { error: "..." }
    if (data.error) {
      throw new Error(data.error)
    }
    return data.result || "No response received."

  } catch (error) {
    console.error("AI Request Failed:", error)
    return "Unable to connect to the AI Coach. Please try again later."
  }
}

// --- Main Component ---

const WhyUs = () => {
  // State for AI Demos
  const [workoutInput, setWorkoutInput] = useState('');
  const [workoutResult, setWorkoutResult] = useState('');
  const [isWorkoutLoading, setIsWorkoutLoading] = useState(false);

  const [nutritionInput, setNutritionInput] = useState('');
  const [nutritionResult, setNutritionResult] = useState('');
  const [isNutritionLoading, setIsNutritionLoading] = useState(false);

  // Handlers
  const handleWorkoutGen = async () => {
    if (!workoutInput.trim()) return;
    setIsWorkoutLoading(true);
    setWorkoutResult('');

    const systemPrompt = "You are an expert fitness coach. Create a concise, high-intensity workout routine based on the user's available time and equipment. Use bullet points. Keep it under 150 words. Be encouraging.";
    const result = await generateGeminiContent(`Create a workout for: ${workoutInput}`, systemPrompt);

    setWorkoutResult(result);
    setIsWorkoutLoading(false);
  };

  const handleNutritionGen = async () => {
    if (!nutritionInput.trim()) return;
    setIsNutritionLoading(true);
    setNutritionResult('');

    const systemPrompt = "You are a certified nutritionist. Give a short, scientific, but easy-to-understand answer to the user's question. Keep it under 100 words.";
    const result = await generateGeminiContent(`Nutrition question: ${nutritionInput}`, systemPrompt);

    setNutritionResult(result);
    setIsNutritionLoading(false);
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-[#F3F4F6] overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-[#1E3A8A] mb-4"
          >
            Why Choose FitVisor?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-gray-600"
          >
            Experience the next generation of fitness with our AI-powered tracking engine.
            We turn your webcam into a personal trainer.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="bg-white rounded-2xl p-8 transition-shadow duration-300 shadow-md border border-[#DBEAFE] hover:border-[#3B82F6]"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#DBEAFE] text-[#3B82F6]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- AI Demo Section --- */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#DBEAFE]">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#DBEAFE] text-[#1E3A8A] px-4 py-1 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Demo</span>
            </div>
            <h3 className="text-3xl font-bold text-[#1E3A8A] mb-4">Experience the AI Advantage</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              FitVisor isn't just about tracking; it's about intelligence. Try our Gemini-powered modules below to see how we personalize your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Feature 1: AI Workout Architect */}
            <div className="bg-[#F3F4F6] rounded-2xl p-6 md:p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#3B82F6] p-2 rounded-lg text-white">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#1E3A8A]">AI Workout Architect</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Tell us your available time and equipment (e.g., "15 mins, no equipment").
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={workoutInput}
                  onChange={(e) => setWorkoutInput(e.target.value)}
                  placeholder="E.g., 30 mins, dumbbell only, focus on abs"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all"
                />
                <button
                  onClick={handleWorkoutGen}
                  disabled={isWorkoutLoading}
                  className="w-full bg-[#1E3A8A] text-white font-semibold py-3 rounded-xl hover:bg-[#3B82F6] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isWorkoutLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Designing Plan...
                    </>
                  ) : 'Generate Routine ✨'}
                </button>
              </div>

              {/* Output Area */}
              <div className="mt-6 min-h-[150px] bg-white rounded-xl p-4 border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                {workoutResult || (
                  <span className="text-gray-400 italic">
                    Your personalized AI routine will appear here...
                  </span>
                )}
              </div>
            </div>

            {/* Feature 2: Smart Nutritionist */}
            <div className="bg-[#DBEAFE] rounded-2xl p-6 md:p-8 border border-[#3B82F6]">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#1E3A8A] p-2 rounded-lg text-white">
                  <Utensils className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#1E3A8A]">Smart Nutritionist</h4>
              </div>
              <p className="text-sm text-[#1E3A8A]/70 mb-4">
                Ask a quick question about diet, pre-workout meals, or hydration.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={nutritionInput}
                  onChange={(e) => setNutritionInput(e.target.value)}
                  placeholder="E.g., What should I eat before a run?"
                  className="w-full px-4 py-3 rounded-xl border border-[#3B82F6]/30 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all bg-white"
                />
                <button
                  onClick={handleNutritionGen}
                  disabled={isNutritionLoading}
                  className="w-full bg-[#3B82F6] text-white font-semibold py-3 rounded-xl hover:bg-[#1E3A8A] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isNutritionLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Consulting AI...
                    </>
                  ) : 'Get Advice ✨'}
                </button>
              </div>

              {/* Output Area */}
              <div className="mt-6 min-h-[150px] bg-white/60 rounded-xl p-4 border border-[#3B82F6]/20 text-sm text-[#1E3A8A] whitespace-pre-wrap">
                {nutritionResult || (
                  <span className="text-[#1E3A8A]/50 italic">
                    Expert nutrition insights will appear here...
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>


      </div>
    </section>
  );
};

export default WhyUs;