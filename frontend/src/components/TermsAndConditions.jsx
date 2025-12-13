import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TermsAndConditions = ({ onAccept, onLogout }) => {
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!accepted) return;
        setLoading(true);
        await onAccept();
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 relative z-50">
            {/* z-50 to ensure it's on top if using absolute positioning in App, though App structure seems to switch components */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-gray-100"
            >
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Terms & Conditions
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Please review and accept our data policy to continue using FitVisor.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                        <p>
                            <strong className="block text-gray-900 mb-1">1. Data Usage for Training</strong>
                            We use the data collected from your exercises primarily to train and refine our AI models. This helps us provide more accurate exercise detection and repetition counting.
                        </p>
                        <p>
                            <strong className="block text-gray-900 mb-1">2. Strict Privacy & Confidentiality</strong>
                            Your privacy is paramount. Your personal data is stored securely and is <span className="font-semibold text-red-500">NOT</span> accessible to developers in a personally identifiable format. We do not sell, trade, or share your data with third parties for marketing purposes.
                        </p>
                        <p>
                            <strong className="block text-gray-900 mb-1">3. Service Improvement</strong>
                            The data is solely used to maintain and improve the FitVisor platform, ensuring you get the best workout experience possible.
                        </p>
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="accept-terms"
                            name="accept-terms"
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-150 ease-in-out cursor-pointer"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="accept-terms" className="font-medium text-gray-700 cursor-pointer select-none">
                            I have read regarding the privacy policy and agree to the Terms and Conditions.
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={!accepted || loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200
              ${accepted
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5'
                                : 'bg-gray-300 cursor-not-allowed'}
              ${loading ? 'opacity-80 cursor-wait' : ''}
            `}
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {loading ? 'Processing...' : 'Accept & Continue'}
                    </button>

                    <button
                        onClick={onLogout}
                        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                        Decline & Logout
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TermsAndConditions;
