export class PostureAnalyzer {
  constructor(postureType) {
    this.thresholds = postureType.thresholds;
  }

  // Calculates the angle between three points (e.g., angle at point B for A-B-C)
  calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }
  
  // Calculates the angle of a line relative to the horizontal plane.
  // Returns a value between -90 and 90, where 0 is perfectly horizontal.
  calculateTiltAngle(a, b) {
    const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    // Normalize to a range where 0 is horizontal
    if (angle > 90) {
      return 180 - angle;
    }
    if (angle < -90) {
      return -180 - angle;
    }
    return angle;
  }

  analyzePose(landmarks) {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 33) {
      return { status: "NO_DETECTION", score: 0, corrections: [{ key: 'NO_PERSON', message: 'No person detected' }] };
    }

    const corrections = [];
    const weights = { headTilt: 30, shoulderTilt: 25, neckAngle: 25, torsoAngle: 20 };
    let totalDeductions = 0;
    let totalPossibleWeight = 0;

    // --- Landmark Visibility & Averaging ---
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    
    const shouldersVisible = leftShoulder.visibility > 0.8 && rightShoulder.visibility > 0.8;
    const hipsVisible = leftHip.visibility > 0.8 && rightHip.visibility > 0.8;

    if (!shouldersVisible) {
      return { status: "POOR", score: 0, corrections: [{ key: 'NO_SHOULDERS', message: 'Shoulders not visible. Please adjust position.' }] };
    }
    
    const avgShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const avgEar = { x: (leftEar.x + rightEar.x) / 2, y: (leftEar.y + rightEar.y) / 2 };

    // --- Calculations & Scoring (Adaptive) ---
    
    // 1. Shoulder Tilt (always calculated)
    totalPossibleWeight += weights.shoulderTilt;
    const shoulderTilt = this.calculateTiltAngle(leftShoulder, rightShoulder);
    if (Math.abs(shoulderTilt) > this.thresholds.shoulderTilt.max) {
      totalDeductions += weights.shoulderTilt;
      corrections.push({ key: 'UNEVEN_SHOULDERS', message: 'Level your shoulders', value: `${Math.round(shoulderTilt)}°` });
    }

    // 2. Head Tilt (always calculated)
    totalPossibleWeight += weights.headTilt;
    const headTilt = this.calculateTiltAngle(leftEar, rightEar) - shoulderTilt;
    if (Math.abs(headTilt) > this.thresholds.headTilt.max) {
      totalDeductions += weights.headTilt;
      corrections.push({ key: 'TILTED_HEAD', message: 'Straighten your head', value: `${Math.round(headTilt)}°` });
    }

    // 3. Neck and Torso (only if hips are visible)
    if (hipsVisible) {
      const avgHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };

      totalPossibleWeight += weights.neckAngle;
      const neckAngle = this.calculateAngle(avgEar, avgShoulder, avgHip);
      if (neckAngle < this.thresholds.neckAngle.min) {
        totalDeductions += weights.neckAngle;
        corrections.push({ key: 'FORWARD_HEAD', message: 'Bring your head back', value: `${Math.round(neckAngle)}°` });
      }

      totalPossibleWeight += weights.torsoAngle;
      const horizontalRef = { x: avgHip.x + 0.1, y: avgHip.y };
      const torsoAngle = this.calculateAngle(avgShoulder, avgHip, horizontalRef);
      if (torsoAngle < this.thresholds.torsoAngle.min || torsoAngle > this.thresholds.torsoAngle.max) {
        totalDeductions += weights.torsoAngle;
        corrections.push({ key: 'LEANING', message: 'Adjust your torso angle', value: `${Math.round(torsoAngle)}°` });
      }
    } else {
      corrections.push({ key: 'HIPS_NOT_VISIBLE', message: 'Hips not visible. Showing upper body analysis only.' });
    }

    // --- Final Score & Status ---
    const scorePercentage = totalPossibleWeight > 0 ? (totalDeductions / totalPossibleWeight) * 100 : 0;
    const finalScore = 100 - Math.round(scorePercentage);

    let status = "EXCELLENT";
    if (finalScore < 70) status = "POOR";
    else if (finalScore < 85) status = "FAIR";
    else if (finalScore < 95) status = "GOOD";

    const hasErrors = corrections.some(c => c.key !== 'HIPS_NOT_VISIBLE');
    if (!hasErrors) {
      corrections.push({ key: 'PERFECT', message: 'Great posture! Keep it up.' });
    }

    return { status, score: finalScore, corrections };
  }
}
