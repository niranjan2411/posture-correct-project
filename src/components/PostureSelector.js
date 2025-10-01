'use client'

import { POSTURE_TYPES } from '../utils/postureTypes'

export default function PostureSelector({ selectedPosture, onSelect, isActive, onToggleActive }) {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Select Posture Type</h2>

      <div className="space-y-3 mb-6">
        {Object.entries(POSTURE_TYPES).map(([key, posture]) => (
          <button
            key={key}
            onClick={() => !isActive && onSelect(key)}
            disabled={isActive}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedPosture === key ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{posture.icon || '🧍'}</span>
              <div>
                <div className="font-semibold text-lg">{posture.name}</div>
                <div className="text-sm text-gray-600">{posture.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => onToggleActive(!isActive)}
        className={`btn w-full ${isActive ? 'btn-danger' : 'btn-primary'}`}
      >
        {isActive ? 'Stop Session' : '▶ Start Session'}
      </button>

      {selectedPosture && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Tips:</h3>
          <ul className="space-y-1 text-sm">
            {POSTURE_TYPES[selectedPosture].tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
