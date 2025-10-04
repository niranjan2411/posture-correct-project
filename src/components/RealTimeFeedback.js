'use client'

import { useEffect, useRef } from 'react'

const correctionIcons = {
  'UNEVEN_SHOULDERS': '⚖️',
  'LEANING': '🧘',
  'TILTED_HEAD': '↔️',
  'FORWARD_HEAD': '⬆️',
  'PERFECT': '✅',
  'HIPS_NOT_VISIBLE': 'ℹ️',
  'NO_PERSON': '🤷',
  'NO_SHOULDERS': '🤷‍♀️',
}

const correctionToThresholdKey = {
  'FORWARD_HEAD': 'neckAngle',
  'LEANING': 'torsoAngle',
}

export default function RealTimeFeedback({ analysis, postureType }) {
  const lastAlertRef = useRef(0);

  useEffect(() => {
    if (analysis && analysis.status === 'POOR') {
      const now = Date.now();
      if (now - lastAlertRef.current > 5000) {
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        lastAlertRef.current = now;
      }
    }
  }, [analysis]);

  if (!analysis || !analysis.corrections) {
    return null;
  }

  const statusColor = {
    'EXCELLENT': 'text-green-600',
    'GOOD': 'text-blue-600',
    'FAIR': 'text-yellow-600',
    'POOR': 'text-red-600',
    'NO_DETECTION': 'text-gray-600'
  }[analysis.status];

  const statusBg = {
    'EXCELLENT': 'bg-green-100',
    'GOOD': 'bg-blue-100',
    'FAIR': 'bg-yellow-100',
    'POOR': 'bg-red-100',
    'NO_DETECTION': 'bg-gray-100'
  }[analysis.status];

  return (
    <div className="mt-4 space-y-3">
      <div className={`p-4 rounded-lg ${statusBg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xl font-bold ${statusColor}`}>{analysis.status}</span>
          <span className={`text-3xl font-bold ${statusColor}`}>{analysis.score}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Live Feedback:</h3>
        {analysis.corrections.map((correction) => {
          const isGood = correction.key === 'PERFECT';
          const isInfo = correction.key === 'HIPS_NOT_VISIBLE';
          const alertClass = isGood ? 'alert-success' : isInfo ? 'alert-info' : 'alert-warning';
          const thresholdKey = correctionToThresholdKey[correction.key];
          const idealRange = postureType?.thresholds[thresholdKey]?.idealRange;

          return (
            <div key={correction.key} className={`alert ${alertClass} flex items-center gap-4`}>
              <span className="text-2xl">{correctionIcons[correction.key] || '⚠️'}</span>
              <div className="flex-grow">
                <p className="font-bold">{correction.message}</p>
                {correction.value && (
                  <p className="text-xs text-gray-700 opacity-80">
                    Current: {correction.value}
                    {idealRange && ` (Ideal: ${idealRange[0]}-${idealRange[1]}°)`}
                    {correction.key === 'UNEVEN_SHOULDERS' && ` (Ideal: ±${postureType.thresholds.shoulderTilt.max}°)`}
                    {correction.key === 'TILTED_HEAD' && ` (Ideal: ±${postureType.thresholds.headTilt.max}°)`}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
