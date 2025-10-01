# 🧍‍♂️ Posture Correction App  
[👉 Live Demo](https://posture-correct-project.vercel.app/)  

⚠️ **Note:** This is a **fully AI-generated project**, created for **learning and educational purposes only**.  

---

## 📖 About  
This is a web-based app that helps users **detect poor posture in real time** using their device’s camera.  
It uses **MediaPipe Pose (Google)** + custom analysis logic to evaluate:  
- Head / neck angle  
- Torso leaning  
- Shoulder alignment  

It then provides **live feedback** and tracks your progress over time.  

---

## ✨ Features
- 📹 **Live camera feed** with pose landmarks overlay  
- ⚠️ **Warnings for bad posture** (forward head, leaning, uneven shoulders)  
- ✅ **Feedback when posture is correct**  
- ⏱️ Session tracking:  
  - Duration  
  - Average posture score  
  - Time spent in poor posture  
- 📊 **Progress Tracker** across sessions (stored in browser localStorage)  
- 📱 Responsive UI for **mobile and desktop**  

---

## 🪑 How to Use
1. Open the app in a modern browser (Chrome, Edge, Firefox).  
2. **Allow camera access** when prompted.  
3. Select a posture type (e.g., Sitting).  
4. Click **Start Session**.  
5. Sit **facing the camera**:
   - Keep **head, shoulders, and hips visible**.  
   - On **laptop**: sit ~arm’s length away, webcam angled to show head–waist.  
   - On **mobile**: place phone upright (portrait) ~1m away, capturing head–chest.  
6. Adjust until you see **✅ Perfect posture** feedback.  

---

## 📷 Screenshot (example)
*(Replace this with your actual screenshot)*  
![Screenshot](./screenshot.png)  

---

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) (React framework)  
- [Tailwind CSS](https://tailwindcss.com/) (styling)  
- [MediaPipe Pose](https://developers.google.com/mediapipe/solutions/vision/pose) (posture detection)  
- LocalStorage (for saving session history)  

---

## 🔄 How It Works

```mermaid
flowchart TD
    A[📷 Camera Input] --> B[MediaPipe Pose Model]
    B --> C[Landmarks Extracted (33 keypoints)]
    C --> D[Posture Analyzer (AI rules)]
    D -->|✅ Good posture| E1[Green Feedback]
    D -->|⚠️ Poor posture| E2[Warning Feedback]
    D --> F[Score Calculation]
    F --> G[📊 Progress Tracker (LocalStorage)]
    E1 --> F
    E2 --> F

    

## 🚀 Run Locally

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/posture-correct-app.git
cd posture-correct-app
npm install
npm run dev
