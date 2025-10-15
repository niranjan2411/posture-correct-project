'use client'

import { useState } from 'react'
import PoseDetector from '../components/PoseDetector'
import PostureSelector from '../components/PostureSelector'
import ProgressTracker from '../components/ProgressTracker'

export default function Home() {
  const [selectedPosture, setSelectedPosture] = useState('sitting')
  const [isActive, setIsActive] = useState(false)
  const [sessionData, setSessionData] = useState([])

  const handleSessionComplete = (data) => {
    setSessionData([...sessionData, data])
    setIsActive(false)
  }

  return (
    <div className="container">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-white mb-3">
          🧘 AI Posture Correction
        </h1>
        <p className="text-xl text-white opacity-90">
          Real-time posture analysis with personalized feedback
        </p>
     <p className="text-xl text-white opacity-90">
          Created by Mehul Mansi and Aditi
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PoseDetector 
            selectedPosture={selectedPosture}
            isActive={isActive}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        <div className="space-y-6">
          <PostureSelector 
            selectedPosture={selectedPosture}
            onSelect={setSelectedPosture}
            isActive={isActive}
            onToggleActive={setIsActive}
          />
          
          <ProgressTracker sessionData={sessionData} />
        </div>
      </div>

      <footer className="text-center text-white py-8 mt-8">
        <p className="opacity-75">
          Powered by MediaPipe AI • Built with Next.js
        </p>
      </footer>
    </div>
  )
}
