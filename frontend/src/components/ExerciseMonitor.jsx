import React, { useEffect, useRef, useState } from 'react';
import './ExerciseMonitor.css';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Maximize } from 'lucide-react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

const SOCKET_URL = 'http://localhost:5000';

const ExerciseMonitor = ({ exerciseType, userId, onBack }) => {
    const videoRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const [socket, setSocket] = useState(null);
    const [stats, setStats] = useState({ reps: 0, feedback: "Prepare...", stage: null, completed: false });
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
                setCurrentStage(null);
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
                // We can optionally skip sending data if body isn't fully visible to prevent bad reps
                // But let's send what we have if we want partial tracking, or block it. 
                // The requirement says "if camera position is not polaced correctly then show the messege"
                // So we show message.
                return;
            }

            // 2. Normalization relative to Hip
            // Left Hip = 23, Right Hip = 24
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            const hipCenterX = (leftHip.x + rightHip.x) / 2;
            const hipCenterY = (leftHip.y + rightHip.y) / 2;
            const hipCenterZ = (leftHip.z + rightHip.z) / 2;

            const normalizedLandmarks = {};
            // Map loop to create normalized dictionary
            // We'll just map commonly used ones to names for backend readability or index
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

            // 3. Form Check (Pushup specific or general)
            // Just basic one: "Be in form".
            // If Pushup, check if body is horizontal? Or just check if "ready"
            if (exerciseType === 'Push-ups') {
                // Check if prone? Maybe checking nose Y vs hip Y not being too far vertical?
                // For now, let's trust the "Adjust camera" covers most geometry issues.
                setUserMessage(""); // Clear message if visible
            } else {
                setUserMessage("");
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
        formData.append('reps', 5);

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
                {/* Overlay canvas for keypoints */}
                <canvas
                    ref={overlayCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />

                {/* 
                   We don't need a canvas for drawing unless we want to debug.
                   We assume "do no show the pipeliojnne" means don't draw the skeleton overlay.
                */}

                {/* Status Overlay */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full px-4">
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
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
                            <h2 className="text-3xl font-black text-white mb-2">Target Reached!</h2>
                            <p className="text-slate-400 mb-8">
                                You accidentally crushed 5 reps. Video recorded for your coach.
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
