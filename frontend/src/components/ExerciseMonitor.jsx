import React, { useEffect, useRef, useState } from 'react';
import './ExerciseMonitor.css';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Maximize, Hand, Play } from 'lucide-react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

const SOCKET_URL = 'http://localhost:5000';

const ExerciseMonitor = ({ exerciseType, userId, onBack }) => {
    const videoRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const [socket, setSocket] = useState(null);
    const [stats, setStats] = useState({ reps: 0, feedback: "Raise palm to start", stage: null, completed: false, isActive: false });
    const [gestureProgress, setGestureProgress] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [cameraStatus, setCameraStatus] = useState("Initializing...");
    const [userMessage, setUserMessage] = useState("Stand back and show full body");
    const [isBodyVisible, setIsBodyVisible] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'

    useEffect(() => {
        // Initialize Socket connection
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to backend');
            setIsConnected(true);
        });

        newSocket.on('stats_update', (data) => {
            setStats(data);
            setGestureProgress(data.gestureProgress || 0);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from backend');
            setIsConnected(false);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    // MediaPipe Setup
    useEffect(() => {
        if (!videoRef.current || !socket) return;

        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.3,
            minTrackingConfidence: 0.3
        });

        pose.onResults(onResults);

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await pose.send({ image: videoRef.current });
            },
            width: 640,
            height: 480
        });

        camera.start()
            .then(() => {
                setCameraStatus("Active");
                startRecording();
            })
            .catch(err => {
                console.error("Camera error", err);
                setCameraStatus("Camera Error");
            });

        return () => {
            camera.stop();
            pose.close();
            stopRecording();
        };

        function onResults(results) {
            if (!results.poseLandmarks) {
                setIsBodyVisible(false);
                setUserMessage("No person detected");
                return;
            }

            const landmarks = results.poseLandmarks;

            // 1. Whole Body Check (Simple visibility check of key points)
            // Indices: 11=L_Shoulder, 12=R_Shoulder, 23=L_Hip, 24=R_Hip, 25=L_Knee, 26=R_Knee, 27=L_Ankle, 28=R_Ankle
            // 15=L_Wrist, 16=R_Wrist.
            const requiredIndices = [11, 12, 23, 24, 27, 28]; // Shoulders, Hips, Ankles must be visible
            const isVisible = requiredIndices.every(idx => landmarks[idx] && landmarks[idx].visibility > 0.5);

            setIsBodyVisible(isVisible);

            if (!isVisible) {
                setUserMessage("Adjust camera to view whole body");
                // We show message but still process to allow gesture detection if feasible
            } else {
                setUserMessage("");
            }

            // 2. Normalization relative to Hip
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            const hipCenterX = (leftHip.x + rightHip.x) / 2;
            const hipCenterY = (leftHip.y + rightHip.y) / 2;
            const hipCenterZ = (leftHip.z + rightHip.z) / 2;

            const normalizedLandmarks = {};
            const landmarkNames = {
                11: "left_shoulder", 12: "right_shoulder",
                13: "left_elbow", 14: "right_elbow",
                15: "left_wrist", 16: "right_wrist",
                23: "left_hip", 24: "right_hip",
                25: "left_knee", 26: "right_knee",
                27: "left_ankle", 28: "right_ankle",
                0: "nose"
            };

            for (const [idx, name] of Object.entries(landmarkNames)) {
                if (landmarks[idx]) {
                    normalizedLandmarks[name] = {
                        x: landmarks[idx].x - hipCenterX,
                        y: landmarks[idx].y - hipCenterY,
                        z: landmarks[idx].z - hipCenterZ,
                        visibility: landmarks[idx].visibility
                    };
                }
            }

            // 3. Draw on Canvas
            const canvasCtx = overlayCanvasRef.current?.getContext('2d');
            if (canvasCtx && overlayCanvasRef.current) {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);

                // Draw the image first (optional if transparent over video, but good for saving later)
                // canvasCtx.drawImage(results.image, 0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);

                // Draw skeleton
                if (results.poseLandmarks) {
                    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                        { color: '#00FF00', lineWidth: 4 });
                    drawLandmarks(canvasCtx, results.poseLandmarks,
                        { color: '#FF0000', lineWidth: 2 });
                }
                canvasCtx.restore();
            }

            // 4. Calculate Angles
            const angles = {};
            if (landmarks[11] && landmarks[13] && landmarks[15]) {
                angles['left_elbow'] = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
            }
            if (landmarks[12] && landmarks[14] && landmarks[16]) {
                angles['right_elbow'] = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
            }
            if (landmarks[23] && landmarks[25] && landmarks[27]) {
                angles['left_knee'] = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
            }
            if (landmarks[24] && landmarks[26] && landmarks[28]) {
                angles['right_knee'] = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
            }

            // 5. Emit
            if (socket.connected) {
                socket.emit('process_data', {
                    type: exerciseType,
                    landmarks: normalizedLandmarks,
                    angles: angles
                });
            }
        }
    }, [socket, exerciseType]);

    // Handle Completion
    useEffect(() => {
        if (stats.completed && !showCongrats) {
            setShowCongrats(true);
            stopRecordingAndUpload();
        }
    }, [stats.completed]);

    const handleStart = () => {
        if (socket && socket.connected) {
            socket.emit('start_exercise');
        }
    };

    const startRecording = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const options = { mimeType: 'video/webm; codecs=vp9' };

            try {
                mediaRecorderRef.current = new MediaRecorder(stream, options);
            } catch (e) {
                console.warn("VP9 not supported, trying default");
                mediaRecorderRef.current = new MediaRecorder(stream);
            }

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();
            console.log("Recording started");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log("Recording stopped");
        }
    };

    const stopRecordingAndUpload = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                await uploadVideo(blob);
            };
        }
    };

    const uploadVideo = async (videoBlob) => {
        setIsUploading(true);
        if (!userId) {
            console.error("No user ID provided for upload");
            setUploadStatus('error');
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('video', videoBlob, 'exercise_session.webm');
        formData.append('userId', userId); // Use prop
        formData.append('exerciseType', exerciseType);
        formData.append('reps', stats.reps);

        try {
            const response = await fetch('http://localhost:5000/api/upload-video', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log("Video uploaded successfully");
                setUploadStatus('success');
            } else {
                console.error("Upload failed");
                setUploadStatus('error');
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            setUploadStatus('error');
        } finally {
            setIsUploading(false);
        }
    };

    const calculateAngle = (a, b, c) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center p-4">

            {/* Header */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-white">{exerciseType}</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {isConnected ? 'AI Active' : 'Connecting...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-6 right-6 z-10 flex gap-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5 min-w-[120px] text-center">
                    <h3 className="text-5xl font-black text-white mb-1">{stats.reps}</h3>
                    <p className="text-xs text-blue-300 font-bold uppercase tracking-widest">Reps</p>
                </div>
            </div>

            {/* Camera View Container */}
            <div className="relative w-full max-w-4xl aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-700">

                {/* Video element */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover transform -scale-x-100"
                    playsInline
                    muted
                    autoPlay
                />

                {/* Canvas Overlay for MediaPipe */}
                <canvas
                    ref={overlayCanvasRef}
                    className="absolute inset-0 w-full h-full transform -scale-x-100 pointer-events-none"
                    width={640}
                    height={480}
                />

                {/* Touchless Mode Overlay (When NOT Active) */}
                {/* Control Overlay */}
                <AnimatePresence>
                    {(!stats.isActive || gestureProgress > 0) && !showCongrats && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                        >
                            {!stats.isActive ? (
                                /* START SCREEN */
                                <div className="bg-slate-900/90 p-8 rounded-3xl border border-blue-500/30 flex flex-col items-center gap-6 max-w-sm text-center shadow-2xl shadow-blue-500/10 backdrop-blur-md">
                                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 animate-pulse">
                                        <Play size={40} className="text-white ml-2" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-2">Ready to Workout?</h3>
                                        <p className="text-slate-400 text-sm mb-2">
                                            Make sure your full body is visible.
                                        </p>
                                        <div className="flex items-center gap-2 justify-center text-xs text-blue-300 bg-blue-500/10 py-1 px-3 rounded-full border border-blue-500/20">
                                            <Hand size={14} />
                                            <span>Show Palm for 5s to Finish</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleStart}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                                    >
                                        START SESSION
                                    </button>
                                </div>
                            ) : (
                                /* STOPPING FEEDBACK (Only visible if gestureProgress > 0 due to outer condition) */
                                <div className="bg-slate-900/80 p-8 rounded-3xl border border-blue-500/30 flex flex-col items-center gap-5 max-w-sm text-center shadow-2xl shadow-blue-500/10">

                                    {/* Circular Progress Ring */}
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="6" />
                                            <circle
                                                cx="50" cy="50" r="42" fill="none"
                                                stroke={gestureProgress >= 100 ? "#22c55e" : "#3b82f6"}
                                                strokeWidth="6" strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 42}`}
                                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - gestureProgress / 100)}`}
                                                style={{ transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.3s ease' }}
                                            />
                                        </svg>
                                        <motion.div
                                            className={`p-5 rounded-full ${gestureProgress > 0 ? 'bg-blue-500/30' : 'bg-blue-500/20'}`}
                                            animate={{ scale: gestureProgress > 0 ? [1, 1.05, 1] : 1 }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            {gestureProgress > 0 && gestureProgress < 100 ? (
                                                <span className="text-4xl font-black text-white">{Math.ceil(5 - (gestureProgress / 20))}</span>
                                            ) : (
                                                <Hand size={40} className="text-blue-400" />
                                            )}
                                        </motion.div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white">Ending Session...</h3>
                                    <p className="text-slate-300">
                                        Hold palm steady to finish.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Overlay */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full px-4 z-30">
                    {/* User Guidance Message */}
                    <AnimatePresence>
                        {userMessage && (
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="px-6 py-2 rounded-full bg-red-500/80 backdrop-blur-md text-white font-bold text-sm shadow-lg flex items-center gap-2"
                            >
                                <Maximize size={16} />
                                {userMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Feedback Overlay (Bottom) */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={stats.feedback} // Re-animate on feedback change
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
                >
                    <div className={`
                        px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-xl
                        flex items-center gap-3
                        ${stats.feedback.toLowerCase().includes('good') || stats.feedback.toLowerCase().includes('great') || stats.feedback.toLowerCase().includes('jump')
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-blue-500/20 text-blue-200'}
                    `}>
                        {stats.feedback.toLowerCase().includes('good') ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="text-lg font-bold">{stats.feedback}</span>
                    </div>
                </motion.div>

            </div>

            <p className="mt-6 text-slate-500 text-sm max-w-md text-center">
                AI powered exercise tracking. Privacy focused (images processed locally).
            </p>

            {/* Congrats Modal */}
            <AnimatePresence>
                {showCongrats && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#1E293B] p-8 rounded-3xl max-w-md w-full text-center border border-slate-700 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                <CheckCircle size={40} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">Session Complete!</h2>
                            <p className="text-slate-400 mb-8">
                                You crushed <span className="text-white font-bold">{stats.reps}</span> reps! Video recorded.
                            </p>

                            {isUploading && (
                                <div className="mb-6">
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 animate-progress"></div>
                                    </div>
                                    <p className="text-xs text-blue-400 font-bold uppercase mt-2">Uploading Video...</p>
                                </div>
                            )}

                            {!isUploading && uploadStatus === 'success' && (
                                <p className="text-green-400 font-bold mb-6 text-sm">Video saved successfully!</p>
                            )}

                            <button
                                onClick={onBack}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
                            >
                                Back to Dashboard
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExerciseMonitor;
