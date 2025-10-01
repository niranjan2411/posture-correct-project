export const POSTURE_TYPES = {
  sitting: {
    name: 'Sitting Posture',
    icon: '🪑',
    description: 'Maintain straight back while sitting',
    thresholds: {
      neckAngle: { min: 160, max: 180 },
      torsoAngle: { min: 85, max: 95 },
      shoulderAlignment: 10
    },
    tips: [
      'Keep your back straight against the chair',
      'Feet flat on the floor',
      'Screen at eye level',
      'Shoulders relaxed'
    ]
  },
  standing: {
    name: 'Standing Posture',
    icon: '🧍',
    description: 'Stand tall with aligned spine',
    thresholds: {
      neckAngle: { min: 165, max: 180 },
      torsoAngle: { min: 175, max: 185 },
      shoulderAlignment: 8
    },
    tips: [
      'Weight evenly distributed',
      'Chin parallel to ground',
      'Shoulders back and down',
      'Core engaged lightly'
    ]
  },
  working: {
    name: 'Desk Working',
    icon: '💻',
    description: 'Ergonomic desk posture',
    thresholds: {
      neckAngle: { min: 155, max: 175 },
      torsoAngle: { min: 80, max: 100 },
      shoulderAlignment: 12
    },
    tips: [
      'Keyboard at elbow height',
      'Monitor arm\'s length away',
      'Take breaks every 30 minutes',
      'Use lumbar support'
    ]
  },
  exercise: {
    name: 'Exercise Form',
    icon: '🏋️',
    description: 'Proper exercise alignment',
    thresholds: {
      neckAngle: { min: 150, max: 180 },
      torsoAngle: { min: 170, max: 190 },
      shoulderAlignment: 15
    },
    tips: [
      'Maintain neutral spine',
      'Engage core muscles',
      'Controlled movements',
      'Breathe steadily'
    ]
  }
}
