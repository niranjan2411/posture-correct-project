'use client'

import { useEffect, useState } from 'react'

export default function ProgressTracker({ sessionData }) {
  const [savedSessions, setSavedSessions] = useState([])

  useEffect(() => {
    // Load saved sessions from localStorage
    const saved = localStorage.getItem('postureSessions')
    if (saved) {
      setSavedSessions(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Save new sessions to localStorage
    if (sessionData.length > 0) {
      const allSessions = [...savedSessions, ...sessionData]
      localStorage.setItem('postureSessions', JSON.stringify(allSessions))
      setSavedSessions(allSessions)
    }
  }, [sessionData])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const totalSessions = savedSessions.length
  const avgScore = totalSessions > 0
    ? Math.round(savedSessions.reduce((sum, s) => sum + s.averageScore, 0) / totalSessions)
    : 0
  const totalTime = savedSessions.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">📊 Progress Tracker</h2>
      
      {totalSessions > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{totalSessions}</div>
              <div className="text-xs text-gray-600">Sessions</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{avgScore}%</div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{formatDuration(totalTime)}</div>
              <div className="text-xs text-gray-600">Total Time</div>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            <h3 className="font-semibold text-sm text-gray-700">Recent Sessions:</h3>
            {savedSessions.slice(-5).reverse().map((session, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold">
                    {session.postureType.charAt(0).toUpperCase() + session.postureType.slice(1)}
                  </span>
                  <span className={`font-bold ${
                    session.averageScore >= 85 ? 'text-green-600' :
                    session.averageScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {session.averageScore}%
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {formatDuration(session.duration)} • {formatDate(session.timestamp)}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (confirm('Clear all session history?')) {
                localStorage.removeItem('postureSessions')
                setSavedSessions([])
              }
            }}
            className="mt-4 w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Clear History
          </button>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📈</div>
          <p>No sessions yet.</p>
          <p className="text-sm">Start a session to track your progress!</p>
        </div>
      )}
    </div>
  )
}
