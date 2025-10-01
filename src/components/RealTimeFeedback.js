'use client'

import { useEffect, useRef } from 'react'

export default function RealTimeFeedback({ analysis, sessionStats }) {
  const audioRef = useRef(null)
  const lastAlertRef = useRef(0)

  useEffect(() => {
    // Play alert sound for poor posture (throttled to once every 5 seconds)
    if (analysis && analysis.status === 'POOR') {
      const now = Date.now()
      if (now - lastAlertRef.current > 5000) {
        playAlertSound()
        lastAlertRef.current = now
        
        // Vibration API for mobile devices
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200])
        }
      }
    }
  }, [analysis])

  const playAlertSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Audio playback not supported')
    }
  }

  if (!analysis) {
    return null
  }

  const statusColor = {
    'EXCELLENT': 'text-green-600',
    'GOOD': 'text-blue-600',
    'FAIR': 'text-yellow-600',
    'POOR': 'text-red-600',
    'NO_DETECTION': 'text-gray-600'
  }[analysis.status]

  const statusBg = {
    'EXCELLENT': 'bg-green-100',
    'GOOD': 'bg-blue-100',
    'FAIR': 'bg-yellow-100',
    'POOR': 'bg-red-100',
    'NO_DETECTION': 'bg-gray-100'
  }[analysis.status]

  return (
    <div className="mt-4 space-y-3">
      <div className={`p-4 rounded-lg ${statusBg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xl font-bold ${statusColor}`}>
            {analysis.status}
          </span>
          <span className={`text-3xl font-bold ${statusColor}`}>
            {analysis.score}%
          </span>
        </div>
        
        {analysis.angles && (
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Neck: {analysis.angles.neck}°</span>
            <span>Torso: {analysis.angles.torso}°</span>
            <span>Shoulder Δ: {analysis.angles.shoulderDiff}%</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {analysis.alerts.map((alert, index) => {
          const isGood = alert.includes('✅')
          const alertClass = isGood ? 'alert-success' : 'alert-warning'
          
          return (
            <div key={index} className={`alert ${alertClass}`}>
              {alert}
            </div>
          )
        })}
      </div>
    </div>
  )
}
