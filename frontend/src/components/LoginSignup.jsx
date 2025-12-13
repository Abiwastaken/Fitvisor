"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const LoginSignup = ({ onLoginSuccess }) => {
  const [isActive, setIsActive] = useState(false)
  const [isForgot, setIsForgot] = useState(false)

  // ✅ These MUST be inside the component
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")

  const handleSignIn = (e) => {
    e.preventDefault()
    console.log("Sign In:", signInEmail, signInPassword)

    if (onLoginSuccess) {
      onLoginSuccess()
    }
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    if (onLoginSuccess) {
      onLoginSuccess()
    }
  }

  const handleForgotPassword = () => {
    console.log("Reset email:", forgotEmail)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#ECEFF1] via-[#E0E7FF] to-[#CBD5E1] flex justify-center items-center">

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[#FFFFFF] rounded-3xl shadow-2xl relative overflow-hidden w-[800px] max-w-full min-h-[500px]"
      >
        {/* ================= SIGN UP FORM ================= */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${
            isActive && !isForgot ? "translate-x-full opacity-100 z-[5]" : "opacity-0 z-0"
          }`}
        >
          <form onSubmit={handleSignUp} className="bg-white flex items-center justify-center flex-col h-full px-10">
            <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Create Account</h1>
            <span className="text-xs mb-2 text-gray-500">Use your email to register</span>

            <input type="text" placeholder="Name" required className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm" />
            <input type="email" placeholder="Email" required className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm" />
            <input type="password" placeholder="Password" required className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm" />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase mt-3"
            >
              Sign Up
            </motion.button>
          </form>
        </div>

        {/* ================= SIGN IN FORM ================= */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${
            isActive || isForgot ? "translate-x-full pointer-events-none opacity-0" : "opacity-100 pointer-events-auto"
          }`}
        >
          <form onSubmit={handleSignIn} className="bg-white flex items-center justify-center flex-col h-full px-10">
            <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Sign In</h1>

            <span className="text-xs mb-2 text-gray-500">Use your email & password</span>

            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm"
            />

            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm"
            />

            <button
              onClick={() => setIsForgot(true)}
              type="button"
              className="text-[#1E3A8A] text-xs mt-3 mb-4 hover:underline"
            >
              Forgot Your Password?
            </button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase"
            >
              Sign In
            </motion.button>
          </form>
        </div>

        {/* ================= FORGOT PASSWORD FORM ================= */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${
            isForgot ? "translate-x-full opacity-100 pointer-events-auto z-[10]" : "opacity-0 pointer-events-none z-0"
          }`}
        >
          <form className="bg-white flex items-center justify-center flex-col h-full px-10">
            <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Reset Password</h1>

            <p className="text-xs text-gray-500 text-center mb-3">Enter your email to receive a reset link</p>

            <input
              type="email"
              placeholder="Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm"
            />

            <motion.button
              type="button"
              onClick={handleForgotPassword}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase mt-4"
            >
              Send Reset Link
            </motion.button>

            <button
              onClick={() => setIsForgot(false)}
              type="button"
              className="text-[#1E3A8A] text-xs mt-4 hover:underline"
            >
              Back to Sign In
            </button>
          </form>
        </div>

        {/* ================= PANELS ================= */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out ${
            isActive ? "-translate-x-full rounded-r-[150px]" : "rounded-l-[150px]"
          }`}
        >
          <div
            className={`bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white h-full relative -left-full w-[200%] transition-all duration-700 ease-in-out ${
              isActive ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* LEFT PANEL */}
            <div
              className={`absolute w-1/2 h-full flex flex-col justify-center items-center px-8 text-center ${
                isActive ? "translate-x-0" : "-translate-x-[200%]"
              } transition-all duration-700`}
            >
              <h1 className="text-4xl font-bold mb-5">Welcome Back!</h1>
              <p className="text-sm opacity-90 mb-6">Log in to continue your fitness journey.</p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsActive(false)
                  setIsForgot(false)
                }}
                className="border border-white px-10 py-2 rounded-xl uppercase text-xs hover:bg-white/20 transition"
              >
                Sign In
              </motion.button>
            </div>

            {/* RIGHT PANEL */}
            <div
              className={`absolute right-0 w-1/2 h-full flex flex-col justify-center items-center px-8 text-center transition-all duration-700 ${
                isActive ? "translate-x-[200%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-4xl font-bold mb-5">Join FitVisor</h1>
              <p className="text-sm opacity-90 mb-6">Create an account and start your transformation.</p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsActive(true)
                  setIsForgot(false)
                }}
                className="border border-white px-10 py-2 rounded-xl uppercase text-xs hover:bg-white/20 transition"
              >
                Sign Up
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginSignup
