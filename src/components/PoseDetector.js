'use client'

import { useEffect, useRef, useState } from 'react'
import { PostureAnalyzer } from '../utils/postureAnalysis'
import { POSTURE_TYPES } from '../utils/postureTypes'
import RealTimeFeedback from './RealTimeFeedback'

const poseRef = { current: null };
const cameraRef = { current: null };

export default function PoseDetector({ selectedPosture, isActive, onSessionComplete }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null)
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    averageScore: 0,
    poorPostureTime: 0
  })

  const analyzerRef = useRef(null)
  const sessionStartRef = useRef(null)
  const scoresRef = useRef([])
  
  // FIX: Use a ref for analysis to prevent the timer from resetting
  const analysisRef = useRef(null);

  useEffect(() => {
    const startSession = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { Pose } = await import('@mediapipe/pose');
        const { Camera } = await import('@mediapipe/camera_utils');
        const drawingUtils = await import('@mediapipe/drawing_utils');

        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        });
        poseRef.current = pose;

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        pose.onResults((results) => {
          if (!canvasRef.current || !videoRef.current?.videoWidth) return;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            drawingUtils.drawConnectors(ctx, results.poseLandmarks, drawingUtils.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
            drawingUtils.drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
            
            if (analyzerRef.current) {
                const result = analyzerRef.current.analyzePose(results.poseLandmarks);
                setAnalysis(result);
                analysisRef.current = result; // Update the ref as well
                scoresRef.current.push(result.score);
            }
          } else {
            const noDetectionResult = { status: 'NO_DETECTION', score: 0, corrections: [{ key: 'NO_PERSON', message: 'No person detected' }] };
            setAnalysis(noDetectionResult);
            analysisRef.current = noDetectionResult;
          }
        });

        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          cameraRef.current = camera;
          await camera.start();
        }
        
        setIsLoading(false);
        sessionStartRef.current = Date.now();
        scoresRef.current = [];
        setSessionStats({ duration: 0, averageScore: 0, poorPostureTime: 0 });

      } catch (err) {
        console.error("Failed to start session:", err);
        setError("Could not start camera. Please grant permission and refresh.");
        setIsLoading(false);
      }
    };

    const stopSession = () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }

      if (sessionStartRef.current) {
        const finalDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        const finalAverageScore = scoresRef.current.length > 0
          ? Math.round(scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length)
          : 0;
        
        const finalStats = {
          duration: finalDuration,
          averageScore: finalAverageScore,
          poorPostureTime: sessionStats.poorPostureTime,
          postureType: selectedPosture,
          timestamp: new Date().toISOString()
        };

        if (onSessionComplete && finalStats.duration > 2) {
          onSessionComplete(finalStats);
        }
      }
      sessionStartRef.current = null;
      setAnalysis(null);
      analysisRef.current = null;
    };

    if (isActive) {
      startSession();
    }

    return () => {
      stopSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);


  useEffect(() => {
    if (selectedPosture) {
      analyzerRef.current = new PostureAnalyzer(POSTURE_TYPES[selectedPosture]);
    }
  }, [selectedPosture]);


  useEffect(() => {
    let sessionInterval;
    if (isActive && !isLoading) {
      sessionInterval = setInterval(() => {
        const duration = Math.floor((Date.now() - (sessionStartRef.current || 0)) / 1000);
        const avgScore = scoresRef.current.length > 0
          ? Math.round(scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length)
          : 0;
        
        // FIX: Read from the ref to prevent timer resets
        const currentStatus = analysisRef.current?.status;

        setSessionStats(prev => ({
          duration,
          averageScore: avgScore,
          poorPostureTime: (currentStatus === 'POOR') ? prev.poorPostureTime + 1 : prev.poorPostureTime
        }));
      }, 1000);
    }
    return () => clearInterval(sessionInterval);
  // The dependency array is now correct and won't cause resets
  }, [isActive, isLoading]);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Live Camera Feed</h2>
      {/* FIX: This new structure is more stable for the camera feed */}
      <div className="relative w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden aspect-[4/3]">
        <video ref={videoRef} className="absolute w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} playsInline muted />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ transform: 'scaleX(-1)' }}/>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
            <div className="text-center text-white"><div className="text-4xl mb-4 animate-pulse">🧘</div><div>Initializing AI Model...</div></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-70">
            <div className="text-center text-white p-6"><div className="text-4xl mb-4">❌</div><div>{error}</div></div>
          </div>
        )}
        {!isActive && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60">
            <div className="text-center text-white"><div className="text-4xl mb-4">▶️</div><div>Press "Start Session"</div></div>
          </div>
        )}
      </div>

      {isActive && !isLoading && (
        <>
          <RealTimeFeedback analysis={analysis} postureType={POSTURE_TYPES[selectedPosture]} />
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(sessionStats.duration / 60)}:{(sessionStats.duration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600">Duration</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{sessionStats.averageScore}%</div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{sessionStats.poorPostureTime}s</div>
              <div className="text-xs text-gray-600">Poor Time</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
