import './globals.css'

export const metadata = {
  title: 'AI Posture Correction App',
  description: 'Real-time posture analysis and correction using AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
