import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const LoginSignup = ({ onLoginSuccess }) => {
  // State Management
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [isForgotMode, setIsForgotMode] = useState(false)

  // Verification State
  const [isVerifyMode, setIsVerifyMode] = useState(false) // New: Shows OTP verification screen
  const [verificationCode, setVerificationCode] = useState("")

  // Reset Password State
  const [isResetMode, setIsResetMode] = useState(false) // New: Shows Code + New Pass inputs
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Inputs
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpAge, setSignUpAge] = useState("")
  const [signUpHeight, setSignUpHeight] = useState("")
  const [signUpWeight, setSignUpWeight] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")

  const [forgotEmail, setForgotEmail] = useState("")

  // 🔹 AUTH HANDLERS
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        if (onLoginSuccess) onLoginSuccess(data.user);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
          age: signUpAge,
          height: signUpHeight,
          weight: signUpWeight
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please check your email for the verification code.");
        setIsVerifyMode(true); // Switch to Verify Mode
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred.");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signUpEmail, code: verificationCode }), // Using signUpEmail as context
      });
      const data = await response.json();
      if (response.ok) {
        alert("Email verified! Please sign in.");
        setIsVerifyMode(false);
        setIsSignUpMode(false);
      } else {
        alert(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verify error:", error);
      alert("An error occurred.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Reset code sent to your email.");
        setIsResetMode(true); // Switch to Reset Mode
      } else {
        alert(data.error || "Request failed");
      }
    } catch (error) {
      console.error("Forgot Pass error:", error);
      alert("An error occurred.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: resetCode, newPassword: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Password updated! Please sign in.");
        setIsResetMode(false);
        setIsForgotMode(false);
      } else {
        alert(data.error || "Reset failed");
      }
    } catch (error) {
      console.error("Reset Pass error:", error);
      alert("An error occurred.");
    }
  };

  const isOverlayLeft = isSignUpMode || isForgotMode

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#FFFFFF] rounded-3xl shadow-2xl relative overflow-hidden w-full min-h-[600px] md:min-h-[500px]"
    >
      {/* ================= VERIFICATION MODAL ================= */}
      {isVerifyMode && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col justify-center items-center p-10">
          <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Verify Email</h1>
          <p className="text-sm text-gray-500 mb-6">Enter the code sent to {signUpEmail}</p>
          <form onSubmit={handleVerify} className="w-full max-w-sm flex flex-col items-center">
            <input
              type="text"
              placeholder="6-Digit Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-center tracking-[1em] font-bold text-lg outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase mt-4 shadow-md"
            >
              Verify Account
            </motion.button>
          </form>
        </div>
      )}

      {/* ================= RESET PASSWORD MODAL ================= */}
      {isResetMode && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col justify-center items-center p-10">
          <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Reset Password</h1>
          <p className="text-sm text-gray-500 mb-6">Enter the code from your email and new password.</p>
          <form onSubmit={handleResetPassword} className="w-full max-w-sm flex flex-col items-center">
            <input
              type="text"
              placeholder="6-Digit Code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase mt-4 shadow-md"
            >
              Update Password
            </motion.button>
            <button
              onClick={() => setIsResetMode(false)}
              type="button"
              className="text-[#1E3A8A] text-xs mt-4 hover:underline"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ================= LEFT SIDE: SIGN IN FORM ================= */}
      <div
        className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 
          w-full md:w-1/2 
          ${isOverlayLeft
            ? "opacity-0 pointer-events-none translate-x-[100%] md:translate-x-full md:opacity-0"
            : "opacity-100 pointer-events-auto translate-x-0"
          }`}
      >
        <form onSubmit={handleSignIn} className="bg-white flex items-center justify-center flex-col h-full px-8 md:px-10 text-center">
          <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Sign In</h1>
          <span className="text-xs mb-2 text-gray-500">Use your email & password</span>

          <input
            type="email"
            placeholder="Email"
            value={signInEmail}
            onChange={(e) => setSignInEmail(e.target.value)}
            required
            className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />

          <input
            type="password"
            placeholder="Password"
            value={signInPassword}
            onChange={(e) => setSignInPassword(e.target.value)}
            required
            className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />

          <button
            onClick={() => {
              setIsSignUpMode(false)
              setIsForgotMode(true)
            }}
            type="button"
            className="text-[#1E3A8A] text-xs mt-3 mb-4 hover:underline"
          >
            Forgot Your Password?
          </button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase shadow-md"
          >
            Sign In
          </motion.button>

          <div className="mt-6 md:hidden">
            <p className="text-xs text-gray-500">New here?</p>
            <button
              type="button"
              onClick={() => { setIsSignUpMode(true); setIsForgotMode(false); }}
              className="text-[#1E3A8A] font-bold text-sm mt-1 underline"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>

      {/* ================= RIGHT SIDE: SIGN UP OR FORGOT PASSWORD ================= */}
      <div
        className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 
          w-full md:w-1/2 
          ${isOverlayLeft
            ? "opacity-100 z-5 translate-x-0 md:translate-x-full"
            : "opacity-0 z-0 translate-x-[-100%] md:opacity-0"
          }`}
      >
        {isForgotMode ? (
          <form className="bg-white flex items-center justify-center flex-col h-full px-8 md:px-10 text-center">
            <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A]">Reset Password</h1>
            <p className="text-xs text-gray-500 text-center mb-3">
              Enter your email to receive a reset link
            </p>

            <input
              type="email"
              placeholder="Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />

            <motion.button
              type="button"
              onClick={handleForgotPassword}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase mt-4 shadow-md"
            >
              Send Reset Code
            </motion.button>

            <button
              onClick={() => { setIsForgotMode(false); setIsSignUpMode(false); }}
              type="button"
              className="text-[#1E3A8A] text-xs mt-4 hover:underline"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="bg-white flex items-center justify-center flex-col h-full px-8 md:px-10 text-center overflow-y-auto">
            <h1 className="text-3xl font-bold mb-4 text-[#1E3A8A] mt-8">Create Account</h1>
            <span className="text-xs mb-2 text-gray-500">Use your email to register</span>

            <input
              type="text"
              placeholder="Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />

            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />

            <div className="flex gap-2 w-full">
              <input
                type="number"
                placeholder="Age"
                value={signUpAge}
                onChange={(e) => setSignUpAge(e.target.value)}
                required
                className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
              <input
                type="number"
                placeholder="Height (cm)"
                value={signUpHeight}
                onChange={(e) => setSignUpHeight(e.target.value)}
                required
                className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={signUpWeight}
                onChange={(e) => setSignUpWeight(e.target.value)}
                required
                className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <input
              type="password"
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={signUpConfirmPassword}
              onChange={(e) => setSignUpConfirmPassword(e.target.value)}
              required
              className="bg-[#F3F4F6] my-2 p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#3B82F6] text-white text-xs py-3 px-11 rounded-lg font-semibold uppercase mt-3 shadow-md mb-8"
            >
              Sign Up
            </motion.button>

            <div className="mt-6 md:hidden">
              <p className="text-xs text-gray-500">Already have an account?</p>
              <button
                type="button"
                onClick={() => setIsSignUpMode(false)}
                className="text-[#1E3A8A] font-bold text-sm mt-1 underline"
              >
                Sign In here
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================= PANELS (DESKTOP ONLY) ================= */}
      <div
        className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out ${isOverlayLeft ? "-translate-x-full rounded-r-[150px]" : "rounded-l-[150px]"
          }`}
      >
        <div
          className={`bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white h-full relative -left-full w-[200%] transition-all duration-700 ease-in-out ${isOverlayLeft ? "translate-x-1/2" : "translate-x-0"
            }`}
        >
          {/* LEFT PANEL CONTENT */}
          <div
            className={`absolute w-1/2 h-full flex flex-col justify-center items-center px-8 text-center ${isOverlayLeft ? "translate-x-0" : "-translate-x-[200%]"
              } transition-all duration-700`}
          >
            {isForgotMode ? (
              <>
                <h1 className="text-4xl font-bold mb-5">Remembered It?</h1>
                <p className="text-sm opacity-90 mb-6">If you remembered your password, log in now.</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setIsForgotMode(false); setIsSignUpMode(false); }}
                  className="border border-white px-10 py-2 rounded-xl uppercase text-xs hover:bg-white/20 transition"
                >
                  Sign In
                </motion.button>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-5">Welcome Back!</h1>
                <p className="text-sm opacity-90 mb-6">Log in to continue your fitness journey.</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSignUpMode(false)}
                  className="border border-white px-10 py-2 rounded-xl uppercase text-xs hover:bg-white/20 transition"
                >
                  Sign In
                </motion.button>
              </>
            )}
          </div>

          {/* RIGHT PANEL CONTENT */}
          <div
            className={`absolute right-0 w-1/2 h-full flex flex-col justify-center items-center px-8 text-center transition-all duration-700 ${isOverlayLeft ? "translate-x-[200%]" : "translate-x-0"
              }`}
          >
            <h1 className="text-4xl font-bold mb-5">Join FitVisor</h1>
            <p className="text-sm opacity-90 mb-6">Create an account and start your transformation.</p>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsSignUpMode(true)
                setIsForgotMode(false)
              }}
              className="border border-white px-10 py-2 rounded-xl uppercase text-xs hover:bg-white/20 transition"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default LoginSignup