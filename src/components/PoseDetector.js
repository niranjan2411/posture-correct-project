'use client'

import { useEffect, useRef, useState } from 'react'
import { PostureAnalyzer } from '../utils/postureAnalysis'
import { POSTURE_TYPES } from '../utils/postureTypes'
import RealTimeFeedback from './RealTimeFeedback'

export default function PoseDetector({ selectedPosture, isActive, onSessionComplete }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    averageScore: 0,
    poorPostureTime: 0
  })

  const poseRef = useRef(null)
  const analyzerRef = useRef(null)
  const sessionStartRef = useRef(null)
  const scoresRef = useRef([])

  useEffect(() => {
    let camera = null

    const initMediaPipe = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { Pose } = await import('@mediapipe/pose')
        const { Camera } = await import('@mediapipe/camera_utils')
        const drawingUtils = await import('@mediapipe/drawing_utils')

        const pose = new Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        })

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })

        pose.onResults((results) => {
          if (!canvasRef.current || !videoRef.current) return

          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')

          // set canvas size to video size
          const video = videoRef.current
          canvas.width = video.videoWidth || 1280
          canvas.height = video.videoHeight || 720

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // draw the incoming frame (results.image is already a HTMLImageElement/VideoFrame)
          if (results.image) {
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
          }

          if (results.poseLandmarks) {
            // draw connectors & landmarks
            try {
              drawingUtils.drawConnectors(
                ctx,
                results.poseLandmarks,
                drawingUtils.POSE_CONNECTIONS,
                { color: '#00FF00', lineWidth: 2 }
              )
              drawingUtils.drawLandmarks(
                ctx,
                results.poseLandmarks,
                { color: '#FF0000', lineWidth: 1, radius: 3 }
              )
            } catch (e) {
              // drawing_utils sometimes exposes symbols differently - safe-guard
            }

            // analyze posture if active
            if (isActive && analyzerRef.current) {
              const result = analyzerRef.current.analyzePose(results.poseLandmarks)
              setAnalysis(result)

              // push score for averaging
              scoresRef.current.push(result.score)

              if (result.score < 70) {
                setSessionStats(prev => ({
                  ...prev,
                  poorPostureTime: prev.poorPostureTime + 1
                }))
              }
            }
          } else {
            // no landmarks
            setAnalysis({ status: 'NO_DETECTION', alerts: ['No person detected'], score: 0 })
          }
        })

        poseRef.current = pose

        // start camera: attach to video element
        if (videoRef.current) {
          camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current })
              }
            },
            width: 1280,
            height: 720
          })
          await camera.start()
        }

        setIsLoading(false)
      } catch (err) {
        console.error('MediaPipe init error', err)
        setError('Failed to initialize camera. Allow camera access and refresh.')
        setIsLoading(false)
      }
    }

    initMediaPipe()

    return () => {
      if (camera) camera.stop()
      if (poseRef.current && poseRef.current.close) poseRef.current.close()
    }
  }, [])

  // update analyzer on posture change
  useEffect(() => {
    if (selectedPosture) {
      analyzerRef.current = new PostureAnalyzer(POSTURE_TYPES[selectedPosture])
    }
  }, [selectedPosture])

  // handle session start/stop and stats update interval
  useEffect(() => {
    if (isActive) {
      sessionStartRef.current = Date.now()
      scoresRef.current = []
      setSessionStats({ duration: 0, averageScore: 0, poorPostureTime: 0 })

      const interval = setInterval(() => {
        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000)
        const avgScore = scoresRef.current.length > 0
          ? Math.round(scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length)
          : 0

        setSessionStats(prev => ({ ...prev, duration, averageScore: avgScore }))
      }, 1000)

      return () => clearInterval(interval)
    } else {
      // session stopped: send session data to parent if long enough
      if (sessionStartRef.current) {
        const sessionData = {
          postureType: selectedPosture,
          duration: sessionStats.duration,
          averageScore: sessionStats.averageScore,
          poorPostureTime: sessionStats.poorPostureTime,
          timestamp: new Date().toISOString()
        }
        if (onSessionComplete && sessionStats.duration > 5) {
          onSessionComplete(sessionData)
        }
      }
      sessionStartRef.current = null
      setAnalysis(null)
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Live Camera Feed</h2>

      <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: 360 }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: 'none' }}
          playsInline
        />
        <canvas ref={canvasRef} className="w-full h-full" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
            <div className="text-center text-white">
              <div className="text-4xl mb-4 pulse">⌛</div>
              <div className="text-lg">Initializing camera...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-60">
            <div className="text-center text-white p-6">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-lg">{error}</div>
            </div>
          </div>
        )}

        {!isActive && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60">
            <div className="text-center text-white">
              <div className="text-4xl mb-4">▶</div>
              <div className="text-lg">Press "Start Session" to begin</div>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <>
          <RealTimeFeedback analysis={analysis} sessionStats={sessionStats} />

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(sessionStats.duration / 60)
                  .toString()
                  .padStart(1, '0')}
                :
                {(sessionStats.duration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{sessionStats.averageScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{sessionStats.poorPostureTime}s</div>
              <div className="text-sm text-gray-600">Poor Time</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
