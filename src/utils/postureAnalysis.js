export class PostureAnalyzer {
  constructor(postureType) {
    this.thresholds = postureType.thresholds
    this.alerts = []
  }

  calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                    Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    
    if (angle > 180.0) {
      angle = 360 - angle
    }
    
    return angle
  }

  analyzePose(landmarks) {
    if (!landmarks || landmarks.length < 33) {
      return { status: 'NO_DETECTION', alerts: ['No person detected'], score: 0 }
    }

    this.alerts = []
    let score = 100

    // Key landmarks
    const nose = landmarks[0]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftEar = landmarks[7]
    const rightEar = landmarks[8]

    // Calculate neck angle (ear-shoulder-hip)
    const avgEar = {
      x: (leftEar.x + rightEar.x) / 2,
      y: (leftEar.y + rightEar.y) / 2
    }
    const avgShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }
    const avgHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }

    const neckAngle = this.calculateAngle(avgEar, avgShoulder, avgHip)
    
    // Calculate torso angle (shoulder-hip-vertical reference)
    const verticalRef = { x: avgHip.x, y: avgHip.y - 0.1 }
    const torsoAngle = this.calculateAngle(avgShoulder, avgHip, verticalRef)

    // Check shoulder alignment
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y) * 100

    // Evaluate neck posture
    if (neckAngle < this.thresholds.neckAngle.min) {
      this.alerts.push('⚠️ Head too far forward - move back')
      score -= 20
    } else if (neckAngle > this.thresholds.neckAngle.max) {
      this.alerts.push('⚠️ Head tilted back - look forward')
      score -= 15
    }

    // Evaluate torso posture
    if (torsoAngle < this.thresholds.torsoAngle.min) {
      this.alerts.push('⚠️ Leaning forward - sit back')
      score -= 25
    } else if (torsoAngle > this.thresholds.torsoAngle.max) {
      this.alerts.push('⚠️ Leaning backward - adjust position')
      score -= 20
    }

    // Evaluate shoulder alignment
    if (shoulderDiff > this.thresholds.shoulderAlignment) {
      this.alerts.push('⚠️ Uneven shoulders - level them')
      score -= 15
    }

    // Determine status
    let status = 'EXCELLENT'
    if (score < 70) status = 'POOR'
    else if (score < 85) status = 'FAIR'
    else if (score < 95) status = 'GOOD'

    if (this.alerts.length === 0) {
      this.alerts.push('✅ Perfect posture!')
    }

    return {
      status,
      score: Math.max(0, score),
      alerts: this.alerts,
      angles: {
        neck: Math.round(neckAngle),
        torso: Math.round(torsoAngle),
        shoulderDiff: Math.round(shoulderDiff)
      }
    }
  }

  getStatusColor(status) {
    const colors = {
      'EXCELLENT': 'text-green-600',
      'GOOD': 'text-blue-600',
      'FAIR': 'text-yellow-600',
      'POOR': 'text-red-600',
      'NO_DETECTION': 'text-gray-600'
    }
    return colors[status] || 'text-gray-600'
  }

  getStatusBackground(status) {
    const colors = {
      'EXCELLENT': 'bg-green-100',
      'GOOD': 'bg-blue-100',
      'FAIR': 'bg-yellow-100',
      'POOR': 'bg-red-100',
      'NO_DETECTION': 'bg-gray-100'
    }
    return colors[status] || 'bg-gray-100'
  }
}
