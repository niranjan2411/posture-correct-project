export const POSTURE_TYPES = {
  sitting: {
    name: 'General Sitting',
    icon: '🪑',
    description: 'For maintaining a straight back while sitting.',
    thresholds: {
      neckAngle: { min: 165, idealRange: [170, 180] },
      torsoAngle: { min: 85, max: 105, idealRange: [90, 100] },
      shoulderTilt: { max: 5 }, // Stricter
      headTilt: { max: 5 }, // Stricter
    },
    tips: [
      'Sit with your back straight and shoulders relaxed.',
      'Keep your feet flat on the floor.',
      'Ensure your knees are at or slightly below hip level.',
      'Imagine a string pulling the top of your head toward the ceiling.'
    ]
  },
  standing: {
    name: 'Standing',
    icon: '🧍',
    description: 'For standing tall with an aligned spine.',
    thresholds: {
      neckAngle: { min: 170, idealRange: [175, 180] },
      torsoAngle: { min: 88, max: 92, idealRange: [89, 91] },
      shoulderTilt: { max: 5 }, // Remains strict
      headTilt: { max: 5 }, // Remains strict
    },
    tips: [
      'Stand with your weight evenly distributed on both feet.',
      'Keep your knees slightly bent, not locked.',
      'Align your head, shoulders, hips, and ankles in a straight line.',
      'Engage your core muscles to support your spine.'
    ]
  },
  working: {
    name: 'Desk Work',
    icon: '💻',
    description: 'Ergonomic posture for computer work.',
    thresholds: {
      neckAngle: { min: 160, idealRange: [165, 175] },
      torsoAngle: { min: 80, max: 105, idealRange: [90, 100] },
      shoulderTilt: { max: 5 }, // Stricter
      headTilt: { max: 5 }, // Stricter
    },
    tips: [
      'Position your monitor an arm\'s length away, with the top at eye level.',
      'Your elbows should be bent at a 90-degree angle.',
      'Use a chair with good lumbar support.',
      'Take a short break to stand and stretch every 30 minutes.'
    ]
  },
}
